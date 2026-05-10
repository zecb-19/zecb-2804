import { redirect } from "next/navigation";

import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema, pool } from "@/lib/db";
import { SettingsClient } from "./settings-client";

export default async function TenantSettings({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await readTenantSession();
  if (!session || session.productSlug !== slug) redirect(`/product/${slug}`);

  await ensureSchema();

  const [tenantResult, productResult] = await Promise.all([
    pool.query<{
      plan: string;
      notify_channels: string;
      email: string;
      name: string;
      created_at: string;
    }>(
      `SELECT plan, notify_channels::text AS notify_channels, email, name,
              created_at::text AS created_at
         FROM tenants WHERE id = $1::uuid`,
      [session.tenantId],
    ),
    pool.query<{ pricing_tiers: string }>(
      `SELECT pricing_tiers::text AS pricing_tiers FROM products WHERE id = $1::uuid`,
      [session.productId],
    ),
  ]);

  const tenant = tenantResult.rows[0];
  if (!tenant) redirect(`/product/${slug}`);

  let channels: string[] = [];
  try { channels = JSON.parse(tenant.notify_channels); } catch { /* */ }

  let tiers: Array<{ name: string; price_eur_monthly: number; limits: Record<string, number> }> = [];
  try { tiers = JSON.parse(productResult.rows[0]?.pricing_tiers ?? "[]"); } catch { /* */ }

  return (
    <SettingsClient
      slug={slug}
      email={tenant.email}
      name={tenant.name}
      plan={tenant.plan}
      channels={channels}
      createdAt={tenant.created_at}
      pricingTiers={tiers}
    />
  );
}
