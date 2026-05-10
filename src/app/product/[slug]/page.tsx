import { redirect } from "next/navigation";

import { readTenantSession } from "@/lib/tenant/session";
import { ProductAuthForm } from "./auth-form";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await readTenantSession();

  if (session && session.productSlug === slug) {
    redirect(`/product/${slug}/dashboard`);
  }

  return <ProductAuthForm />;
}
