import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { readSession } from "@/lib/auth/session";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await pool.query(
    `SELECT ar.id, ar.product_id, ar.input, ar.created_at, p.slug AS product_slug
       FROM agent_runs ar
       JOIN products p ON p.id = ar.product_id
      WHERE ar.task_name = 'in_app_alert'
        AND p.owner_user_id = $1::uuid
        AND ar.created_at > NOW() - INTERVAL '30 days'
      ORDER BY ar.created_at DESC
      LIMIT 20`,
    [session.userId],
  );

  return NextResponse.json({ notifications: rows });
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return NextResponse.json({ error: "Unsupported Media Type" }, { status: 415 });
  }

  const body = await request.json();
  const { id } = body as { id?: string };
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await pool.query(
    `UPDATE agent_runs SET output = COALESCE(output, '{}'::jsonb) || '{"read": true}'::jsonb
     WHERE id = $1::uuid AND task_name = 'in_app_alert'`,
    [id],
  );

  return NextResponse.json({ ok: true });
}
