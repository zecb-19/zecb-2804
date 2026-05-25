"use server";

import crypto from "crypto";

import { ensureSchema, pool } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export type SubscribeState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

export async function subscribeAction(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const productId = formData.get("product_id") as string;
  const productSlug = formData.get("product_slug") as string;
  const utmSource = (formData.get("utm_source") as string) || null;
  const utmCampaign = (formData.get("utm_campaign") as string) || null;

  if (!email || !email.includes("@")) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (!productId) {
    return { ok: false, message: "Product not found." };
  }

  try {
    await ensureSchema();

    const emailHash = crypto.createHash("sha256").update(email).digest("hex");
    const { rows: unsub } = await pool.query(
      "SELECT 1 FROM unsubscribes WHERE email_hash = $1 LIMIT 1",
      [emailHash],
    );
    if (unsub.length > 0) {
      return { ok: true, message: "If this email is eligible, you'll receive a confirmation." };
    }

    const token = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `INSERT INTO product_subscribers (product_id, email, status, verification_token, utm_source, utm_campaign)
       VALUES ($1::uuid, $2, 'pending', $3, $4, $5)
       ON CONFLICT (product_id, email) DO UPDATE SET
         verification_token = $3,
         status = CASE WHEN product_subscribers.verified_at IS NOT NULL THEN product_subscribers.status ELSE 'pending' END`,
      [productId, email, token, utmSource, utmCampaign],
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
    const verifyUrl = `${baseUrl}/api/subscriber/verify?token=${token}&slug=${productSlug}`;

    await sendEmail({
      to: email,
      subject: `Bitte bestätigen Sie Ihre Anmeldung — ${productSlug}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e5e5">
    <h1 style="color:#1a1a2e;margin:0 0 16px;font-size:20px">E-Mail bestätigen</h1>
    <p style="color:#444;font-size:15px;line-height:1.6">
      Vielen Dank für Ihr Interesse! Bitte bestätigen Sie Ihre E-Mail-Adresse, um Updates zu erhalten.
    </p>
    <div style="margin:24px 0">
      <a href="${verifyUrl}"
         style="display:inline-block;padding:12px 28px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">
        E-Mail bestätigen
      </a>
    </div>
    <p style="font-size:13px;color:#888">
      Falls Sie sich nicht angemeldet haben, können Sie diese E-Mail ignorieren.
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0 16px">
    <p style="font-size:12px;color:#999;margin:0">
      Double-Opt-In gemäß DSGVO · ${productSlug}
    </p>
  </div>
</body>
</html>`,
    });

    return { ok: true, message: "Bitte prüfen Sie Ihr Postfach und bestätigen Sie Ihre E-Mail-Adresse." };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      return { ok: true, message: "Bitte prüfen Sie Ihr Postfach und bestätigen Sie Ihre E-Mail-Adresse." };
    }
    console.error("[subscribeAction] failed:", err);
    return { ok: false, message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." };
  }
}
