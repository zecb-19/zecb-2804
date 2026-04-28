"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

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
