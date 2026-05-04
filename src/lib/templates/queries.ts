import "server-only";
import { pool } from "@/lib/db";

export type ArtifactStatus = {
  name: string;
  status: "complete" | "in_progress" | "not_started";
  description: string;
};

export type TemplateExample = {
  name: string;
  description: string;
};

export type TemplateRow = {
  id: string;
  name: string;
  version: string;
  status: string;
  tier: string;
  description: string | null;
  identity: string | null;
  core_workflow: string | null;
  governance_notes: string | null;
  eval_pass_rate: number | null;
  created_at: string;
  updated_at: string;
  artifacts: ArtifactStatus[];
  supported_examples: TemplateExample[];
  products_total: number;
  products_live: number;
  products_building: number;
  total_build_cost_eur: number;
};

export async function listTemplates(): Promise<TemplateRow[]> {
  const { rows } = await pool.query<{
    id: string;
    name: string;
    version: string;
    status: string;
    tier: string;
    description: string | null;
    identity: string | null;
    core_workflow: string | null;
    governance_notes: string | null;
    eval_pass_rate: number | null;
    created_at: string;
    updated_at: string;
    artifacts: string;
    supported_examples: string;
    products_total: string;
    products_live: string;
    products_building: string;
    total_build_cost_eur: string;
  }>(
    `SELECT t.id,
            t.name,
            t.version,
            t.status,
            t.tier,
            t.description,
            t.identity,
            t.core_workflow,
            t.governance_notes,
            t.eval_pass_rate,
            t.created_at::text AS created_at,
            t.updated_at::text AS updated_at,
            t.artifacts::text AS artifacts,
            t.supported_examples::text AS supported_examples,
            COALESCE(ps.products_total, 0)::text AS products_total,
            COALESCE(ps.products_live, 0)::text AS products_live,
            COALESCE(ps.products_building, 0)::text AS products_building,
            COALESCE(cs.total_build_cost_eur, 0)::text AS total_build_cost_eur
       FROM templates t
       LEFT JOIN LATERAL (
         SELECT COUNT(*)                                     AS products_total,
                COUNT(*) FILTER (WHERE p.status = 'live')    AS products_live,
                COUNT(*) FILTER (WHERE p.status = 'building') AS products_building
           FROM products p
          WHERE p.template_id = t.id
       ) ps ON true
       LEFT JOIN LATERAL (
         SELECT COALESCE(SUM(a.cost_eur), 0) AS total_build_cost_eur
           FROM agent_runs a
           JOIN products p ON p.id = a.product_id
          WHERE p.template_id = t.id
       ) cs ON true
      ORDER BY
        CASE t.tier WHEN 'v1' THEN 1 WHEN 'v2' THEN 2 ELSE 3 END,
        t.name`,
  );

  return rows.map((r) => {
    let artifacts: ArtifactStatus[] = [];
    let supportedExamples: TemplateExample[] = [];
    try { artifacts = JSON.parse(r.artifacts); } catch { /* */ }
    try { supportedExamples = JSON.parse(r.supported_examples); } catch { /* */ }

    return {
      id: r.id,
      name: r.name,
      version: r.version,
      status: r.status,
      tier: r.tier,
      description: r.description,
      identity: r.identity,
      core_workflow: r.core_workflow,
      governance_notes: r.governance_notes,
      eval_pass_rate: r.eval_pass_rate,
      created_at: r.created_at,
      updated_at: r.updated_at,
      artifacts,
      supported_examples: supportedExamples,
      products_total: Number(r.products_total),
      products_live: Number(r.products_live),
      products_building: Number(r.products_building),
      total_build_cost_eur: Number(r.total_build_cost_eur),
    };
  });
}

export async function getTemplateById(id: string): Promise<TemplateRow | null> {
  const all = await listTemplates();
  return all.find((t) => t.id === id) ?? null;
}
