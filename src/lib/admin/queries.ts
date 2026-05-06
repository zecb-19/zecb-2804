import "server-only";
import { pool } from "@/lib/db";

export type SystemStats = {
  total_users: number;
  total_products: number;
  live_products: number;
  total_agent_runs: number;
  total_cost_eur: number;
  total_templates: number;
  total_patterns: number;
  total_ideas: number;
  total_unsubscribes: number;
  total_consent_entries: number;
};

export async function getSystemStats(): Promise<SystemStats> {
  const queries = await Promise.all([
    pool.query<{ n: string }>("SELECT COUNT(*)::text AS n FROM users"),
    pool.query<{ total: string; live: string }>(
      `SELECT COUNT(*)::text AS total,
              COUNT(*) FILTER (WHERE status = 'live')::text AS live
         FROM products`,
    ),
    pool.query<{ n: string; cost: string }>(
      `SELECT COUNT(*)::text AS n, COALESCE(SUM(cost_eur), 0)::text AS cost
         FROM agent_runs`,
    ),
    pool.query<{ n: string }>("SELECT COUNT(*)::text AS n FROM templates"),
    pool.query<{ n: string }>("SELECT COUNT(*)::text AS n FROM patterns"),
    pool.query<{ n: string }>("SELECT COUNT(*)::text AS n FROM market_signal_reports"),
    pool.query<{ n: string }>("SELECT COUNT(*)::text AS n FROM unsubscribes"),
    pool.query<{ n: string }>("SELECT COUNT(*)::text AS n FROM consent_ledger"),
  ]);

  return {
    total_users: Number(queries[0].rows[0]?.n ?? 0),
    total_products: Number(queries[1].rows[0]?.total ?? 0),
    live_products: Number(queries[1].rows[0]?.live ?? 0),
    total_agent_runs: Number(queries[2].rows[0]?.n ?? 0),
    total_cost_eur: Number(queries[2].rows[0]?.cost ?? 0),
    total_templates: Number(queries[3].rows[0]?.n ?? 0),
    total_patterns: Number(queries[4].rows[0]?.n ?? 0),
    total_ideas: Number(queries[5].rows[0]?.n ?? 0),
    total_unsubscribes: Number(queries[6].rows[0]?.n ?? 0),
    total_consent_entries: Number(queries[7].rows[0]?.n ?? 0),
  };
}

export type UserListRow = {
  id: string;
  email: string;
  name: string;
  company: string | null;
  role: string;
  subscription_status: string;
  subscription_tier: string | null;
  products_count: number;
  created_at: string;
  last_login_at: string | null;
};

export async function listAllUsers(
  search?: string,
  limit = 50,
): Promise<UserListRow[]> {
  const params: unknown[] = [limit];
  let whereClause = "";

  if (search) {
    params.push(`%${search}%`);
    whereClause = `WHERE u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.company ILIKE $${params.length}`;
  }

  const { rows } = await pool.query<{
    id: string;
    email: string;
    name: string;
    company: string | null;
    role: string;
    subscription_status: string;
    subscription_tier: string | null;
    products_count: string;
    created_at: string;
    last_login_at: string | null;
  }>(
    `SELECT u.id::text AS id, u.email, u.name, u.company, u.role,
            u.subscription_status, u.subscription_tier,
            COALESCE(pc.cnt, 0)::text AS products_count,
            u.created_at::text AS created_at,
            u.last_login_at::text AS last_login_at
       FROM users u
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS cnt FROM products WHERE owner_user_id = u.id
       ) pc ON true
       ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $1`,
    params,
  );

  return rows.map((r) => ({
    ...r,
    products_count: Number(r.products_count),
  }));
}
