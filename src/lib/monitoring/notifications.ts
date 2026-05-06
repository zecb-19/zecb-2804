import "server-only";

import { pool } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { log } from "@/lib/log";

export type NotificationChannel = "email" | "slack" | "webhook" | "sms" | "whatsapp" | "in_app" | "teams" | "telegram";

export type AlertPayload = {
  alertId: string;
  ruleId: string;
  ruleName: string;
  productId: string;
  productSlug: string;
  message: string;
  details: Record<string, unknown>;
  channels: NotificationChannel[];
};

export async function dispatchNotifications(payload: AlertPayload): Promise<void> {
  const dispatched: string[] = [];

  for (const channel of payload.channels) {
    try {
      switch (channel) {
        case "email":
          await dispatchEmail(payload);
          dispatched.push("email");
          break;
        case "webhook":
          await dispatchWebhook(payload);
          dispatched.push("webhook");
          break;
        case "in_app":
          await dispatchInApp(payload);
          dispatched.push("in_app");
          break;
        case "slack":
        case "sms":
        case "whatsapp":
        case "teams":
        case "telegram":
          log.info({ channel, alertId: payload.alertId }, `${channel} dispatch not yet implemented`);
          break;
      }
    } catch (err) {
      log.error({ channel, alertId: payload.alertId, error: (err as Error).message }, "Notification dispatch failed");
    }
  }

  if (dispatched.length > 0) {
    await pool.query(
      `UPDATE alerts SET status = 'sent', notified_at = NOW() WHERE id = $1::uuid`,
      [payload.alertId],
    );
  }
}

async function dispatchEmail(payload: AlertPayload): Promise<void> {
  const { rows } = await pool.query<{ email: string; name: string }>(
    `SELECT u.email, u.name
       FROM users u
       JOIN products p ON p.owner_user_id = u.id
      WHERE p.id = $1::uuid
      LIMIT 1`,
    [payload.productId],
  );
  const user = rows[0];
  if (!user) return;

  await sendEmail({
    to: user.email,
    subject: `⚠️ Alert: ${payload.ruleName} — ${payload.productSlug}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e5e5">
    <div style="padding:12px 16px;background:#fff3cd;border-radius:8px;border-left:4px solid #ffc107;margin-bottom:20px">
      <strong style="color:#856404">${escHtml(payload.ruleName)}</strong>
    </div>
    <p style="color:#333;font-size:15px;line-height:1.6">${escHtml(payload.message)}</p>
    <p style="font-size:13px;color:#666;margin-top:16px">
      Product: <strong>${escHtml(payload.productSlug)}</strong>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
    <p style="font-size:12px;color:#999">ZECB Monitoring Alert · Automated notification</p>
  </div>
</body>
</html>`,
  });
}

async function dispatchWebhook(payload: AlertPayload): Promise<void> {
  const { rows } = await pool.query<{ config: string }>(
    `SELECT ds.config::text AS config
       FROM data_sources ds
       JOIN alert_rules ar ON ar.data_source_id = ds.id
      WHERE ar.id = $1::uuid
      LIMIT 1`,
    [payload.ruleId],
  );

  const config = rows[0]?.config ? JSON.parse(rows[0].config) : {};
  const webhookUrl = config.webhook_url as string | undefined;
  if (!webhookUrl) return;

  await globalThis.fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      alert_id: payload.alertId,
      rule: payload.ruleName,
      product: payload.productSlug,
      message: payload.message,
      details: payload.details,
      timestamp: new Date().toISOString(),
    }),
    signal: AbortSignal.timeout(10_000),
  });
}

async function dispatchInApp(payload: AlertPayload): Promise<void> {
  await pool.query(
    `INSERT INTO agent_runs
       (product_id, agent, task_name, input, status, cost_eur)
     VALUES
       ($1::uuid, 'Notification Fanout', 'in_app_alert', $2::jsonb, 'ok', 0)`,
    [
      payload.productId,
      JSON.stringify({
        alert_id: payload.alertId,
        rule: payload.ruleName,
        message: payload.message,
      }),
    ],
  );
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
