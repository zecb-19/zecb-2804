import { redirect } from "next/navigation";
import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema, pool } from "@/lib/db";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await readTenantSession();
  if (!session || session.productSlug !== slug) redirect(`/product/${slug}`);

  await ensureSchema();
  const { rows } = await pool.query<{
    report_type: string;
    enabled: boolean;
    delivery_time: string;
    timezone: string;
  }>(
    `SELECT report_type, enabled, delivery_time, timezone FROM report_configs WHERE product_id = $1::uuid AND tenant_id = $2::uuid`,
    [session.productId, session.tenantId],
  );

  const daily = rows.find((r) => r.report_type === "daily");
  const weekly = rows.find((r) => r.report_type === "weekly");

  return (
    <ReportsClient
      slug={slug}
      dailyEnabled={daily?.enabled ?? false}
      weeklyEnabled={weekly?.enabled ?? false}
      deliveryTime={daily?.delivery_time ?? "08:00"}
      timezone={daily?.timezone ?? "Europe/Berlin"}
    />
  );
}
