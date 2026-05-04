import { redirect } from "next/navigation";

import { TemplateCatalogView } from "@/components/dashboard/TemplateCatalogView";
import { getCurrentUser } from "@/lib/auth/dal";
import { ensureSchema } from "@/lib/db";
import { listTemplates } from "@/lib/templates/queries";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  await ensureSchema();
  const templates = await listTemplates();

  return <TemplateCatalogView templates={templates} />;
}
