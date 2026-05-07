"use server";

import { revalidatePath } from "next/cache";

import { pool } from "@/lib/db";
import { getCurrentTenant } from "@/lib/tenant/queries";

export type RuleActionState =
  | { ok: true }
  | { ok: false; message: string }
  | undefined;

export async function createRuleAction(
  _prev: RuleActionState,
  formData: FormData,
): Promise<RuleActionState> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { ok: false, message: "Session expired." };

  const name = formData.get("name") as string;
  const dataSourceId = formData.get("data_source_id") as string;
  const conditionType = formData.get("condition_type") as string;
  const field = formData.get("field") as string;
  const operator = formData.get("operator") as string;
  const value = formData.get("value") as string;
  const channels = formData.getAll("channels") as string[];
  const throttle = Number(formData.get("throttle_minutes")) || 60;

  if (!name || !conditionType || !field) {
    return { ok: false, message: "Name, condition type, and field are required." };
  }

  try {
    const config: Record<string, unknown> = { field };
    if (operator) config.operator = operator;
    if (value) config.value = isNaN(Number(value)) ? value : Number(value);

    await pool.query(
      `INSERT INTO alert_rules
         (product_id, name, data_source_id, condition_type, condition_config, notify_channels, throttle_minutes)
       VALUES ($1::uuid, $2, $3::uuid, $4, $5::jsonb, $6::jsonb, $7)`,
      [
        tenant.productId,
        name,
        dataSourceId || null,
        conditionType,
        JSON.stringify(config),
        JSON.stringify(channels.length > 0 ? channels : ["email"]),
        throttle,
      ],
    );

    revalidatePath(`/product/${tenant.productSlug}/rules`);
    return { ok: true };
  } catch (err) {
    console.error("[createRule] failed:", err);
    return { ok: false, message: "Failed to create rule." };
  }
}

export async function toggleRuleAction(
  _prev: RuleActionState,
  formData: FormData,
): Promise<RuleActionState> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { ok: false, message: "Session expired." };

  const ruleId = formData.get("rule_id") as string;
  if (!ruleId) return { ok: false, message: "Missing rule." };

  try {
    await pool.query(
      `UPDATE alert_rules SET enabled = NOT enabled
        WHERE id = $1::uuid AND product_id = $2::uuid`,
      [ruleId, tenant.productId],
    );
    revalidatePath(`/product/${tenant.productSlug}/rules`);
    return { ok: true };
  } catch (err) {
    console.error("[toggleRule] failed:", err);
    return { ok: false, message: "Failed." };
  }
}
