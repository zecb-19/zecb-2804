"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/dal";
import { pool } from "@/lib/db";

export type ComplianceActionState =
  | { ok: true }
  | { ok: false; message: string }
  | undefined;

export async function updateCheckStatusAction(
  _prev: ComplianceActionState,
  formData: FormData,
): Promise<ComplianceActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Session expired." };

  const checkId = formData.get("check_id");
  const newStatus = formData.get("status");
  const note = (formData.get("note") as string) || null;

  if (typeof checkId !== "string" || typeof newStatus !== "string") {
    return { ok: false, message: "Invalid parameters." };
  }

  const validStatuses = ["not_started", "in_progress", "complete"];
  if (!validStatuses.includes(newStatus)) {
    return { ok: false, message: "Invalid status." };
  }

  try {
    const { rowCount } = await pool.query(
      `UPDATE compliance_checks
          SET status = $1,
              evidence_note = COALESCE($2, evidence_note),
              checked_at = CASE WHEN $1 = 'complete' THEN NOW() ELSE checked_at END,
              checked_by = CASE WHEN $1 = 'complete' THEN $3::uuid ELSE checked_by END
        WHERE id = $4`,
      [newStatus, note, user.id, checkId],
    );

    if (rowCount === 0) {
      return { ok: false, message: "Check not found." };
    }

    await pool.query(
      `INSERT INTO agent_runs
         (agent, task_name, input, status, cost_eur, owner_user_id)
       VALUES
         ('Compliance Gate', 'check_status_updated',
          $1::jsonb, 'ok', 0, $2::uuid)`,
      [
        JSON.stringify({
          check_id: checkId,
          new_status: newStatus,
          actor: user.id,
        }),
        user.id,
      ],
    );

    revalidatePath("/dashboard/compliance");
    return { ok: true };
  } catch (err) {
    console.error("[updateCheckStatusAction] failed:", err);
    return { ok: false, message: "Failed to update. Please try again." };
  }
}
