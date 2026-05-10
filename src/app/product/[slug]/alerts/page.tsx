import { redirect } from "next/navigation";

import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema } from "@/lib/db";
import { listAlertsForProduct } from "@/lib/monitoring/queries";

import { AlertsClient } from "./alerts-client";

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await readTenantSession();
  if (!session || session.productSlug !== slug) redirect(`/product/${slug}`);

  await ensureSchema();
  const alerts = await listAlertsForProduct(session.productId, 200);

  return <AlertsClient slug={slug} alerts={alerts} />;
}
