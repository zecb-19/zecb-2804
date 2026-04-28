import "server-only";
import { cache } from "react";
import { pool } from "@/lib/db";
import { readSession } from "./session";

export type CurrentUser = { id: string; email: string; name: string };

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSession();
  if (!session) return null;
  try {
    const { rows } = await pool.query<CurrentUser>(
      "SELECT id::text AS id, email, name FROM users WHERE id = $1::uuid LIMIT 1",
      [session.userId],
    );
    return rows[0] ?? null;
  } catch (err) {
    console.error("[getCurrentUser] db error:", err);
    return null;
  }
});
