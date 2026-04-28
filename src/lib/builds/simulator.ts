import "server-only";

import { pool } from "@/lib/db";

// Each step takes ~90s. 10 automated steps → ~15 min total before the HITL
// gate fires. Tunable per environment via env var.
const STEP_DURATION_MS = Number(process.env.ZECB_PIPELINE_STEP_MS) || 90_000;

// Step plan mirrors PRD §7.2 verbatim. Agents are spread across the org
// per §6.3 so the activity feed reads like real cross-agent traffic.
type StepDef = {
  step: number;
  label: string;
  task: string;
  agent: string;
  cost: number;
  llm: string | null;
};

const STEPS: ReadonlyArray<StepDef> = [
  {
    step: 1,
    label: "Schema validation",
    task: "schema_validation",
    agent: "Build Orchestrator",
    cost: 0,
    llm: null,
  },
  {
    step: 2,
    label: "Product registry creation",
    task: "product_registry_creation",
    agent: "Build Orchestrator",
    cost: 0.0001,
    llm: null,
  },
  {
    step: 3,
    label: "Infrastructure provisioning",
    task: "infrastructure_provisioning",
    agent: "Build Orchestrator",
    cost: 0.05,
    llm: null,
  },
  {
    step: 4,
    label: "Product repo init",
    task: "product_repo_init",
    agent: "Build Orchestrator",
    cost: 0.005,
    llm: null,
  },
  {
    step: 5,
    label: "Data source config + smoke fetch",
    task: "data_source_smoke_fetch",
    agent: "Architect Agent",
    cost: 0.02,
    llm: "anthropic/claude-sonnet-4.5",
  },
  {
    step: 6,
    label: "Alert primitive wiring",
    task: "alert_primitive_wiring",
    agent: "Build Orchestrator",
    cost: 0.001,
    llm: null,
  },
  {
    step: 7,
    label: "Onboarding flow generation",
    task: "onboarding_flow_generation",
    agent: "Content Agent",
    cost: 0.08,
    llm: "anthropic/claude-sonnet-4.5",
  },
  {
    step: 8,
    label: "Marketing site generation",
    task: "marketing_site_generation",
    agent: "Content Agent",
    cost: 0.12,
    llm: "anthropic/claude-sonnet-4.5",
  },
  {
    step: 9,
    label: "Knowledge base init",
    task: "knowledge_base_init",
    agent: "Operations Agent",
    cost: 0.15,
    llm: "anthropic/claude-sonnet-4.5",
  },
  {
    step: 10,
    label: "Integration test suite",
    task: "integration_test_suite",
    agent: "QA Agent",
    cost: 0.01,
    llm: null,
  },
  {
    step: 11,
    label: "Launch approval (HITL)",
    task: "launch_approval_pending",
    agent: "Build Orchestrator",
    cost: 0,
    llm: null,
  },
];

const TOTAL_STEPS = STEPS.length;

/**
 * Lazily advance every `building` product owned by `userId` to the step it
 * should be on given elapsed time since dispatch. Writes one `agent_runs`
 * row per advanced step, backdated to when the step would have completed,
 * so the activity feed reads chronologically rather than as a single burst.
 *
 * Stops at step 11 (Launch approval) — that's the V1 HITL gate per PRD §7.2
 * step 11 / acceptance criterion A-10. Operators flip status to 'live'
 * via approveBuildAction, never the simulator.
 */
export async function advancePipelinesForUser(userId: string): Promise<void> {
  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.error("[advancePipelinesForUser] could not acquire connection:", err);
    return;
  }
  try {
    await client.query("BEGIN");

    // FOR UPDATE serialises concurrent advances on the same product —
    // two simultaneous dashboard views won't double-insert.
    const { rows: products } = await client.query<{
      id: string;
      build_step: number;
      build_total_steps: number;
      created_at: string;
    }>(
      `SELECT id::text AS id,
              COALESCE(build_step, 1)         AS build_step,
              COALESCE(build_total_steps, 11) AS build_total_steps,
              created_at::text                AS created_at
         FROM products
        WHERE owner_user_id = $1::uuid
          AND status = 'building'
        FOR UPDATE`,
      [userId],
    );

    const now = Date.now();
    for (const p of products) {
      const startMs = new Date(p.created_at).getTime();
      if (!Number.isFinite(startMs)) continue;
      const elapsedMs = now - startMs;
      const total = Math.min(p.build_total_steps, TOTAL_STEPS);

      // Target step = 1 + floor(elapsed / per-step). Cap at total.
      const targetStep = Math.max(
        1,
        Math.min(total, 1 + Math.floor(elapsedMs / STEP_DURATION_MS)),
      );

      if (targetStep <= p.build_step) continue;

      // Insert one agent_run per newly-completed step, backdated to the
      // moment that step would have completed in real time.
      for (let s = p.build_step + 1; s <= targetStep; s++) {
        const def = STEPS[s - 1];
        if (!def) continue;
        const stepFinishMs = startMs + (s - 1) * STEP_DURATION_MS;
        const finishIso = new Date(
          Math.min(stepFinishMs, now),
        ).toISOString();

        await client.query(
          `INSERT INTO agent_runs
             (product_id, agent, task_name, input, status, cost_eur, llm_model, created_at)
           VALUES
             ($1::uuid, $2, $3, $4::jsonb, 'ok', $5, $6, $7::timestamptz)`,
          [
            p.id,
            def.agent,
            def.task,
            JSON.stringify({ step: s, label: def.label }),
            def.cost,
            def.llm,
            finishIso,
          ],
        );
      }

      const newDef = STEPS[targetStep - 1];
      await client.query(
        `UPDATE products
            SET build_step = $1,
                current_step_label = $2,
                updated_at = NOW(),
                estimated_monthly_opex_eur =
                  COALESCE(estimated_monthly_opex_eur, 0) +
                  (CASE WHEN $1 >= 11 AND estimated_monthly_opex_eur IS NULL THEN 310 ELSE 0 END)
          WHERE id = $3::uuid`,
        [targetStep, newDef?.label ?? null, p.id],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      /* swallow */
    }
    console.error("[advancePipelinesForUser] failed:", err);
  } finally {
    client.release();
  }
}

/**
 * Whether this product is sitting on the HITL launch gate.
 */
export function isAwaitingLaunchApproval(p: {
  status: string;
  build_step: number;
  build_total_steps: number;
}): boolean {
  return p.status === "building" && p.build_step >= p.build_total_steps;
}
