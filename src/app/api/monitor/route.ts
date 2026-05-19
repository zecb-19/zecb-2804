import { NextResponse } from "next/server";

import { ensureSchema, pool } from "@/lib/db";
import { runMonitoringCycle } from "@/lib/monitoring/pipeline";
import { log } from "@/lib/log";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedKey = process.env.MONITOR_API_KEY || process.env.AUTH_SECRET;
  if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return NextResponse.json({ error: "Unsupported Media Type" }, { status: 415 });
  }

  try {
    await ensureSchema();

    const body = await request.json().catch(() => ({}));
    const productId = (body as Record<string, unknown>).product_id as string | undefined;

    if (productId) {
      const stats = await runMonitoringCycle(productId);
      return NextResponse.json({ ok: true, product_id: productId, ...stats });
    }

    const { rows } = await pool.query<{ id: string; slug: string }>(
      "SELECT id::text AS id, slug FROM products WHERE status = 'live'",
    );

    const results = [];
    for (const product of rows) {
      try {
        const stats = await runMonitoringCycle(product.id);
        results.push({ product_id: product.id, slug: product.slug, ...stats });
      } catch (err) {
        log.error({ productId: product.id, error: (err as Error).message }, "Monitoring cycle failed");
        results.push({ product_id: product.id, slug: product.slug, error: (err as Error).message });
      }
    }

    return NextResponse.json({ ok: true, products: results.length, results });
  } catch (err) {
    log.error({ error: (err as Error).message }, "Monitor API error");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
