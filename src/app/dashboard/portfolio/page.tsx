import { redirect } from "next/navigation";

import { PortfolioView } from "@/components/dashboard/PortfolioView";
import { getCurrentUser } from "@/lib/auth/dal";
import {
  listPortfolioProducts,
  computePortfolioSummary,
  getPortfolioPnL,
} from "@/lib/portfolio/queries";
import { advancePipelinesForUser } from "@/lib/builds/simulator";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  await advancePipelinesForUser(user.id);
  const [products, pnl] = await Promise.all([
    listPortfolioProducts(user.id),
    getPortfolioPnL(user.id),
  ]);
  const summary = computePortfolioSummary(products);

  return <PortfolioView products={products} summary={summary} pnl={pnl} />;
}
