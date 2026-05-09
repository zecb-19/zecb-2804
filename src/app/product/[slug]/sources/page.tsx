import { redirect } from "next/navigation";

import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema } from "@/lib/db";
import { listDataSourcesForProduct } from "@/lib/monitoring/queries";

import { SourcesView } from "./sources-view";

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await readTenantSession();
  if (!session || session.productSlug !== slug) redirect(`/product/${slug}`);

  await ensureSchema();
  const sources = await listDataSourcesForProduct(session.productId);

  return <SourcesView slug={slug} sources={sources} />;
}
