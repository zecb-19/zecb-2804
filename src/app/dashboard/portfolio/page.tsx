import { redirect } from "next/navigation";

import { PortfolioView } from "@/components/dashboard/PortfolioView";
import { getCurrentUser } from "@/lib/auth/dal";
import {
  listPortfolioProducts,
  computePortfolioSummary,
} from "@/lib/portfolio/queries";
import { advancePipelinesForUser } from "@/lib/builds/simulator";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  await advancePipelinesForUser(user.id);
  const products = await listPortfolioProducts(user.id);
  const summary = computePortfolioSummary(products);

  return <PortfolioView products={products} summary={summary} />;
}
