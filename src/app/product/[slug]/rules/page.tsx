import { redirect } from "next/navigation";

import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema } from "@/lib/db";
import { listAlertRulesForProduct, listDataSourcesForProduct } from "@/lib/monitoring/queries";
import { RulesView } from "./rules-view";

export default async function RulesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await readTenantSession();
  if (!session || session.productSlug !== slug) redirect(`/product/${slug}`);

  await ensureSchema();

  const [rules, sources] = await Promise.all([
    listAlertRulesForProduct(session.productId),
    listDataSourcesForProduct(session.productId),
  ]);

  return (
    <RulesView
      rules={rules}
      sources={sources}
      slug={slug}
    />
  );
}
