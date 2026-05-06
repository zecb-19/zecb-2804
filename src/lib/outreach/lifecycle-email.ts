import "server-only";

import { pool } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { log } from "@/lib/log";

export type EmailSequenceType =
  | "activation"
  | "re_engagement"
  | "churn_prevention"
  | "dunning";

export type SequenceEmail = {
  index: number;
  delay_days: number;
  subject: string;
  body_template: string;
};

const ACTIVATION_SEQUENCE: SequenceEmail[] = [
  { index: 0, delay_days: 0, subject: "Welcome to {{product_name}} — your first step", body_template: "welcome_d0" },
  { index: 1, delay_days: 1, subject: "{{product_name}}: Here's what you can do first", body_template: "feature_walkthrough_d1" },
  { index: 2, delay_days: 3, subject: "How {{persona_name}} uses {{product_name}}", body_template: "customer_story_d3" },
  { index: 3, delay_days: 7, subject: "Avoid these {{product_name}} pitfalls", body_template: "common_pitfalls_d7" },
  { index: 4, delay_days: 14, subject: "Your trial is ending — upgrade {{product_name}}", body_template: "trial_end_d14" },
];

const RE_ENGAGEMENT_SEQUENCE: SequenceEmail[] = [
  { index: 0, delay_days: 0, subject: "We noticed you've been away from {{product_name}}", body_template: "soft_nudge" },
  { index: 1, delay_days: 3, subject: "Here's what you're missing in {{product_name}}", body_template: "value_reminder" },
  { index: 2, delay_days: 7, subject: "Would a pause work better? {{product_name}}", body_template: "pause_offer" },
];

const CHURN_PREVENTION_SEQUENCE: SequenceEmail[] = [
  { index: 0, delay_days: 0, subject: "We're sorry to see you go — quick question?", body_template: "empathy_survey" },
  { index: 1, delay_days: 2, subject: "We heard you — here's what we can do", body_template: "conditional_response" },
];

const DUNNING_SEQUENCE: SequenceEmail[] = [
  { index: 0, delay_days: 0, subject: "Payment failed — please update your card", body_template: "dunning_1" },
  { index: 1, delay_days: 3, subject: "Your {{product_name}} access is at risk", body_template: "dunning_2" },
  { index: 2, delay_days: 7, subject: "Final notice — {{product_name}} will be paused", body_template: "dunning_3" },
];

const SEQUENCES: Record<EmailSequenceType, SequenceEmail[]> = {
  activation: ACTIVATION_SEQUENCE,
  re_engagement: RE_ENGAGEMENT_SEQUENCE,
  churn_prevention: CHURN_PREVENTION_SEQUENCE,
  dunning: DUNNING_SEQUENCE,
};

