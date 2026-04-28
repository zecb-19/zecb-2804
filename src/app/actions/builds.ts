"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/dal";
import {
  BuildSpecSchema,
  type CreateBuildErrors,
  type CreateBuildFailure,
  type CreateBuildState,
} from "@/lib/builds/definitions";
import { ensureSchema, pool } from "@/lib/db";

export type ApproveBuildState =
  | { ok: true; productId: string }
  | { ok: false; message: string }
  | undefined;

const KEY_TO_TOP: Record<string, keyof CreateBuildErrors> = {
  product_slug: "product_slug",
  product_name: "product_name",
  tagline: "tagline",
  data_sources: "data_sources",
  alert_primitives: "alert_primitives",
  notification_channels: "notification_channels",
  pricing_tiers: "pricing_tiers",
  branding: "branding",
  integrations_requested: "integrations_requested",
};

function fieldErrors(err: ZodError): CreateBuildErrors {
  const out: CreateBuildErrors = {};
  for (const issue of err.issues) {
    const root = issue.path[0];
    if (typeof root === "string" && KEY_TO_TOP[root]) {
      const key = KEY_TO_TOP[root];
      const list = (out[key] ??= []);
      list.push(issue.message);
    } else {
      (out._form ??= []).push(issue.message);
    }
  }
  return out;
}

function fail(failure: Omit<CreateBuildFailure, "ok">): CreateBuildFailure {
  return { ok: false, ...failure };
}

export async function createBuildAction(
  _prev: CreateBuildState,
  formData: FormData,
): Promise<CreateBuildState> {
  const user = await getCurrentUser();
  if (!user) {
    return fail({ message: "Your session has expired. Please sign in again." });
  }

  const raw = formData.get("payload");
  if (typeof raw !== "string" || raw.length === 0) {
    return fail({
      errors: { payload: ["Form payload was empty — please try again."] },
    });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return fail({
      errors: { payload: ["Form payload was not valid JSON."] },
    });
  }

  const parsed = BuildSpecSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return fail({ errors: fieldErrors(parsed.error) });
  }
  const spec = parsed.data;

  try {
    await ensureSchema();

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const productInsert = await client.query<{ id: string }>(
        `INSERT INTO products
           (slug, name, tagline, template_id, template_version, status,
            build_step, build_total_steps, current_step_label,
            owner_user_id, palette, branding, pricing_tiers,
            estimated_monthly_opex_eur)
         VALUES
           ($1, $2, $3, 'monitoring-saas', '1.0.0', 'building',
            1, 11, 'Schema validation',
            $4::uuid, $5::jsonb, $6::jsonb, $7::jsonb,
            NULL)
         RETURNING id::text AS id`,
        [
          spec.product_slug,
          spec.branding.name || spec.product_name,
          spec.tagline || null,
          user.id,
          JSON.stringify(spec.branding.palette),
          JSON.stringify(spec.branding),
          JSON.stringify(spec.pricing_tiers),
        ],
      );
      const productId = productInsert.rows[0].id;

      await client.query(
        `INSERT INTO build_specs (product_id, version, spec_json)
         VALUES ($1::uuid, 1, $2::jsonb)`,
        [productId, JSON.stringify(spec)],
      );

      await client.query(
        `INSERT INTO agent_runs
           (product_id, agent, task_name, input, status, cost_eur)
         VALUES
           ($1::uuid, 'Build Orchestrator', 'schema_validation',
            $2::jsonb, 'ok', 0)`,
        [productId, JSON.stringify({ slug: spec.product_slug })],
      );

      await client.query("COMMIT");

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/pipeline");

      return {
        ok: true,
        product: { id: productId, slug: spec.product_slug },
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      return fail({
        errors: {
          product_slug: ["A product with this slug already exists."],
        },
      });
    }
    console.error("[createBuildAction] failed:", err);
    return fail({
      message: "Could not dispatch the build. Please try again.",
    });
  }
}

/**
 * HITL approval for step 11 (PRD §7.2). Flips a `building` product whose
 * pipeline has reached the gate to `'live'` and writes the audit-trail
 * agent_run. Acceptance criterion A-10: no agent path bypasses this.
 */
export async function approveBuildAction(
  _prev: ApproveBuildState,
  formData: FormData,
): Promise<ApproveBuildState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Your session has expired. Please sign in again." };
  }
  const productId = formData.get("product_id");
  if (typeof productId !== "string" || productId.length === 0) {
    return { ok: false, message: "Missing product id." };
  }

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const lookup = await client.query<{
        id: string;
        slug: string;
        build_step: number;
        build_total_steps: number;
        status: string;
      }>(
        `SELECT id::text AS id, slug,
                COALESCE(build_step, 1) AS build_step,
                COALESCE(build_total_steps, 11) AS build_total_steps,
                status
           FROM products
          WHERE id = $1::uuid AND owner_user_id = $2::uuid
          FOR UPDATE`,
        [productId, user.id],
      );
      const row = lookup.rows[0];
      if (!row) {
        await client.query("ROLLBACK");
        return { ok: false, message: "Product not found in your portfolio." };
      }
      if (row.status !== "building") {
        await client.query("ROLLBACK");
        return {
          ok: false,
          message: `Cannot approve — product is already ${row.status}.`,
        };
      }
      if (row.build_step < row.build_total_steps) {
        await client.query("ROLLBACK");
        return {
          ok: false,
          message: `Pipeline is still on step ${row.build_step} of ${row.build_total_steps}. Approval unlocks at step ${row.build_total_steps}.`,
        };
      }

      await client.query(
        `UPDATE products
            SET status = 'live',
                phase = 'ignition',
                phase_updated_at = NOW(),
                updated_at = NOW()
          WHERE id = $1::uuid`,
        [row.id],
      );

      await client.query(
        `INSERT INTO agent_runs
           (product_id, agent, task_name, input, status, cost_eur)
         VALUES
           ($1::uuid, 'Release Agent', 'launch_approved',
            $2::jsonb, 'ok', 0)`,
        [
          row.id,
          JSON.stringify({
            slug: row.slug,
            approved_by: user.id,
            approved_at: new Date().toISOString(),
          }),
        ],
      );

      await client.query("COMMIT");

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/pipeline");
      revalidatePath("/dashboard/launches");

      return { ok: true, productId: row.id };
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch {
        /* swallow */
      }
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[approveBuildAction] failed:", err);
    return { ok: false, message: "Could not approve. Please try again." };
  }
}
