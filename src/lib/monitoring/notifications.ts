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
          await dispatchSlack(payload);
          dispatched.push("slack");
          break;
        case "sms":
          await dispatchSms(payload);
          dispatched.push("sms");
          break;
        case "whatsapp":
          await dispatchWhatsApp(payload);
          dispatched.push("whatsapp");
          break;
        case "teams":
          await dispatchTeams(payload);
          dispatched.push("teams");
          break;
        case "telegram":
          await dispatchTelegram(payload);
          dispatched.push("telegram");
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

async function dispatchSlack(payload: AlertPayload): Promise<void> {
  const { rows } = await pool.query<{ slack_webhook_url: string | null }>(
    `SELECT t.slack_webhook_url
       FROM tenants t
       JOIN products p ON p.id = t.product_id
      WHERE p.id = $1::uuid AND t.slack_webhook_url IS NOT NULL
      LIMIT 1`,
    [payload.productId],
  );
  const webhookUrl = rows[0]?.slack_webhook_url;
  if (!webhookUrl) {
    log.warn({ alertId: payload.alertId }, "Slack: no webhook URL configured");
    return;
  }

  await globalThis.fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blocks: [
        { type: "header", text: { type: "plain_text", text: `Alert: ${payload.ruleName}` } },
        { type: "section", text: { type: "mrkdwn", text: payload.message } },
        { type: "context", elements: [{ type: "mrkdwn", text: `Product: *${payload.productSlug}* | ${new Date().toISOString()}` }] },
      ],
    }),
    signal: AbortSignal.timeout(10_000),
  });
}

async function dispatchSms(payload: AlertPayload): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_FROM;
  if (!sid || !token || !from) {
    log.warn({ alertId: payload.alertId }, "SMS: Twilio not configured");
    return;
  }

  const { rows } = await pool.query<{ phone: string | null }>(
    `SELECT t.phone FROM tenants t JOIN products p ON p.id = t.product_id
     WHERE p.id = $1::uuid AND t.phone IS NOT NULL LIMIT 1`,
    [payload.productId],
  );
  const phone = rows[0]?.phone;
  if (!phone) return;

  const body = new URLSearchParams({ To: phone, From: from, Body: `[${payload.productSlug}] ${payload.ruleName}: ${payload.message}`.slice(0, 1600) });
  await globalThis.fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}` },
    body: body.toString(),
    signal: AbortSignal.timeout(10_000),
  });
}

async function dispatchWhatsApp(payload: AlertPayload): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) {
    log.warn({ alertId: payload.alertId }, "WhatsApp: Twilio not configured");
    return;
  }

  const { rows } = await pool.query<{ phone: string | null }>(
    `SELECT t.phone FROM tenants t JOIN products p ON p.id = t.product_id
     WHERE p.id = $1::uuid AND t.phone IS NOT NULL LIMIT 1`,
    [payload.productId],
  );
  const phone = rows[0]?.phone;
  if (!phone) return;

  const body = new URLSearchParams({ To: `whatsapp:${phone}`, From: `whatsapp:${from}`, Body: `*${payload.ruleName}*\n${payload.message}\n\n_${payload.productSlug}_` });
  await globalThis.fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}` },
    body: body.toString(),
    signal: AbortSignal.timeout(10_000),
  });
}

async function dispatchTeams(payload: AlertPayload): Promise<void> {
  const { rows } = await pool.query<{ teams_webhook_url: string | null }>(
    `SELECT t.teams_webhook_url
       FROM tenants t
       JOIN products p ON p.id = t.product_id
      WHERE p.id = $1::uuid AND t.teams_webhook_url IS NOT NULL
      LIMIT 1`,
    [payload.productId],
  );
  const webhookUrl = rows[0]?.teams_webhook_url;
  if (!webhookUrl) {
    log.warn({ alertId: payload.alertId }, "Teams: no webhook URL configured");
    return;
  }

  await globalThis.fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "message",
      attachments: [{
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            { type: "TextBlock", text: `Alert: ${payload.ruleName}`, weight: "Bolder", size: "Medium" },
            { type: "TextBlock", text: payload.message, wrap: true },
            { type: "FactSet", facts: [
              { title: "Product", value: payload.productSlug },
              { title: "Time", value: new Date().toISOString() },
            ]},
          ],
        },
      }],
    }),
    signal: AbortSignal.timeout(10_000),
  });
}

async function dispatchTelegram(payload: AlertPayload): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    log.warn({ alertId: payload.alertId }, "Telegram: bot token not configured");
    return;
  }

  const { rows } = await pool.query<{ telegram_chat_id: string | null }>(
    `SELECT t.telegram_chat_id
       FROM tenants t
       JOIN products p ON p.id = t.product_id
      WHERE p.id = $1::uuid AND t.telegram_chat_id IS NOT NULL
      LIMIT 1`,
    [payload.productId],
  );
  const chatId = rows[0]?.telegram_chat_id;
  if (!chatId) return;

  const text = `*${escTg(payload.ruleName)}*\n${escTg(payload.message)}\n\n_${escTg(payload.productSlug)}_`;
  await globalThis.fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "MarkdownV2" }),
    signal: AbortSignal.timeout(10_000),
  });
}

function escTg(s: string): string {
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
