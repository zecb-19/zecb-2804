"use server";

import { revalidatePath } from "next/cache";

import { pool } from "@/lib/db";
import { getCurrentTenant } from "@/lib/tenant/queries";
import { trackEvent } from "@/lib/outreach/cdp";

export type RuleActionState =
  | { ok: true; message?: string }
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
    trackEvent({ product_id: tenant.productId, event: "rule_created", distinct_id: tenant.email, properties: { name, conditionType } }).catch(() => {});
    return { ok: true };
  } catch (err) {
    console.error("[createRule] failed:", err);
    return { ok: false, message: "Failed to create rule." };
  }
}

export async function deleteRuleAction(
  _prev: RuleActionState,
  formData: FormData,
): Promise<RuleActionState> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { ok: false, message: "Session expired." };
  const ruleId = formData.get("rule_id") as string;
  if (!ruleId) return { ok: false, message: "Missing rule." };
  try {
    await pool.query(
      `DELETE FROM alert_rules WHERE id = $1::uuid AND product_id = $2::uuid`,
      [ruleId, tenant.productId],
    );
    revalidatePath(`/product/${tenant.productSlug}/rules`);
    return { ok: true };
  } catch (err) {
    console.error("[deleteRule] failed:", err);
    return { ok: false, message: "Failed to delete rule." };
  }
}

export async function updateRuleAction(
  _prev: RuleActionState,
  formData: FormData,
): Promise<RuleActionState> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { ok: false, message: "Session expired." };
  const ruleId = formData.get("rule_id") as string;
  const name = formData.get("name") as string;
  const field = formData.get("field") as string;
  const operator = formData.get("operator") as string;
  const value = formData.get("value") as string;
  const channels = formData.getAll("channels") as string[];
  const throttle = Number(formData.get("throttle_minutes")) || 60;
  if (!ruleId || !name || !field) return { ok: false, message: "Name and field are required." };
  try {
    const config: Record<string, unknown> = { field };
    if (operator) config.operator = operator;
    if (value) config.value = isNaN(Number(value)) ? value : Number(value);
    await pool.query(
      `UPDATE alert_rules SET name=$1, condition_config=$2::jsonb, notify_channels=$3::jsonb, throttle_minutes=$4 WHERE id=$5::uuid AND product_id=$6::uuid`,
      [name, JSON.stringify(config), JSON.stringify(channels.length > 0 ? channels : ["email"]), throttle, ruleId, tenant.productId],
    );
    revalidatePath(`/product/${tenant.productSlug}/rules`);
    return { ok: true };
  } catch (err) {
    console.error("[updateRule] failed:", err);
    return { ok: false, message: "Failed to update rule." };
  }
}

export async function testRuleAction(
  _prev: RuleActionState,
  formData: FormData,
): Promise<RuleActionState> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { ok: false, message: "Session expired." };
  const ruleId = formData.get("rule_id") as string;
  if (!ruleId) return { ok: false, message: "Missing rule." };
  try {
    const { rows: ruleRows } = await pool.query<{ condition_type: string; condition_config: string; data_source_id: string | null }>(
      `SELECT condition_type, condition_config::text AS condition_config, data_source_id::text AS data_source_id FROM alert_rules WHERE id=$1::uuid AND product_id=$2::uuid`,
      [ruleId, tenant.productId],
    );
    if (!ruleRows[0]) return { ok: false, message: "Rule not found." };

    const dsFilter = ruleRows[0].data_source_id ? `AND data_source_id = '${ruleRows[0].data_source_id}'::uuid` : "";
    const { rows: obsRows } = await pool.query<{ measures: string }>(
      `SELECT measures::text AS measures FROM observations WHERE product_id=$1::uuid ${dsFilter} ORDER BY observed_at DESC LIMIT 1`,
      [tenant.productId],
    );
    if (!obsRows[0]) return { ok: false, message: "No observations to test against. Run monitoring first." };

    const config = JSON.parse(ruleRows[0].condition_config);
    const measures = JSON.parse(obsRows[0].measures);
    const fieldValue = measures[config.field];
    if (fieldValue === undefined) return { ok: false, message: `Field "${config.field}" not found in latest observation. Available: ${Object.keys(measures).join(", ")}` };

    const numVal = Number(fieldValue);
    const threshold = Number(config.value);
    const op = config.operator ?? "gt";
    let triggered = false;
    if (op === "gt") triggered = numVal > threshold;
    else if (op === "lt") triggered = numVal < threshold;
    else if (op === "gte") triggered = numVal >= threshold;
    else if (op === "lte") triggered = numVal <= threshold;
    else if (op === "eq") triggered = numVal === threshold;
    else if (op === "neq") triggered = numVal !== threshold;

    return { ok: true, message: triggered
      ? `WOULD TRIGGER — ${config.field} = ${fieldValue} ${op} ${threshold}`
      : `Would NOT trigger — ${config.field} = ${fieldValue} ${op} ${threshold}` };
  } catch (err) {
    console.error("[testRule] failed:", err);
    return { ok: false, message: `Test failed: ${(err as Error).message}` };
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
