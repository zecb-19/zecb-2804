import "server-only";
import { pool } from "@/lib/db";

export type PortfolioProduct = {
  id: string;
  slug: string;
  name: string;
  template_id: string;
  template_version: string;
  status: "building" | "live" | "paused" | "killed";
  phase: string;
  phase_updated_at: string | null;
  mrr_eur: number;
  users_count: number;
  growth_30d: number;
  estimated_monthly_opex_eur: number;
  build_cost_eur: number;
  monthly_agent_cost_eur: number;
  agent_runs_count: number;
  created_at: string;
  updated_at: string;
  age_days: number;
};

export async function listPortfolioProducts(
  userId: string,
): Promise<PortfolioProduct[]> {
  const { rows } = await pool.query<{
    id: string;
    slug: string;
    name: string;
    template_id: string;
    template_version: string;
    status: string;
    phase: string;
    phase_updated_at: string | null;
    mrr_eur: string;
    users_count: string;
    growth_30d: string;
    estimated_monthly_opex_eur: string;
    build_cost_eur: string;
    monthly_agent_cost_eur: string;
    agent_runs_count: string;
    created_at: string;
    updated_at: string;
    age_days: string;
  }>(
    `SELECT
        p.id::text AS id,
        p.slug,
        p.name,
        p.template_id,
        COALESCE(p.template_version, '1.0.0') AS template_version,
        p.status,
        p.phase,
        p.phase_updated_at::text AS phase_updated_at,
        COALESCE(p.mrr_eur, 0)::text AS mrr_eur,
        COALESCE(p.users_count, 0)::text AS users_count,
        COALESCE(p.growth_30d, 0)::text AS growth_30d,
        COALESCE(p.estimated_monthly_opex_eur, 0)::text AS estimated_monthly_opex_eur,
        COALESCE(bc.build_cost_eur, 0)::text AS build_cost_eur,
        COALESCE(mc.monthly_agent_cost_eur, 0)::text AS monthly_agent_cost_eur,
        COALESCE(bc.agent_runs_count, 0)::text AS agent_runs_count,
        p.created_at::text AS created_at,
        COALESCE(p.updated_at, p.created_at)::text AS updated_at,
        EXTRACT(DAY FROM NOW() - p.created_at)::text AS age_days
      FROM products p
      LEFT JOIN LATERAL (
        SELECT COALESCE(SUM(a.cost_eur), 0) AS build_cost_eur,
               COUNT(*) AS agent_runs_count
          FROM agent_runs a
         WHERE a.product_id = p.id
      ) bc ON true
      LEFT JOIN LATERAL (
        SELECT COALESCE(SUM(a.cost_eur), 0) AS monthly_agent_cost_eur
          FROM agent_runs a
         WHERE a.product_id = p.id
           AND a.created_at >= date_trunc('month', NOW())
      ) mc ON true
     WHERE p.owner_user_id = $1::uuid
     ORDER BY
       CASE p.status
         WHEN 'live' THEN 1
         WHEN 'building' THEN 2
         WHEN 'paused' THEN 3
         ELSE 4
       END,
       p.created_at DESC`,
    [userId],
  );

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    template_id: r.template_id,
    template_version: r.template_version,
    status: r.status as PortfolioProduct["status"],
    phase: r.phase,
    phase_updated_at: r.phase_updated_at,
    mrr_eur: Number(r.mrr_eur),
    users_count: Number(r.users_count),
    growth_30d: Number(r.growth_30d),
    estimated_monthly_opex_eur: Number(r.estimated_monthly_opex_eur),
    build_cost_eur: Number(r.build_cost_eur),
    monthly_agent_cost_eur: Number(r.monthly_agent_cost_eur),
    agent_runs_count: Number(r.agent_runs_count),
    created_at: r.created_at,
    updated_at: r.updated_at,
    age_days: Number(r.age_days),
  }));
}

export type PortfolioSummary = {
  total_products: number;
  live_products: number;
  building_products: number;
  paused_products: number;
  killed_products: number;
  total_mrr_eur: number;
  total_users: number;
  total_build_cost_eur: number;
  monthly_opex_eur: number;
  platform_opex_cap_eur: number;
};

export type ProductPnL = {
  id: string;
  slug: string;
  name: string;
  status: string;
  age_days: number;
  mrr_eur: number;
  total_revenue_eur: number;
  llm_cost_eur: number;
  infra_cost_eur: number;
  outreach_spend_eur: number;
  total_cost_eur: number;
  net_margin_eur: number;
  net_margin_pct: number;
  breakeven_achieved: boolean;
};

export async function getPortfolioPnL(userId: string): Promise<ProductPnL[]> {
  const { rows } = await pool.query<{
    id: string; slug: string; name: string; status: string; age_days: string;
    mrr_eur: string; total_revenue: string; llm_cost: string;
    infra_cost: string; outreach_spend: string;
  }>(
    `SELECT
       p.id::text, p.slug, p.name, p.status,
       EXTRACT(DAY FROM NOW() - p.created_at)::text AS age_days,
       COALESCE(p.mrr_eur, 0)::text AS mrr_eur,
       COALESCE(p.monthly_revenue_eur, 0)::text AS total_revenue,
       COALESCE(ac.llm_cost, 0)::text AS llm_cost,
       COALESCE(p.infra_cost_eur, 0)::text AS infra_cost,
       COALESCE(p.outreach_spend_eur, 0)::text AS outreach_spend
     FROM products p
     LEFT JOIN LATERAL (
       SELECT COALESCE(SUM(cost_eur), 0) AS llm_cost FROM agent_runs WHERE product_id = p.id
     ) ac ON TRUE
     WHERE p.owner_user_id = $1::uuid
     ORDER BY p.status = 'live' DESC, p.created_at DESC`,
    [userId],
  );
  return rows.map((r) => {
    const revenue = Number(r.total_revenue);
    const llm = Number(r.llm_cost);
    const infra = Number(r.infra_cost);
    const outreach = Number(r.outreach_spend);
    const totalCost = llm + infra + outreach;
    const margin = revenue - totalCost;
    return {
      id: r.id, slug: r.slug, name: r.name, status: r.status,
      age_days: Number(r.age_days),
      mrr_eur: Number(r.mrr_eur),
      total_revenue_eur: revenue,
      llm_cost_eur: llm, infra_cost_eur: infra, outreach_spend_eur: outreach,
      total_cost_eur: totalCost,
      net_margin_eur: margin,
      net_margin_pct: revenue > 0 ? (margin / revenue) * 100 : 0,
      breakeven_achieved: margin >= 0 && revenue > 0,
    };
  });
}

export function computePortfolioSummary(
  products: PortfolioProduct[],
): PortfolioSummary {
  const summary: PortfolioSummary = {
    total_products: products.length,
    live_products: 0,
    building_products: 0,
    paused_products: 0,
    killed_products: 0,
    total_mrr_eur: 0,
    total_users: 0,
    total_build_cost_eur: 0,
    monthly_opex_eur: 0,
    platform_opex_cap_eur: 15_000,
  };

  for (const p of products) {
    switch (p.status) {
      case "live":
        summary.live_products++;
        break;
      case "building":
        summary.building_products++;
        break;
      case "paused":
        summary.paused_products++;
        break;
      case "killed":
        summary.killed_products++;
        break;
    }
    summary.total_mrr_eur += p.mrr_eur;
    summary.total_users += p.users_count;
    summary.total_build_cost_eur += p.build_cost_eur;
    summary.monthly_opex_eur += p.monthly_agent_cost_eur;
  }

  return summary;
}
