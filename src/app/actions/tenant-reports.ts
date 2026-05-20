"use server";

import { revalidatePath } from "next/cache";
import { ensureSchema, pool } from "@/lib/db";
import { readTenantSession } from "@/lib/tenant/session";

export type ReportActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string }
  | undefined;

export async function saveReportConfigAction(
  _prev: ReportActionState,
  formData: FormData,
): Promise<ReportActionState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };

  const dailyEnabled = formData.get("daily_enabled") === "on";
  const weeklyEnabled = formData.get("weekly_enabled") === "on";
  const deliveryTime = (formData.get("delivery_time") as string) || "08:00";
  const timezone = (formData.get("timezone") as string) || "Europe/Berlin";

  try {
    await ensureSchema();
    for (const type of ["daily", "weekly"] as const) {
      const enabled = type === "daily" ? dailyEnabled : weeklyEnabled;
      await pool.query(
        `INSERT INTO report_configs (product_id, tenant_id, report_type, enabled, delivery_time, timezone)
         VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6)
         ON CONFLICT (product_id, tenant_id, report_type)
         DO UPDATE SET enabled = $4, delivery_time = $5, timezone = $6`,
        [session.productId, session.tenantId, type, enabled, deliveryTime, timezone],
      );
    }
    revalidatePath(`/product/${session.productSlug}/reports`);
    return { ok: true, message: "Report preferences saved." };
  } catch (err) {
    console.error("[saveReportConfig] failed:", err);
    return { ok: false, message: "Failed to save report configuration." };
  }
}
