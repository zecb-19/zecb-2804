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
    const body = (await request.json()) as {
      notify_channels?: string[];
      email_preferences?: Record<string, boolean>;
    };

    if (body.notify_channels) {
      await pool.query(
        "UPDATE tenants SET notify_channels = $1::jsonb WHERE id = $2::uuid",
        [JSON.stringify(body.notify_channels), session.tenantId],
      );
    }

    if (body.email_preferences) {
      await pool.query(
        "UPDATE tenants SET email_preferences = $1::jsonb WHERE id = $2::uuid",
        [JSON.stringify(body.email_preferences), session.tenantId],
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
