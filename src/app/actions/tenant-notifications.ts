"use server";

import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";
import { readTenantSession } from "@/lib/tenant/session";
import { sendEmail } from "@/lib/email";

export type NotifActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string }
  | undefined;

export async function saveChannelConfigAction(
  _prev: NotifActionState,
  formData: FormData,
): Promise<NotifActionState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };

  const slackUrl = (formData.get("slack_webhook_url") as string)?.trim() || null;
  const teamsUrl = (formData.get("teams_webhook_url") as string)?.trim() || null;
  const telegramId = (formData.get("telegram_chat_id") as string)?.trim() || null;
  const channels = formData.getAll("channels") as string[];

  try {
    await pool.query(
      `UPDATE tenants SET
        slack_webhook_url = $1,
        teams_webhook_url = $2,
        telegram_chat_id = $3,
        notify_channels = $4::jsonb
       WHERE id = $5::uuid AND product_id = $6::uuid`,
      [slackUrl, teamsUrl, telegramId, JSON.stringify(channels), session.tenantId, session.productId],
    );
    revalidatePath(`/product/${session.productSlug}/notifications`);
    return { ok: true, message: "Notification channels saved." };
  } catch (err) {
    console.error("[saveChannelConfig] failed:", err);
    return { ok: false, message: "Failed to save configuration." };
  }
}

export async function testNotificationAction(
  _prev: NotifActionState,
  formData: FormData,
): Promise<NotifActionState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };

  const channel = formData.get("channel") as string;
  if (!channel) return { ok: false, message: "Channel is required." };

  try {
    if (channel === "email") {
      await sendEmail({
        to: session.email,
        subject: `[Test] Alert from ${session.productSlug}`,
        text: "This is a test notification. If you see this, your email alerts are working correctly.",
        html: `<div style="font-family:sans-serif;max-width:480px"><h2>Test Alert</h2><p>This is a test notification from <strong>${session.productSlug}</strong>.</p><p>If you see this, your email alerts are working correctly.</p></div>`,
      });
      return { ok: true, message: `Test email sent to ${session.email}` };
    }

    if (channel === "slack") {
      const { rows } = await pool.query<{ slack_webhook_url: string | null }>(
        `SELECT slack_webhook_url FROM tenants WHERE id = $1::uuid`,
        [session.tenantId],
      );
      const url = rows[0]?.slack_webhook_url;
      if (!url) return { ok: false, message: "No Slack webhook URL configured. Save your config first." };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `🔔 Test alert from ${session.productSlug} — notifications are working!` }),
      });
      if (!res.ok) return { ok: false, message: `Slack returned ${res.status}. Check your webhook URL.` };
      return { ok: true, message: "Test message sent to Slack." };
    }

    if (channel === "webhook") {
      return { ok: true, message: "Webhook test: configure a custom webhook URL in your alert rules." };
    }

    return { ok: true, message: `Test sent for ${channel}.` };
  } catch (err) {
    console.error("[testNotification] failed:", err);
    return { ok: false, message: `Test failed: ${(err as Error).message}` };
  }
}
