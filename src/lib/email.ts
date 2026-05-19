import "server-only";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || "",
        }
      : undefined,
});

const FROM_ADDRESS =
  process.env.SMTP_FROM || "ZECB <noreply@zeroemployee.io>";

type SendOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(opts: SendOptions): Promise<boolean> {
  if (process.env.MOCK_PROVIDERS === "true") {
    console.log(
      `[email-mock] To: ${opts.to} | Subject: ${opts.subject}`,
    );
    return true;
  }

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    return true;
  } catch (err) {
    console.error("[sendEmail] failed:", err);
    return false;
  }
}

// --- Transactional email senders -----------------------------------------

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Welcome to Zero-Employee Company Builder",
    html: layoutWrap(`
      <h1 style="color:#1a1a2e;margin:0 0 16px">Welcome, ${esc(name)}!</h1>
      <p>Your operator account is ready. Here's what to do next:</p>
      <ol style="padding-left:20px;color:#444">
        <li><strong>Generate ideas</strong> — Head to the Idea Inbox and let the Architect Agent propose 3 validated opportunities.</li>
        <li><strong>Author a BuildSpec</strong> — Pick your favorite idea and configure it as a Monitoring-SaaS product.</li>
        <li><strong>Watch the pipeline</strong> — The Build Orchestrator handles steps 1-10 autonomously.</li>
        <li><strong>Approve launch</strong> — Review the QA report and go live.</li>
      </ol>
      <p>Target: first product live within 7 days, spending less than 5 active hours of your time.</p>
      ${buttonHtml(`${baseUrl()}/dashboard`, "Open Dashboard")}
    `),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string,
) {
  const resetUrl = `${baseUrl()}/reset-password?token=${resetToken}`;
  return sendEmail({
    to,
    subject: "Reset your password — ZECB",
    html: layoutWrap(`
      <h1 style="color:#1a1a2e;margin:0 0 16px">Password Reset</h1>
      <p>Hi ${esc(name)},</p>
      <p>We received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.</p>
      ${buttonHtml(resetUrl, "Reset Password")}
      <p style="font-size:13px;color:#888;margin-top:24px">
        If you didn't request this, you can safely ignore this email.
        The link will expire automatically.
      </p>
    `),
  });
}

export async function sendBuildNotificationEmail(
  to: string,
  name: string,
  productSlug: string,
  event: "awaiting_approval" | "launched" | "failed",
) {
  const subjects: Record<string, string> = {
    awaiting_approval: `🚀 ${productSlug} is ready for launch approval`,
    launched: `✅ ${productSlug} is now live!`,
    failed: `⚠️ Build issue with ${productSlug}`,
  };

  const bodies: Record<string, string> = {
    awaiting_approval: `
      <h1 style="color:#1a1a2e;margin:0 0 16px">Launch Approval Needed</h1>
      <p>Hi ${esc(name)},</p>
      <p>The build pipeline for <strong>${esc(productSlug)}</strong> has completed all 10 automated steps and is parked at Step 11 — waiting for your approval.</p>
      <p>Review the staging URL, QA report, Stripe setup, and cost estimate before approving.</p>
      ${buttonHtml(`${baseUrl()}/dashboard/launches`, "Review & Approve")}
    `,
    launched: `
      <h1 style="color:#1a1a2e;margin:0 0 16px">Product Launched!</h1>
      <p>Hi ${esc(name)},</p>
      <p><strong>${esc(productSlug)}</strong> is now live. The Release Agent has cut production DNS and the Outreach Engine is entering Phase 1 — Ignition.</p>
      <p>Monitor performance on the Portfolio Control Plane.</p>
      ${buttonHtml(`${baseUrl()}/dashboard/portfolio`, "View Portfolio")}
    `,
    failed: `
      <h1 style="color:#1a1a2e;margin:0 0 16px">Build Issue</h1>
      <p>Hi ${esc(name)},</p>
      <p>The build for <strong>${esc(productSlug)}</strong> encountered an issue. Check the build status for details.</p>
      ${buttonHtml(`${baseUrl()}/dashboard/pipeline`, "View Builds")}
    `,
  };

  return sendEmail({
    to,
    subject: subjects[event],
    html: layoutWrap(bodies[event]),
  });
}

// --- HTML helpers --------------------------------------------------------

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buttonHtml(href: string, label: string): string {
  return `
    <div style="margin:24px 0">
      <a href="${href}"
         style="display:inline-block;padding:12px 28px;background:#1a1a2e;color:#fff;
                text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">
        ${label}
      </a>
    </div>
  `;
}

function layoutWrap(body: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e5e5">
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px">
    <p style="font-size:12px;color:#999;margin:0">
      Zero-Employee Company Builder · DACH-EU<br>
      You received this because you have a ZECB operator account.
    </p>
  </div>
</body>
</html>`;
}
