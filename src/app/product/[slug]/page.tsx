import { redirect } from "next/navigation";

import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema, pool } from "@/lib/db";
import { ProductAuthForm } from "./auth-form";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await readTenantSession();

  if (session && session.productSlug === slug) {
    await ensureSchema();
    const { rows } = await pool.query<{ onboarding_completed_at: string | null }>(
      `SELECT onboarding_completed_at::text FROM tenants WHERE id = $1::uuid`,
      [session.tenantId],
    );
    if (!rows[0]?.onboarding_completed_at) {
      redirect(`/product/${slug}/onboarding`);
    }
    redirect(`/product/${slug}/dashboard`);
  }

  return <ProductAuthForm />;
}
