"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/dal";
import { pool } from "@/lib/db";

export type OutreachActionState =
  | { ok: true }
  | { ok: false; message: string }
  | undefined;

async function reviewQueueItem(
  formData: FormData,
  decision: "approved" | "rejected",
): Promise<OutreachActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Session expired." };

  const itemId = formData.get("item_id");
  if (typeof itemId !== "string") return { ok: false, message: "Missing item id." };
  const note = (formData.get("note") as string) || null;

  try {
    const { rowCount } = await pool.query(
      `UPDATE outreach_queue_items
          SET status = $1, reviewer_note = $2, reviewed_at = NOW()
        WHERE id = $3::uuid AND status = 'pending'`,
      [decision, note, itemId],
    );

    if (rowCount === 0) {
      return { ok: false, message: "Item not found or already reviewed." };
    }

    await pool.query(
      `INSERT INTO agent_runs
         (agent, task_name, input, status, cost_eur, owner_user_id)
       VALUES
         ('Outreach Engine', $1, $2::jsonb, 'ok', 0, $3::uuid)`,
      [
        `content_${decision}`,
        JSON.stringify({ item_id: itemId, decision, actor: user.id }),
        user.id,
      ],
    );

    revalidatePath("/dashboard/outreach");
    return { ok: true };
  } catch (err) {
    console.error(`[outreach_${decision}] failed:`, err);
    return { ok: false, message: "Operation failed." };
  }
}

export async function approveOutreachItemAction(
  _prev: OutreachActionState,
  formData: FormData,
): Promise<OutreachActionState> {
  return reviewQueueItem(formData, "approved");
}

export async function rejectOutreachItemAction(
  _prev: OutreachActionState,
  formData: FormData,
): Promise<OutreachActionState> {
  return reviewQueueItem(formData, "rejected");
}
