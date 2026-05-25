import { NextResponse } from "next/server";
import { ensureSchema, pool } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const slug = url.searchParams.get("slug") || "";

  if (!token) {
    return NextResponse.redirect(new URL(`/p/${slug}?verified=error`, request.url));
  }

  try {
    await ensureSchema();

    const { rows } = await pool.query<{ id: string }>(
      `UPDATE product_subscribers
          SET status = 'verified',
              verified_at = NOW(),
              verification_token = NULL
        WHERE verification_token = $1
          AND verified_at IS NULL
        RETURNING id::text AS id`,
      [token],
    );

    if (rows.length === 0) {
      return NextResponse.redirect(new URL(`/p/${slug}?verified=already`, request.url));
    }

    return NextResponse.redirect(new URL(`/p/${slug}?verified=success`, request.url));
  } catch (err) {
    console.error("[subscriber:verify] failed:", err);
    return NextResponse.redirect(new URL(`/p/${slug}?verified=error`, request.url));
  }
}
