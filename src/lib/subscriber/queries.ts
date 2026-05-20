import "server-only";
import { pool } from "@/lib/db";

export type SubscriberProduct = {
  id: string;
  slug: string;
  name: string;
  status: string;
  mrr_eur: number;
  users_count: number;
  build_step: number;
  build_total_steps: number;
  current_step_label: string | null;
  phase: string;
  created_at: string;
};

export type SubscriberFinancialSummary = {
  total_revenue_eur: number;
  total_cost_eur: number;
  net_margin_eur: number;
  products_total: number;
  products_live: number;
};

export async function listProductsForSubscriber(
  userId: string,
): Promise<SubscriberProduct[]> {
  const { rows } = await pool.query<SubscriberProduct>(
    `SELECT p.id::text AS id, p.slug, p.name, p.status,
            p.mrr_eur::int AS mrr_eur, p.users_count::int AS users_count,
            p.build_step::int AS build_step, p.build_total_steps::int AS build_total_steps,
            p.current_step_label, p.phase,
            p.created_at::text AS created_at
       FROM products p
      WHERE p.owner_user_id = $1::uuid
      ORDER BY p.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function getSubscriberFinancialSummary(
  userId: string,
): Promise<SubscriberFinancialSummary> {
  const { rows } = await pool.query<{
    total_revenue: string;
    total_cost: string;
    products_total: string;
    products_live: string;
  }>(
    `SELECT
       COALESCE(SUM(p.monthly_revenue_eur), 0)::text AS total_revenue,
       COALESCE(SUM(p.estimated_monthly_opex_eur), 0)::text AS total_cost,
       COUNT(*)::text AS products_total,
       COUNT(*) FILTER (WHERE p.status = 'live')::text AS products_live
     FROM products p
     WHERE p.owner_user_id = $1::uuid`,
    [userId],
  );
  const row = rows[0];
  const revenue = parseFloat(row?.total_revenue ?? "0");
  const cost = parseFloat(row?.total_cost ?? "0");
  return {
    total_revenue_eur: revenue,
    total_cost_eur: cost,
    net_margin_eur: revenue - cost,
    products_total: parseInt(row?.products_total ?? "0", 10),
    products_live: parseInt(row?.products_live ?? "0", 10),
  };
}
