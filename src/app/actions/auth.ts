"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { ensureSchema, pool } from "@/lib/db";
import {
  AUTH_FIELD_KEYS,
  SigninSchema,
  SignupSchema,
  type AuthFailure,
  type AuthFieldErrors,
  type AuthFormState,
} from "@/lib/auth/definitions";
import { createSession, deleteSession } from "@/lib/auth/session";
import { sendWelcomeEmail, sendPasswordResetEmail } from "@/lib/email";
import type { ZodError } from "zod";

const FIELD_KEY_SET: ReadonlySet<string> = new Set(AUTH_FIELD_KEYS);

function fieldErrors(error: ZodError): AuthFieldErrors {
  const out: AuthFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && FIELD_KEY_SET.has(key)) {
      const k = key as keyof AuthFieldErrors;
      (out[k] ??= []).push(issue.message);
    }
  }
  return out;
}

function fail(failure: Omit<AuthFailure, "ok">): AuthFailure {
  return { ok: false, ...failure };
}

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = SignupSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    company: formData.get("company"),
    country: formData.get("country"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return fail({ errors: fieldErrors(parsed.error) });
  }

  const termsAccepted = formData.get("termsAccepted") === "on";
  if (!termsAccepted) {
    return fail({
      errors: {
        termsAccepted: [
          "You must accept the Terms of Service and Privacy Policy.",
        ],
      },
    });
  }
  const marketingConsent = formData.get("marketingConsent") === "on";

  const { firstName, lastName, company, country, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  const fullName = `${firstName} ${lastName}`.trim();

  try {
    await ensureSchema();
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query<{ id: string }>(
      `INSERT INTO users
        (email, name, first_name, last_name, company, country,
         password_hash, marketing_consent, terms_accepted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id::text AS id`,
      [
        email,
        fullName,
        firstName,
        lastName,
        company,
        country,
        hash,
        marketingConsent,
      ],
    );
    const id = result.rows[0]?.id;
    if (!id) {
      return fail({ message: "Could not create your account. Please try again." });
    }
    // New accounts get the long session — they just opted in to marketing/terms,
    // dropping them in 24h would be hostile.
    await createSession(
      { userId: id, email, name: fullName },
      { remember: true },
    );
    sendWelcomeEmail(email, firstName).catch(() => {});
    return { ok: true, user: { id, email, name: fullName } };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      return fail({
        errors: { email: ["An account with this email already exists."] },
      });
    }
    console.error("[signupAction] failed:", err);
    return fail({ message: "Something went wrong on our end. Please try again." });
  }
}

export async function signinAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = SigninSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return fail({ errors: fieldErrors(parsed.error) });
  }
  const rememberMe = formData.get("rememberMe") === "on";
  const email = parsed.data.email.toLowerCase();
  const password = parsed.data.password;

  try {
    await ensureSchema();
    const { rows } = await pool.query<{
      id: string;
      email: string;
      name: string;
      password_hash: string;
    }>(
      "SELECT id::text AS id, email, name, password_hash FROM users WHERE email = $1 LIMIT 1",
      [email],
    );
    const row = rows[0];
    if (!row) {
      return fail({ message: "Invalid email or password." });
    }
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      return fail({ message: "Invalid email or password." });
    }
    await createSession(
      { userId: row.id, email: row.email, name: row.name },
      { remember: rememberMe },
    );
    await pool.query(
      "UPDATE users SET last_login_at = NOW() WHERE id = $1::uuid",
      [row.id],
    );
    return { ok: true, user: { id: row.id, email: row.email, name: row.name } };
  } catch (err) {
    console.error("[signinAction] failed:", err);
    return fail({ message: "Something went wrong on our end. Please try again." });
  }
}

export async function signoutAction(): Promise<void> {
  await deleteSession();
  redirect("/");
}

// --- Password Reset -------------------------------------------------------

export type PasswordResetRequestState =
  | { ok: true }
  | { ok: false; message: string }
  | undefined;

export type PasswordResetState =
  | { ok: true }
  | { ok: false; message: string; errors?: Record<string, string[]> }
  | undefined;

export async function requestPasswordResetAction(
  _prev: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { ok: false, message: "Please enter your email." };

  try {
    await ensureSchema();

    const { rows } = await pool.query<{ id: string; name: string }>(
      "SELECT id::text AS id, name FROM users WHERE email = $1 LIMIT 1",
      [email],
    );
    const user = rows[0];

    // Always return success to prevent email enumeration
    if (!user) return { ok: true };

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1::uuid, $2, NOW() + INTERVAL '1 hour')`,
      [user.id, tokenHash],
    );

    sendPasswordResetEmail(email, user.name, token).catch(() => {});
    return { ok: true };
  } catch (err) {
    console.error("[requestPasswordResetAction] failed:", err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

export async function resetPasswordAction(
  _prev: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const token = formData.get("token") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) return { ok: false, message: "Invalid reset link." };
  if (!newPassword || newPassword.length < 10) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      errors: { newPassword: ["Password must be at least 10 characters."] },
    };
  }
  if (newPassword !== confirmPassword) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      errors: { confirmPassword: ["Passwords do not match."] },
    };
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  try {
    await ensureSchema();

    const { rows } = await pool.query<{ user_id: string }>(
      `SELECT user_id::text AS user_id
         FROM password_reset_tokens
        WHERE token_hash = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        LIMIT 1`,
      [tokenHash],
    );
    const row = rows[0];
    if (!row) {
      return { ok: false, message: "This reset link has expired or is invalid." };
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2::uuid",
      [hash, row.user_id],
    );

    await pool.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE token_hash = $1",
      [tokenHash],
    );

    return { ok: true };
  } catch (err) {
    console.error("[resetPasswordAction] failed:", err);
    return { ok: false, message: "Could not reset password. Please try again." };
  }
}
