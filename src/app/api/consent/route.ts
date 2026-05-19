import { NextResponse } from "next/server";
import crypto from "crypto";

import { pool, ensureSchema } from "@/lib/db";

export async function POST(request: Request) {
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return NextResponse.json({ error: "Unsupported Media Type" }, { status: 415 });
  }

  try {
    const body = await request.json();
    const { necessary, analytics, marketing } = body;

    await ensureSchema();

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
    const ua = request.headers.get("user-agent") ?? "";
    const sessionId = crypto.randomUUID();

    const categories = [];
    if (necessary) categories.push("necessary");
    if (analytics) categories.push("analytics");
    if (marketing) categories.push("marketing");

    await pool.query(
      `INSERT INTO consent_ledger (session_id, consent_type, granted, categories, ip_hash, user_agent)
       VALUES ($1, 'cookie', $2, $3::jsonb, $4, $5)`,
      [sessionId, categories.length > 1, JSON.stringify(categories), ipHash, ua.slice(0, 256)],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[consent] failed:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
