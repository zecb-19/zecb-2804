"use server";

import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";
import { readTenantSession } from "@/lib/tenant/session";

export type AlertActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string }
  | undefined;

export async function acknowledgeAlertAction(
  _prev: AlertActionState,
  formData: FormData,
): Promise<AlertActionState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };
  const alertId = formData.get("alert_id") as string;
  if (!alertId) return { ok: false, message: "Alert ID required." };
  try {
    await pool.query(
      `UPDATE alerts SET status = 'acknowledged', acknowledged_at = NOW(), acknowledged_by = $3::uuid WHERE id = $1::uuid AND product_id = $2::uuid`,
      [alertId, session.productId, session.tenantId],
    );
    revalidatePath(`/product/${session.productSlug}/alerts`);
    return { ok: true };
  } catch (err) {
    console.error("[acknowledgeAlert] failed:", err);
    return { ok: false, message: "Failed to acknowledge alert." };
  }
}

export async function resolveAlertAction(
  _prev: AlertActionState,
  formData: FormData,
): Promise<AlertActionState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };
  const alertId = formData.get("alert_id") as string;
  if (!alertId) return { ok: false, message: "Alert ID required." };
  try {
    await pool.query(
      `UPDATE alerts SET status = 'resolved', resolved_at = NOW() WHERE id = $1::uuid AND product_id = $2::uuid`,
      [alertId, session.productId],
    );
    revalidatePath(`/product/${session.productSlug}/alerts`);
    return { ok: true };
  } catch (err) {
    console.error("[resolveAlert] failed:", err);
    return { ok: false, message: "Failed to resolve alert." };
  }
}
