"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/dal";
import { ensureSchema, pool } from "@/lib/db";
import { generateMarketSignalReports } from "@/lib/ideas/architect";
import {
  GenerationRequestSchema,
  type GenerateIdeasErrors,
  type GenerateIdeasState,
  type IdeaStatus,
  type ReviewIdeaState,
} from "@/lib/ideas/definitions";

function fieldErrors(err: ZodError): GenerateIdeasErrors {
  const out: GenerateIdeasErrors = {};
  for (const issue of err.issues) {
    const k = issue.path[0];
    if (k === "verticals" || k === "region" || k === "capital_cap_eur" || k === "notes") {
      (out[k] ??= []).push(issue.message);
    } else {
      (out._form ??= []).push(issue.message);
    }
  }
  return out;
}

export async function generateIdeasAction(
  _prev: GenerateIdeasState,
  formData: FormData,
): Promise<GenerateIdeasState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Your session has expired. Please sign in again." };
  }

  const parsed = GenerationRequestSchema.safeParse({
    verticals: formData.get("verticals"),
    region: formData.get("region") ?? "DACH",
    capital_cap_eur: Number(formData.get("capital_cap_eur") ?? 500),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const generationRequestId = randomUUID();

  let result;
  try {
    result = await generateMarketSignalReports(parsed.data);
  } catch (err) {
    console.error("[generateIdeasAction] LLM failed:", err);
    return {
      ok: false,
      message:
        err instanceof Error
          ? `Architect Agent error: ${err.message}`
          : "Architect Agent failed.",
    };
  }

  try {
    await ensureSchema();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const idea of result.response.ideas) {
        await client.query(
          `INSERT INTO market_signal_reports
            (owner_user_id, generation_request_id, vertical, persona,
             opportunity, pain_statement, core_promise, mechanism,
             suggested_slug, suggested_data_sources, suggested_alert_primitives,
             suggested_notification_channels, suggested_pricing_tiers,
             unit_economics, tam_estimate, reasoning,
             llm_model, cost_eur, status)
           VALUES
            ($1::uuid, $2::uuid, $3, $4::jsonb,
             $5, $6, $7, $8,
             $9, $10::jsonb, $11::jsonb,
             $12::jsonb, $13::jsonb,
             $14::jsonb, $15, $16,
             $17, $18, 'pending')`,
          [
            user.id,
            generationRequestId,
            idea.vertical,
            JSON.stringify(idea.persona),
            idea.opportunity,
            idea.pain_statement,
            idea.core_promise,
            idea.mechanism,
            idea.suggested_slug,
            JSON.stringify(idea.suggested_data_sources),
            JSON.stringify(idea.suggested_alert_primitives),
            JSON.stringify(idea.suggested_notification_channels),
            JSON.stringify(idea.suggested_pricing_tiers),
            JSON.stringify(idea.unit_economics),
            idea.tam_estimate,
            idea.reasoning,
            result.model,
            // Allocate the LLM cost evenly across the 3 ideas.
            Number((result.cost_eur / 3).toFixed(6)),
          ],
        );
      }

      // Single agent_runs entry for the whole generation, attributing total cost.
      await client.query(
        `INSERT INTO agent_runs
           (product_id, owner_user_id, agent, task_name, input, status, cost_eur, llm_model)
         VALUES
           (NULL, $4::uuid, 'Architect Agent', 'market_signal_report_generation',
            $1::jsonb, 'ok', $2, $3)`,
        [
          JSON.stringify({
            generation_request_id: generationRequestId,
            verticals: parsed.data.verticals,
            region: parsed.data.region,
            ideas_count: result.response.ideas.length,
          }),
          result.cost_eur,
          result.model,
          user.id,
        ],
      );

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[generateIdeasAction] persist failed:", err);
    return { ok: false, message: "Could not persist ideas. Please try again." };
  }

  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard");
  return {
    ok: true,
    generation_request_id: generationRequestId,
    cost_eur: result.cost_eur,
  };
}

async function setStatus(
  userId: string,
  ideaId: string,
  status: Extract<IdeaStatus, "approved" | "rejected">,
  note: string,
): Promise<ReviewIdeaState> {
  try {
    const result = await pool.query<{ id: string }>(
      `UPDATE market_signal_reports
          SET status = $1,
              reviewer_note = $2,
              reviewed_at = NOW()
        WHERE id = $3::uuid
          AND owner_user_id = $4::uuid
          AND status = 'pending'
        RETURNING id::text AS id`,
      [status, note || null, ideaId, userId],
    );
    if (result.rows.length === 0) {
      return { ok: false, message: "Idea not found or already reviewed." };
    }
    revalidatePath("/dashboard/inbox");
    return { ok: true, id: ideaId, status };
  } catch (err) {
    console.error("[reviewIdea] failed:", err);
    return { ok: false, message: "Could not update idea." };
  }
}

export async function approveIdeaAction(
  _prev: ReviewIdeaState,
  formData: FormData,
): Promise<ReviewIdeaState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Session expired." };
  const id = formData.get("idea_id");
  const note = (formData.get("reviewer_note") as string) ?? "";
  if (typeof id !== "string") return { ok: false, message: "Missing idea id." };
  return setStatus(user.id, id, "approved", note);
}

export async function rejectIdeaAction(
  _prev: ReviewIdeaState,
  formData: FormData,
): Promise<ReviewIdeaState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Session expired." };
  const id = formData.get("idea_id");
  const note = (formData.get("reviewer_note") as string) ?? "";
  if (typeof id !== "string") return { ok: false, message: "Missing idea id." };
  return setStatus(user.id, id, "rejected", note);
}

/**
 * Marks an idea as 'promoted' and redirects to the BuildSpec form
 * pre-filled from this idea via the ?from search param.
 */
export async function promoteIdeaAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }
  const id = formData.get("idea_id");
  if (typeof id !== "string" || id.length === 0) {
    redirect("/dashboard/inbox");
  }

  try {
    await pool.query(
      `UPDATE market_signal_reports
          SET status = 'promoted',
              reviewed_at = COALESCE(reviewed_at, NOW())
        WHERE id = $1::uuid
          AND owner_user_id = $2::uuid`,
      [id, user.id],
    );
    revalidatePath("/dashboard/inbox");
  } catch (err) {
    console.error("[promoteIdea] failed:", err);
  }

  redirect(`/dashboard/buildspec?from=${encodeURIComponent(id)}`);
}
