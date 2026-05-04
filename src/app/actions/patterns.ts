"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/dal";
import { pool } from "@/lib/db";

export type CandidateActionState =
  | { ok: true }
  | { ok: false; message: string }
  | undefined;

export async function approveCandidateAction(
  _prev: CandidateActionState,
  formData: FormData,
): Promise<CandidateActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Session expired." };

  const candidateId = formData.get("candidate_id");
  if (typeof candidateId !== "string") return { ok: false, message: "Missing candidate id." };

  const note = (formData.get("note") as string) || null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query<{
      id: string;
      pattern_name: string;
      description: string | null;
      category: string;
      status: string;
    }>(
      `SELECT id::text AS id, pattern_name, description, category, status
         FROM pattern_candidates
        WHERE id = $1::uuid FOR UPDATE`,
      [candidateId],
    );
    const candidate = rows[0];
    if (!candidate) {
      await client.query("ROLLBACK");
      return { ok: false, message: "Candidate not found." };
    }
    if (candidate.status !== "pending") {
      await client.query("ROLLBACK");
      return { ok: false, message: `Candidate already ${candidate.status}.` };
    }

    const slug = candidate.pattern_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { rows: patternRows } = await client.query<{ id: string }>(
      `INSERT INTO patterns (slug, name, description, category, version, status, complexity, tags)
       VALUES ($1, $2, $3, $4, '1.0.0', 'active', 'medium', '[]'::jsonb)
       ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
       RETURNING id::text AS id`,
      [slug, candidate.pattern_name, candidate.description, candidate.category],
    );
    const patternId = patternRows[0]?.id;

    await client.query(
      `UPDATE pattern_candidates
          SET status = 'approved',
              reviewer_note = $1,
              reviewed_at = NOW(),
              promoted_to_pattern_id = $2::uuid
        WHERE id = $3::uuid`,
      [note, patternId, candidateId],
    );

    await client.query(
      `INSERT INTO agent_runs
         (agent, task_name, input, status, cost_eur, owner_user_id)
       VALUES
         ('Reviewer Agent', 'pattern_promoted',
          $1::jsonb, 'ok', 0, $2::uuid)`,
      [
        JSON.stringify({
          candidate_id: candidateId,
          pattern_name: candidate.pattern_name,
          promoted_to: patternId,
          actor: user.id,
        }),
        user.id,
      ],
    );

    await client.query("COMMIT");
    revalidatePath("/dashboard/patterns");
    return { ok: true };
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch { /* */ }
    console.error("[approveCandidateAction] failed:", err);
    return { ok: false, message: "Failed to approve candidate." };
  } finally {
    client.release();
  }
}

export async function rejectCandidateAction(
  _prev: CandidateActionState,
  formData: FormData,
): Promise<CandidateActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Session expired." };

  const candidateId = formData.get("candidate_id");
  if (typeof candidateId !== "string") return { ok: false, message: "Missing candidate id." };

  const note = (formData.get("note") as string) || null;

  try {
    await pool.query(
      `UPDATE pattern_candidates
          SET status = 'rejected', reviewer_note = $1, reviewed_at = NOW()
        WHERE id = $2::uuid AND status = 'pending'`,
      [note, candidateId],
    );

    await pool.query(
      `INSERT INTO agent_runs
         (agent, task_name, input, status, cost_eur, owner_user_id)
       VALUES
         ('Reviewer Agent', 'pattern_rejected',
          $1::jsonb, 'ok', 0, $2::uuid)`,
      [
        JSON.stringify({ candidate_id: candidateId, actor: user.id }),
        user.id,
      ],
    );

    revalidatePath("/dashboard/patterns");
    return { ok: true };
  } catch (err) {
    console.error("[rejectCandidateAction] failed:", err);
    return { ok: false, message: "Failed to reject candidate." };
  }
}
