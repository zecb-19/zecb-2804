import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { readTenantSession } from "@/lib/tenant/session";

export async function POST(request: Request) {
  const session = await readTenantSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return NextResponse.json({ error: "Unsupported Media Type" }, { status: 415 });
  }

  try {
    const body = await request.json();
    const channels = (body as { notify_channels?: string[] }).notify_channels ?? ["email"];

    await pool.query(
      "UPDATE tenants SET notify_channels = $1::jsonb WHERE id = $2::uuid",
      [JSON.stringify(channels), session.tenantId],
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
