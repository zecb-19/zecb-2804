"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/dal";
import { createSession } from "@/lib/auth/session";
import { pool } from "@/lib/db";

// --- Types -------------------------------------------------------------------

export type ProfileState =
  | { ok: true }
  | { ok: false; message: string; errors?: Record<string, string[]> }
  | undefined;

export type PasswordState =
  | { ok: true }
  | { ok: false; message: string; errors?: Record<string, string[]> }
  | undefined;

// --- Schemas -----------------------------------------------------------------

const ProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(40).trim(),
  lastName: z.string().min(1, "Last name is required.").max(40).trim(),
  company: z.string().min(2, "Company name must be at least 2 characters.").max(120).trim(),
  country: z.string().min(2, "Select your country."),
});

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(10, "Password must be at least 10 characters.")
      .regex(/[a-z]/, "Must contain a lowercase letter.")
      .regex(/[A-Z]/, "Must contain an uppercase letter.")
      .regex(/[0-9]/, "Must contain a number.")
      .regex(/[^a-zA-Z0-9]/, "Must contain a special character."),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  });

// --- Actions -----------------------------------------------------------------

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Session expired. Please sign in again." };
  }

  const parsed = ProfileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    company: formData.get("company"),
    country: formData.get("country"),
  });

  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      (errors[key] ??= []).push(issue.message);
    }
    return { ok: false, message: "Please fix the errors below.", errors };
  }

  const { firstName, lastName, company, country } = parsed.data;
  const fullName = `${firstName} ${lastName}`.trim();

  try {
    await pool.query(
      `UPDATE users
          SET name = $1, first_name = $2, last_name = $3,
              company = $4, country = $5
        WHERE id = $6::uuid`,
      [fullName, firstName, lastName, company, country, user.id],
    );

    await createSession(
      { userId: user.id, email: user.email, name: fullName },
      { remember: true },
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { ok: true };
  } catch (err) {
    console.error("[updateProfileAction] failed:", err);
    return { ok: false, message: "Could not update profile. Please try again." };
  }
}

export async function changePasswordAction(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Session expired. Please sign in again." };
  }

  const parsed = PasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
  });

  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      (errors[key] ??= []).push(issue.message);
    }
    return { ok: false, message: "Please fix the errors below.", errors };
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    const { rows } = await pool.query<{ password_hash: string }>(
      "SELECT password_hash FROM users WHERE id = $1::uuid LIMIT 1",
      [user.id],
    );
    const row = rows[0];
    if (!row) {
      return { ok: false, message: "Account not found." };
    }

    const valid = await bcrypt.compare(currentPassword, row.password_hash);
    if (!valid) {
      return {
        ok: false,
        message: "Current password is incorrect.",
        errors: { currentPassword: ["Current password is incorrect."] },
      };
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2::uuid",
      [hash, user.id],
    );

    return { ok: true };
  } catch (err) {
    console.error("[changePasswordAction] failed:", err);
    return { ok: false, message: "Could not change password. Please try again." };
  }
}
