"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/dal";
import { pool } from "@/lib/db";
import { generateCoreMessage } from "@/lib/outreach/core-message";
import { generateCampaignStructure } from "@/lib/outreach/meta-ads";
import { createSequenceForProduct } from "@/lib/outreach/lifecycle-email";

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

export type GenerateState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

export async function generateCoreMessageAction(
  _prev: GenerateState,
  formData: FormData,
): Promise<GenerateState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Session expired." };

  const productId = formData.get("product_id") as string;
  if (!productId) return { ok: false, message: "Select a product." };

  try {
    const { rows } = await pool.query<{ id: string }>(
      "SELECT id::text FROM products WHERE id = $1::uuid AND owner_user_id = $2::uuid AND status = 'live'",
      [productId, user.id],
    );
    if (!rows[0]) return { ok: false, message: "Product not found or not live." };

    const result = await generateCoreMessage(productId);

    await pool.query(
      `INSERT INTO outreach_queue_items (product_id, item_type, title, description, content_preview, metadata, status)
       VALUES ($1::uuid, 'content', $2, $3, $4, $5::jsonb, 'pending')`,
      [
        productId,
        `Core Message v${result.message.version}`,
        `AI-generated core messaging for all marketing channels`,
        JSON.stringify(result.message.pain_statements, null, 2),
        JSON.stringify({ type: "core_message", cost_eur: result.cost_eur }),
      ],
    );

    revalidatePath("/dashboard/outreach");
    return { ok: true, message: `Core message generated. Cost: €${result.cost_eur.toFixed(4)}` };
  } catch (err) {
    console.error("[generateCoreMessage] failed:", err);
    return { ok: false, message: `Generation failed: ${(err as Error).message}` };
  }
}

export async function generateCampaignAction(
  _prev: GenerateState,
  formData: FormData,
): Promise<GenerateState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Session expired." };

  const productId = formData.get("product_id") as string;
  if (!productId) return { ok: false, message: "Select a product." };

  try {
    const { rows } = await pool.query<{ id: string }>(
      "SELECT id::text FROM products WHERE id = $1::uuid AND owner_user_id = $2::uuid AND status = 'live'",
      [productId, user.id],
    );
    if (!rows[0]) return { ok: false, message: "Product not found or not live." };

    const campaign = await generateCampaignStructure(productId);

    await pool.query(
      `INSERT INTO outreach_queue_items (product_id, item_type, title, description, channel, metadata, status)
       VALUES ($1::uuid, 'channel', $2, $3, 'meta_ads', $4::jsonb, 'pending')`,
      [
        productId,
        `Meta Ads — ${campaign.campaign_name}`,
        `${campaign.ad_sets?.length ?? 0} ad sets, €${campaign.budget_daily_eur}/day budget`,
        JSON.stringify({ type: "meta_campaign", campaign_name: campaign.campaign_name }),
      ],
    );

    revalidatePath("/dashboard/outreach");
    return { ok: true, message: `Campaign "${campaign.campaign_name}" generated.` };
  } catch (err) {
    console.error("[generateCampaign] failed:", err);
    return { ok: false, message: `Generation failed: ${(err as Error).message}` };
  }
}

export async function generateEmailSequenceAction(
  _prev: GenerateState,
  formData: FormData,
): Promise<GenerateState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Session expired." };

  const productId = formData.get("product_id") as string;
  if (!productId) return { ok: false, message: "Select a product." };

  try {
    const { rows } = await pool.query<{ id: string }>(
      "SELECT id::text FROM products WHERE id = $1::uuid AND owner_user_id = $2::uuid AND status = 'live'",
      [productId, user.id],
    );
    if (!rows[0]) return { ok: false, message: "Product not found or not live." };

    await createSequenceForProduct(productId, "activation");
    await createSequenceForProduct(productId, "re_engagement");

    await pool.query(
      `INSERT INTO outreach_queue_items (product_id, item_type, title, description, channel, metadata, status)
       VALUES ($1::uuid, 'content', $2, $3, 'email', '{}'::jsonb, 'pending')`,
      [productId, "Email Sequences", "Activation + re-engagement email sequences created"],
    );

    revalidatePath("/dashboard/outreach");
    return { ok: true, message: "Email sequences created." };
  } catch (err) {
    console.error("[generateEmailSequence] failed:", err);
    return { ok: false, message: `Generation failed: ${(err as Error).message}` };
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
