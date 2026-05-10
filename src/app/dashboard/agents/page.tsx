import { getCurrentUser } from "@/lib/auth/dal";
import { redirect } from "next/navigation";
import { ensureSchema, pool } from "@/lib/db";

import { AgentsView } from "./agents-view";

type AgentStats = {
  agent: string;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  total_cost_eur: number;
  last_run_at: string | null;
  last_task: string | null;
};

type RecentRun = {
  id: string;
  agent: string;
  task_name: string;
  status: string;
  cost_eur: number;
  product_slug: string | null;
  created_at: string;
};

export default async function AgentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  await ensureSchema();

  const [statsResult, recentResult] = await Promise.all([
    pool.query<AgentStats>(
      `SELECT a.agent,
              COUNT(*)::int AS total_runs,
              COUNT(*) FILTER (WHERE a.status IN ('ok','success'))::int AS successful_runs,
              COUNT(*) FILTER (WHERE a.status NOT IN ('ok','success'))::int AS failed_runs,
              COALESCE(SUM(a.cost_eur), 0)::float AS total_cost_eur,
              MAX(a.created_at)::text AS last_run_at,
              (ARRAY_AGG(a.task_name ORDER BY a.created_at DESC))[1] AS last_task
         FROM agent_runs a
         LEFT JOIN products p ON p.id = a.product_id
        WHERE p.owner_user_id = $1::uuid
           OR (a.product_id IS NULL AND a.owner_user_id = $1::uuid)
        GROUP BY a.agent
        ORDER BY MAX(a.created_at) DESC`,
      [user.id],
    ),
    pool.query<RecentRun>(
      `SELECT a.id::text, a.agent, a.task_name, a.status,
              a.cost_eur::float AS cost_eur,
              p.slug AS product_slug,
              a.created_at::text AS created_at
         FROM agent_runs a
         LEFT JOIN products p ON p.id = a.product_id
        WHERE p.owner_user_id = $1::uuid
           OR (a.product_id IS NULL AND a.owner_user_id = $1::uuid)
        ORDER BY a.created_at DESC
        LIMIT 20`,
      [user.id],
    ),
  ]);

  return (
    <AgentsView
      agentStats={statsResult.rows}
      recentRuns={recentResult.rows}
    />
  );
}
