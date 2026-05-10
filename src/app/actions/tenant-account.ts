"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { ensureSchema, pool } from "@/lib/db";
import { readTenantSession, deleteTenantSession } from "@/lib/tenant/session";

export type AccountActionState =
  | { ok: true; message: string; data?: string }
  | { ok: false; message: string }
  | undefined;

export async function upgradePlanAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };

  const tierName = formData.get("tier_name") as string;
  if (!tierName) return { ok: false, message: "Tier name is required." };

  try {
    await ensureSchema();
    await pool.query(
      `UPDATE tenants SET plan = $1 WHERE id = $2::uuid AND product_id = $3::uuid`,
      [tierName.toLowerCase(), session.tenantId, session.productId],
    );

    revalidatePath(`/product/${session.productSlug}/settings`);
    return { ok: true, message: `Upgraded to ${tierName}!` };
  } catch (err) {
    console.error("[upgradePlan] failed:", err);
    return { ok: false, message: "Upgrade failed. Please try again." };
  }
}

export async function exportAllDataAction(
  _prev: AccountActionState,
  _formData: FormData,
): Promise<AccountActionState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };

  try {
    await ensureSchema();

    const [observations, alerts, rules] = await Promise.all([
      pool.query(
        `SELECT o.observed_at, ds.name AS source, o.dimensions::text, o.measures::text
         FROM observations o
         JOIN data_sources ds ON ds.id = o.data_source_id
         WHERE o.product_id = $1::uuid
         ORDER BY o.observed_at DESC LIMIT 10000`,
        [session.productId],
      ),
      pool.query(
        `SELECT a.created_at, ar.name AS rule_name, a.message, a.status, a.channels::text
         FROM alerts a
         JOIN alert_rules ar ON ar.id = a.rule_id
         WHERE a.product_id = $1::uuid
         ORDER BY a.created_at DESC LIMIT 10000`,
        [session.productId],
      ),
      pool.query(
        `SELECT name, condition_type, condition_config::text, notify_channels::text,
                throttle_minutes, enabled, created_at
         FROM alert_rules WHERE product_id = $1::uuid
         ORDER BY created_at`,
        [session.productId],
      ),
    ]);

    const sections: string[] = [];

    sections.push("=== OBSERVATIONS ===");
    sections.push("timestamp,source,dimensions,measures");
    observations.rows.forEach((r: Record<string, string>) => {
      sections.push(`"${r.observed_at}","${r.source}","${r.dimensions}","${r.measures}"`);
    });

    sections.push("\n=== ALERTS ===");
    sections.push("timestamp,rule,message,status,channels");
    alerts.rows.forEach((r: Record<string, string>) => {
      sections.push(`"${r.created_at}","${r.rule_name}","${r.message?.replace(/"/g, '""')}","${r.status}","${r.channels}"`);
    });

    sections.push("\n=== RULES ===");
    sections.push("name,type,config,channels,throttle,enabled,created");
    rules.rows.forEach((r: Record<string, string>) => {
      sections.push(`"${r.name}","${r.condition_type}","${r.condition_config}","${r.notify_channels}","${r.throttle_minutes}","${r.enabled}","${r.created_at}"`);
    });

    const csv = sections.join("\n");

    return {
      ok: true,
      message: `Export ready: ${observations.rows.length} observations, ${alerts.rows.length} alerts, ${rules.rows.length} rules.`,
      data: csv,
    };
  } catch (err) {
    console.error("[exportAllData] failed:", err);
    return { ok: false, message: "Export failed." };
  }
}

export async function deleteAccountAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };

  const confirmation = formData.get("confirmation") as string;
  if (confirmation !== "DELETE") {
    return { ok: false, message: "Type DELETE to confirm account deletion." };
  }

  try {
    await ensureSchema();

    await pool.query(`DELETE FROM alerts WHERE product_id = $1::uuid AND rule_id IN (SELECT id FROM alert_rules WHERE product_id = $1::uuid)`, [session.productId]);
    await pool.query(`DELETE FROM alert_rules WHERE product_id = $1::uuid`, [session.productId]);
    await pool.query(`DELETE FROM observations WHERE product_id = $1::uuid`, [session.productId]);
    await pool.query(`DELETE FROM data_sources WHERE product_id = $1::uuid`, [session.productId]);
    await pool.query(`DELETE FROM tenants WHERE id = $1::uuid`, [session.tenantId]);

    await deleteTenantSession();
    redirect(`/product/${session.productSlug}`);
  } catch (err) {
    if ((err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw err;
    console.error("[deleteAccount] failed:", err);
    return { ok: false, message: "Deletion failed. Please contact support." };
  }
}
