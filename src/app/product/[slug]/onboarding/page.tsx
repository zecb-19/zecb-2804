import { redirect } from "next/navigation";
import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema, pool } from "@/lib/db";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await readTenantSession();
  if (!session || session.productSlug !== slug) redirect(`/product/${slug}`);

  await ensureSchema();

  const { rows: tenantRows } = await pool.query<{ onboarding_completed_at: string | null }>(
    `SELECT onboarding_completed_at::text FROM tenants WHERE id = $1::uuid`,
    [session.tenantId],
  );
  if (tenantRows[0]?.onboarding_completed_at) redirect(`/product/${slug}/dashboard`);

  const { rows: sourceRows } = await pool.query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM data_sources WHERE product_id = $1::uuid`,
    [session.productId],
  );
  const { rows: ruleRows } = await pool.query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM alert_rules WHERE product_id = $1::uuid`,
    [session.productId],
  );
  const { rows: obsRows } = await pool.query<{ fields: string[] }>(
    `SELECT ARRAY(SELECT DISTINCT k FROM observations o, jsonb_object_keys(o.measures) AS k WHERE o.product_id = $1::uuid LIMIT 10) AS fields`,
    [session.productId],
  );

  const hasSources = Number(sourceRows[0]?.n ?? 0) > 0;
  const hasRules = Number(ruleRows[0]?.n ?? 0) > 0;
  const availableFields = obsRows[0]?.fields ?? [];

  const { rows: productRows } = await pool.query<{ name: string }>(
    `SELECT name FROM products WHERE id = $1::uuid`,
    [session.productId],
  );
  const productName = productRows[0]?.name ?? slug;

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-6">
      <OnboardingWizard
        slug={slug}
        productName={productName}
        firstName={session.name.split(" ")[0]}
        hasSources={hasSources}
        hasRules={hasRules}
        availableFields={availableFields}
      />
    </div>
  );
}
