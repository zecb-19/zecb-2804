import "server-only";
import { pool } from "@/lib/db";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  template: string;
  template_version: string;
  status: "building" | "live" | "paused" | "killed";
  build_step: number;
  build_total_steps: number;
  current_step_label: string | null;
  estimated_monthly_opex_eur: string | null;
  created_at: string;
  updated_at: string;
};

export type AgentRunRow = {
  id: string;
  product_id: string | null;
  product_slug: string | null;
  agent: string;
  task_name: string;
  status: string;
  llm_model: string | null;
  cost_eur: string;
  created_at: string;
};

const PRODUCT_COLUMNS = `
  p.id::text                         AS id,
  p.slug                             AS slug,
  p.name                             AS name,
  p.template_id                      AS template,
  COALESCE(p.template_version, '1.0.0') AS template_version,
  p.status                           AS status,
  COALESCE(p.build_step, 1)          AS build_step,
  COALESCE(p.build_total_steps, 11)  AS build_total_steps,
  p.current_step_label               AS current_step_label,
  p.estimated_monthly_opex_eur::text AS estimated_monthly_opex_eur,
  p.created_at::text                 AS created_at,
  COALESCE(p.updated_at, p.created_at)::text AS updated_at
`;

export async function listProductsForUser(userId: string): Promise<ProductRow[]> {
  const { rows } = await pool.query<ProductRow>(
    `SELECT ${PRODUCT_COLUMNS}
       FROM products p
      WHERE p.owner_user_id = $1::uuid
      ORDER BY p.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function listActiveBuildsForUser(
  userId: string,
  limit = 6,
): Promise<ProductRow[]> {
  const { rows } = await pool.query<ProductRow>(
    `SELECT ${PRODUCT_COLUMNS}
       FROM products p
      WHERE p.owner_user_id = $1::uuid
        AND p.status = 'building'
      ORDER BY p.created_at DESC
      LIMIT $2`,
    [userId, limit],
  );
  return rows;
}

export async function listRecentAgentRunsForUser(
  userId: string,
  limit = 12,
): Promise<AgentRunRow[]> {
  const { rows } = await pool.query<AgentRunRow>(
    `SELECT a.id::text          AS id,
            a.product_id::text  AS product_id,
            p.slug              AS product_slug,
            a.agent             AS agent,
            a.task_name         AS task_name,
            a.status            AS status,
            a.llm_model         AS llm_model,
            a.cost_eur::text    AS cost_eur,
            a.created_at::text  AS created_at
       FROM agent_runs a
       LEFT JOIN products p ON p.id = a.product_id
      WHERE p.owner_user_id = $1::uuid
      ORDER BY a.created_at DESC
      LIMIT $2`,
    [userId, limit],
  );
  return rows;
}

export async function countProductsByStatus(
  userId: string,
): Promise<{ building: number; live: number; paused: number; killed: number }> {
  const { rows } = await pool.query<{ status: string; n: string }>(
    `SELECT status, COUNT(*)::text AS n
       FROM products
      WHERE owner_user_id = $1::uuid
      GROUP BY status`,
    [userId],
  );
  const out = { building: 0, live: 0, paused: 0, killed: 0 };
  for (const r of rows) {
    if (r.status in out) {
      (out as Record<string, number>)[r.status] = Number(r.n);
    }
  }
  return out;
}
