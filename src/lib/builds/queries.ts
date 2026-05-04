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

/**
 * Products parked at step 11 awaiting operator launch approval (HITL gate).
 */
export async function listLaunchApprovalsForUser(
  userId: string,
  limit = 10,
): Promise<ProductRow[]> {
  const { rows } = await pool.query<ProductRow>(
    `SELECT ${PRODUCT_COLUMNS}
       FROM products p
      WHERE p.owner_user_id = $1::uuid
        AND p.status = 'building'
        AND COALESCE(p.build_step, 1) >= COALESCE(p.build_total_steps, 11)
      ORDER BY COALESCE(p.updated_at, p.created_at) DESC
      LIMIT $2`,
    [userId, limit],
  );
  return rows;
}

/**
 * Sum of `agent_runs.cost_eur` (in EUR) for the current calendar month,
 * across this user's products and their own Architect-Agent runs.
 */
export async function sumMonthlyCostForUser(
  userId: string,
): Promise<{ total_eur: number; run_count: number }> {
  const { rows } = await pool.query<{ total_eur: string; run_count: string }>(
    `SELECT COALESCE(SUM(a.cost_eur), 0)::text AS total_eur,
            COUNT(*)::text                      AS run_count
       FROM agent_runs a
       LEFT JOIN products p ON p.id = a.product_id
      WHERE a.created_at >= date_trunc('month', NOW())
        AND (p.owner_user_id = $1::uuid
             OR (a.product_id IS NULL AND a.owner_user_id = $1::uuid))`,
    [userId],
  );
  const r = rows[0];
  return {
    total_eur: Number(r.total_eur ?? 0),
    run_count: Number(r.run_count ?? 0),
  };
}

// --- Audit Trail filters --------------------------------------------------

export type AgentRunFilters = {
  agent?: string;
  product_slug?: string;
  status?: "ok" | "failed" | "all";
  since?: "1h" | "24h" | "7d" | "30d" | "all";
  limit?: number;
  offset?: number;
};

export type AuditRunRow = AgentRunRow & {
  input: unknown;
  output: unknown;
  error_message: string | null;
};

export async function listAgentRunsFiltered(
  userId: string,
  filters: AgentRunFilters = {},
): Promise<AuditRunRow[]> {
  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);
  const offset = Math.max(filters.offset ?? 0, 0);

  const wheres: string[] = [
    "(p.owner_user_id = $1::uuid OR (a.product_id IS NULL AND a.owner_user_id = $1::uuid))",
  ];
  const params: unknown[] = [userId];

  if (filters.agent && filters.agent !== "all") {
    params.push(filters.agent);
    wheres.push(`a.agent = $${params.length}`);
  }
  if (filters.product_slug && filters.product_slug !== "all") {
    params.push(filters.product_slug);
    wheres.push(`p.slug = $${params.length}`);
  }
  if (filters.status === "ok" || filters.status === "failed") {
    if (filters.status === "ok") {
      wheres.push(`a.status IN ('ok', 'success')`);
    } else {
      wheres.push(`a.status NOT IN ('ok', 'success')`);
    }
  }
  if (filters.since && filters.since !== "all") {
    const map: Record<string, string> = {
      "1h": "1 hour",
      "24h": "24 hours",
      "7d": "7 days",
      "30d": "30 days",
    };
    const interval = map[filters.since];
    if (interval) {
      wheres.push(`a.created_at >= NOW() - INTERVAL '${interval}'`);
    }
  }

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const { rows } = await pool.query<AuditRunRow>(
    `SELECT a.id::text          AS id,
            a.product_id::text  AS product_id,
            p.slug              AS product_slug,
            a.agent             AS agent,
            a.task_name         AS task_name,
            a.status            AS status,
            a.llm_model         AS llm_model,
            a.cost_eur::text    AS cost_eur,
            a.input             AS input,
            a.output            AS output,
            a.error_message     AS error_message,
            a.created_at::text  AS created_at
       FROM agent_runs a
       LEFT JOIN products p ON p.id = a.product_id
      WHERE ${wheres.join(" AND ")}
      ORDER BY a.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params,
  );
  return rows;
}

export async function listDistinctAgentsForUser(
  userId: string,
): Promise<string[]> {
  const { rows } = await pool.query<{ agent: string }>(
    `SELECT DISTINCT a.agent
       FROM agent_runs a
       LEFT JOIN products p ON p.id = a.product_id
      WHERE p.owner_user_id = $1::uuid
         OR (a.product_id IS NULL AND a.owner_user_id = $1::uuid)
      ORDER BY a.agent`,
    [userId],
  );
  return rows.map((r) => r.agent);
}

// --- Launch Approval review data -------------------------------------------

export type LaunchReviewProduct = ProductRow & {
  branding: Record<string, unknown> | null;
  pricing_tiers: Array<Record<string, unknown>> | null;
  build_spec: Record<string, unknown> | null;
  build_cost_eur: number;
  agent_runs: Array<{
    agent: string;
    task_name: string;
    status: string;
    cost_eur: string;
    llm_model: string | null;
    created_at: string;
  }>;
};

export async function listLaunchReviewsForUser(
  userId: string,
): Promise<LaunchReviewProduct[]> {
  const { rows: products } = await pool.query<
    ProductRow & {
      branding: string | null;
      pricing_tiers: string | null;
    }
  >(
    `SELECT ${PRODUCT_COLUMNS},
            p.branding::text           AS branding,
            p.pricing_tiers::text      AS pricing_tiers
       FROM products p
      WHERE p.owner_user_id = $1::uuid
        AND p.status = 'building'
        AND COALESCE(p.build_step, 1) >= COALESCE(p.build_total_steps, 11)
      ORDER BY COALESCE(p.updated_at, p.created_at) DESC`,
    [userId],
  );

  if (products.length === 0) return [];

  const results: LaunchReviewProduct[] = [];
  for (const product of products) {
    const { rows: specRows } = await pool.query<{ spec_json: string }>(
      `SELECT spec_json::text AS spec_json
         FROM build_specs
        WHERE product_id = $1::uuid
        ORDER BY version DESC
        LIMIT 1`,
      [product.id],
    );

    const { rows: runRows } = await pool.query<{
      agent: string;
      task_name: string;
      status: string;
      cost_eur: string;
      llm_model: string | null;
      created_at: string;
    }>(
      `SELECT agent, task_name, status,
              cost_eur::text AS cost_eur,
              llm_model,
              created_at::text AS created_at
         FROM agent_runs
        WHERE product_id = $1::uuid
        ORDER BY created_at ASC`,
      [product.id],
    );

    const totalCost = runRows.reduce(
      (sum, r) => sum + Number(r.cost_eur || 0),
      0,
    );

    let branding: Record<string, unknown> | null = null;
    let pricingTiers: Array<Record<string, unknown>> | null = null;
    let buildSpec: Record<string, unknown> | null = null;

    try {
      if (product.branding) branding = JSON.parse(product.branding);
    } catch { /* */ }
    try {
      if (product.pricing_tiers) pricingTiers = JSON.parse(product.pricing_tiers);
    } catch { /* */ }
    try {
      if (specRows[0]?.spec_json) buildSpec = JSON.parse(specRows[0].spec_json);
    } catch { /* */ }

    results.push({
      ...product,
      branding,
      pricing_tiers: pricingTiers,
      build_spec: buildSpec,
      build_cost_eur: totalCost,
      agent_runs: runRows,
    });
  }
  return results;
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
