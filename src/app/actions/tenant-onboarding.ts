"use server";

import { revalidatePath } from "next/cache";
import { ensureSchema, pool } from "@/lib/db";
import { readTenantSession } from "@/lib/tenant/session";
import { runMonitoringCycle } from "@/lib/monitoring/pipeline";
import { trackEvent } from "@/lib/outreach/cdp";

export type OnboardingState =
  | { ok: true; message?: string }
  | { ok: false; message: string }
  | undefined;

export async function createSourceAndTestAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };

  const name = (formData.get("name") as string)?.trim();
  const kind = (formData.get("kind") as string)?.trim() || "http_api";
  const url = (formData.get("url") as string)?.trim();

  if (!name) return { ok: false, message: "Name is required." };
  if (!url) return { ok: false, message: "URL is required." };

  try {
    await ensureSchema();
    const config = { url };
    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO data_sources (product_id, kind, name, config, rate_limit_per_hour)
       VALUES ($1::uuid, $2, $3, $4::jsonb, 60)
       RETURNING id::text AS id`,
      [session.productId, kind, name, JSON.stringify(config)],
    );
    const sourceId = rows[0]?.id;
    if (!sourceId) return { ok: false, message: "Failed to create source." };

    const { createDataSource } = await import("@/lib/monitoring/datasource");
    const connector = createDataSource(kind);
    const result = await connector.fetch({ sourceId, productId: session.productId, config });
    const observations = await connector.normalize(result, { sourceId, productId: session.productId, config });

    for (const obs of observations.slice(0, 5)) {
      await pool.query(
        `INSERT INTO observations (data_source_id, product_id, observed_at, dimensions, measures, fetch_duration_ms)
         VALUES ($1::uuid, $2::uuid, $3, $4::jsonb, $5::jsonb, $6)`,
        [sourceId, session.productId, obs.observed_at, JSON.stringify(obs.dimensions), JSON.stringify(obs.measures), result.fetch_duration_ms],
      );
    }

    await pool.query(
      `UPDATE data_sources SET last_fetch_at = NOW(), last_fetch_status = 'ok' WHERE id = $1::uuid`,
      [sourceId],
    );

    revalidatePath(`/product/${session.productSlug}`);
    return { ok: true, message: `Source created and tested — ${observations.length} data point(s) fetched in ${result.fetch_duration_ms}ms.` };
  } catch (err) {
    console.error("[onboarding:createSource] failed:", err);
    return { ok: false, message: `Failed: ${(err as Error).message}` };
  }
}

export async function createQuickRuleAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };

  const name = (formData.get("name") as string)?.trim();
  const field = (formData.get("field") as string)?.trim();
  const condType = (formData.get("condition_type") as string) || "threshold";
  const operator = (formData.get("operator") as string) || "gt";
  const value = formData.get("value") as string;

  if (!name || !field) return { ok: false, message: "Name and field are required." };

  try {
    await ensureSchema();
    const config = { field, operator, value: isNaN(Number(value)) ? value : Number(value) };
    await pool.query(
      `INSERT INTO alert_rules (product_id, name, condition_type, condition_config, notify_channels, throttle_minutes)
       VALUES ($1::uuid, $2, $3, $4::jsonb, '["email"]'::jsonb, 60)`,
      [session.productId, name, condType, JSON.stringify(config)],
    );
    revalidatePath(`/product/${session.productSlug}`);
    return { ok: true, message: "Alert rule created." };
  } catch (err) {
    console.error("[onboarding:createRule] failed:", err);
    return { ok: false, message: `Failed: ${(err as Error).message}` };
  }
}

export async function completeOnboardingAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };

  try {
    await ensureSchema();
    await pool.query(
      `UPDATE tenants SET onboarding_completed_at = NOW() WHERE id = $1::uuid AND product_id = $2::uuid`,
      [session.tenantId, session.productId],
    );
    revalidatePath(`/product/${session.productSlug}`);
    trackEvent({ product_id: session.productId, event: "activation", distinct_id: session.email, person_id: session.tenantId, properties: { step: "onboarding_complete" } }).catch(() => {});
    return { ok: true, message: "Onboarding complete!" };
  } catch (err) {
    console.error("[onboarding:complete] failed:", err);
    return { ok: false, message: "Failed to complete onboarding." };
  }
}
