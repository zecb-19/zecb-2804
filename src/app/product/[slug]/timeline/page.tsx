import { redirect } from "next/navigation";
import Link from "next/link";

import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema } from "@/lib/db";
import { listObservationsForProduct, listDataSourcesForProduct } from "@/lib/monitoring/queries";

import { TimelineClient } from "./timeline-client";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await readTenantSession();
  if (!session || session.productSlug !== slug) redirect(`/product/${slug}`);

  await ensureSchema();
  const [observations, sources] = await Promise.all([
    listObservationsForProduct(session.productId, 200),
    listDataSourcesForProduct(session.productId),
  ]);

  return <TimelineClient slug={slug} observations={observations} sources={sources} />;
}
