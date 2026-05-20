import "server-only";
import { cache } from "react";
import { pool } from "@/lib/db";
import { readSession, type UserRole } from "./session";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSession();
  if (!session) return null;
  try {
    const { rows } = await pool.query<{ id: string; email: string; name: string; role: string }>(
      "SELECT id::text AS id, email, name, COALESCE(role, 'member') AS role FROM users WHERE id = $1::uuid LIMIT 1",
      [session.userId],
    );
    const row = rows[0];
    if (!row) return null;
    const dbRole = row.role;
    const role: UserRole = dbRole === "admin" ? "admin" : dbRole === "subscriber" ? "subscriber" : "operator";
    return { id: row.id, email: row.email, name: row.name, role };
  } catch (err) {
    console.error("[getCurrentUser] db error:", err);
    return null;
  }
});

export function isOperator(user: CurrentUser): boolean {
  return user.role === "operator" || user.role === "admin";
}

export function isSubscriber(user: CurrentUser): boolean {
  return user.role === "subscriber";
}

export function isAdmin(user: CurrentUser): boolean {
  return user.role === "admin";
}
