import { redirect } from "next/navigation";

import { TemplateCatalogView } from "@/components/dashboard/TemplateCatalogView";
import { getCurrentUser, isSubscriber } from "@/lib/auth/dal";
import { ensureSchema } from "@/lib/db";
import { listTemplates } from "@/lib/templates/queries";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (isSubscriber(user)) redirect("/dashboard");

  await ensureSchema();
  const templates = await listTemplates();

  return <TemplateCatalogView templates={templates} />;
}
