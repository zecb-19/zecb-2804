import "server-only";
import { pool } from "@/lib/db";
import { DEFAULT_SPEC, type BuildSpec } from "@/lib/builds/definitions";
import type { IdeaRow, IdeaStatus } from "./definitions";

const COLUMNS = `
  id::text                        AS id,
  owner_user_id::text             AS owner_user_id,
  generation_request_id::text     AS generation_request_id,
  vertical, persona, opportunity, pain_statement, core_promise, mechanism,
  suggested_slug,
  suggested_data_sources, suggested_alert_primitives,
  suggested_notification_channels, suggested_pricing_tiers,
  unit_economics, tam_estimate, reasoning, llm_model,
  cost_eur::text                  AS cost_eur,
  status, reviewer_note,
  reviewed_at::text               AS reviewed_at,
  promoted_to_product_id::text    AS promoted_to_product_id,
  created_at::text                AS created_at
`;

export async function listIdeasForUser(userId: string): Promise<IdeaRow[]> {
  const { rows } = await pool.query<IdeaRow>(
    `SELECT ${COLUMNS} FROM market_signal_reports
      WHERE owner_user_id = $1::uuid
      ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}

export async function getIdeaById(
  userId: string,
  id: string,
): Promise<IdeaRow | null> {
  const { rows } = await pool.query<IdeaRow>(
    `SELECT ${COLUMNS} FROM market_signal_reports
      WHERE owner_user_id = $1::uuid AND id = $2::uuid
      LIMIT 1`,
    [userId, id],
  );
  return rows[0] ?? null;
}

/**
 * Map a MarketSignalReport into an initial BuildSpec the form can hydrate from.
 * Tier limits stay at the defaults; price + name come from the idea.
 */
export function ideaToBuildSpec(idea: IdeaRow): BuildSpec {
  const fallbackTiers = DEFAULT_SPEC.pricing_tiers;
  const tiers =
    idea.suggested_pricing_tiers.length > 0
      ? idea.suggested_pricing_tiers.slice(0, 4).map((t, i) => ({
          name: t.name,
          price_eur_monthly: t.price_eur_monthly,
          annual_discount_pct: 17,
          limits:
            fallbackTiers[i]?.limits ??
            fallbackTiers[fallbackTiers.length - 1].limits,
        }))
      : fallbackTiers;

  const productName = idea.opportunity
    .split(/[—–:.,]/)[0]
    .trim()
    .slice(0, 80) || (idea.suggested_slug ?? "New product");

  return {
    product_slug: idea.suggested_slug ?? "",
    product_name: productName,
    tagline: idea.core_promise.slice(0, 140),
    data_sources:
      idea.suggested_data_sources.length > 0
        ? idea.suggested_data_sources.map((d) => ({
            type: d.type,
            config: { url: "" },
            rate_limit_per_hour: 60,
            auth_required: false,
          }))
        : DEFAULT_SPEC.data_sources,
    alert_primitives:
      idea.suggested_alert_primitives.length > 0
        ? idea.suggested_alert_primitives
        : DEFAULT_SPEC.alert_primitives,
    notification_channels:
      idea.suggested_notification_channels.length > 0
        ? idea.suggested_notification_channels
        : DEFAULT_SPEC.notification_channels,
    pricing_tiers: tiers,
    branding: {
      name: productName,
      logo_ref: "",
      palette: { ...DEFAULT_SPEC.branding.palette },
    },
    onboarding: { mode: "self_serve" },
    integrations_requested: ["stripe", "postmark"],
  };
}

export async function countIdeasByStatus(
  userId: string,
): Promise<Record<IdeaStatus, number>> {
  const { rows } = await pool.query<{ status: string; n: string }>(
    `SELECT status, COUNT(*)::text AS n
       FROM market_signal_reports
      WHERE owner_user_id = $1::uuid
      GROUP BY status`,
    [userId],
  );
  const out: Record<IdeaStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    promoted: 0,
  };
  for (const r of rows) {
    if (r.status in out) out[r.status as IdeaStatus] = Number(r.n);
  }
  return out;
}