export async function createSequenceForProduct(
  productId: string,
  sequenceType: EmailSequenceType,
): Promise<string> {
  const emails = SEQUENCES[sequenceType];
  if (!emails) throw new Error(`Unknown sequence type: ${sequenceType}`);

  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO email_sequences (product_id, sequence_type, name, emails)
     VALUES ($1::uuid, $2, $3, $4::jsonb)
     RETURNING id::text AS id`,
    [
      productId,
      sequenceType,
      `${sequenceType} sequence`,
      JSON.stringify(emails),
    ],
  );

  return rows[0].id;
}

export async function enrollUserInSequence(
  sequenceId: string,
  productId: string,
  recipientEmail: string,
): Promise<void> {
  const { rows } = await pool.query<{ emails: string }>(
    "SELECT emails::text AS emails FROM email_sequences WHERE id = $1::uuid",
    [sequenceId],
  );
  if (!rows[0]) throw new Error("Sequence not found");

  const emails: SequenceEmail[] = JSON.parse(rows[0].emails);

  for (const email of emails) {
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + email.delay_days);

    await pool.query(
      `INSERT INTO email_sequence_events
         (sequence_id, product_id, recipient_email, email_index, scheduled_at)
       VALUES ($1::uuid, $2::uuid, $3, $4, $5::timestamptz)`,
      [sequenceId, productId, recipientEmail, email.index, scheduledAt.toISOString()],
    );
  }
}

export async function processScheduledEmails(): Promise<number> {
  const { rows } = await pool.query<{
    id: string;
    sequence_id: string;
    product_id: string;
    recipient_email: string;
    email_index: number;
  }>(
    `SELECT ese.id::text AS id, ese.sequence_id::text AS sequence_id,
            ese.product_id::text AS product_id,
            ese.recipient_email, ese.email_index
       FROM email_sequence_events ese
      WHERE ese.status = 'pending'
        AND ese.scheduled_at <= NOW()
      ORDER BY ese.scheduled_at
      LIMIT 50`,
  );

  let sent = 0;

  for (const event of rows) {
    try {
      const { rows: seqRows } = await pool.query<{
        emails: string;
        sequence_type: string;
        product_name: string;
      }>(
        `SELECT es.emails::text AS emails, es.sequence_type,
                p.name AS product_name
           FROM email_sequences es
           JOIN products p ON p.id = es.product_id
          WHERE es.id = $1::uuid`,
        [event.sequence_id],
      );

      if (!seqRows[0]) continue;

      const emails: SequenceEmail[] = JSON.parse(seqRows[0].emails);
      const emailDef = emails[event.email_index];
      if (!emailDef) continue;

      const subject = emailDef.subject
        .replace(/\{\{product_name\}\}/g, seqRows[0].product_name)
        .replace(/\{\{persona_name\}\}/g, "your team");

      const success = await sendEmail({
        to: event.recipient_email,
        subject,
        html: buildSequenceEmailHtml(
          seqRows[0].product_name,
          subject,
          emailDef.body_template,
          seqRows[0].sequence_type,
        ),
      });

      await pool.query(
        `UPDATE email_sequence_events
            SET status = $1, sent_at = CASE WHEN $1 = 'sent' THEN NOW() ELSE NULL END
          WHERE id = $2::uuid`,
        [success ? "sent" : "failed", event.id],
      );

      if (success) sent++;
    } catch (err) {
      log.error({ eventId: event.id, error: (err as Error).message }, "Sequence email failed");
      await pool.query(
        "UPDATE email_sequence_events SET status = 'failed' WHERE id = $1::uuid",
        [event.id],
      );
    }
  }

  return sent;
}

function buildSequenceEmailHtml(
  productName: string,
  subject: string,
  template: string,
  sequenceType: string,
): string {
  const bodyContent = getTemplateContent(productName, template, sequenceType);

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e5e5">
    <h2 style="color:#1a1a2e;margin:0 0 16px">${escHtml(subject)}</h2>
    ${bodyContent}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
    <p style="font-size:12px;color:#999">${escHtml(productName)} · Lifecycle email<br>
    <a href="#unsubscribe" style="color:#999">Unsubscribe</a> · <a href="#preferences" style="color:#999">Email preferences</a></p>
  </div>
</body></html>`;
}

function getTemplateContent(productName: string, template: string, sequenceType: string): string {
  const templates: Record<string, string> = {
    welcome_d0: `<p>Welcome! You've taken the first step with ${escHtml(productName)}.</p>
      <p>Here's how to get your first value in under 2 minutes:</p>
      <ol><li>Configure your first data source</li><li>Set up an alert rule</li><li>Receive your first notification</li></ol>`,
    feature_walkthrough_d1: `<p>Now that you're set up, here are the features that matter most:</p>
      <ul><li>Data source monitoring with configurable schedules</li><li>Alert rules with smart thresholds</li><li>Multi-channel notifications</li></ul>`,
    customer_story_d3: `<p>Here's how teams like yours use ${escHtml(productName)} to stay ahead of changes that matter.</p>`,
    common_pitfalls_d7: `<p>After a week, here are the most common pitfalls to avoid — and how to get the most from your monitoring setup.</p>`,
    trial_end_d14: `<p>Your trial experience with ${escHtml(productName)} is coming to an end. Upgrade to keep your monitoring running.</p>`,
    soft_nudge: `<p>We noticed you haven't checked in for a while. Everything okay?</p>`,
    value_reminder: `<p>While you were away, here's what ${escHtml(productName)} could have caught for you.</p>`,
    pause_offer: `<p>If now isn't the right time, you can pause your account instead of canceling. Your data and rules stay safe.</p>`,
    empathy_survey: `<p>We're sorry to see you considering leaving. Could you share what's not working? It takes 30 seconds.</p>`,
    conditional_response: `<p>Based on your feedback, here's what we can offer to make ${escHtml(productName)} work better for you.</p>`,
    dunning_1: `<p>Your payment method failed. Please update it to keep ${escHtml(productName)} running.</p>`,
    dunning_2: `<p>We still haven't been able to process your payment. Your access may be restricted soon.</p>`,
    dunning_3: `<p>This is a final notice. Please update your payment method or your ${escHtml(productName)} account will be paused.</p>`,
  };

  return templates[template] ?? `<p>Message from ${escHtml(productName)} (${sequenceType})</p>`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
