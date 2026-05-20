import { getCurrentUser, isSubscriber } from "@/lib/auth/dal";
import {
  countProductsByStatus,
  getOnboardingProgress,
  listActiveBuildsForUser,
  listLaunchApprovalsForUser,
  listRecentAgentRunsForUser,
  sumMonthlyCostForUser,
} from "@/lib/builds/queries";
import { advancePipelinesForUser } from "@/lib/builds/simulator";
import { ensureSchema } from "@/lib/db";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { SubscriberDashboardView } from "@/components/dashboard/SubscriberDashboardView";
import {
  listProductsForSubscriber,
  getSubscriberFinancialSummary,
} from "@/lib/subscriber/queries";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  await ensureSchema();
  const firstName = user.name.split(" ")[0] ?? "Founder";

  if (isSubscriber(user)) {
    const [products, financialSummary] = await Promise.all([
      listProductsForSubscriber(user.id),
      getSubscriberFinancialSummary(user.id),
    ]);
    const pendingApprovals = products.filter(
      (p) => p.status === "building" && p.build_step === p.build_total_steps,
    );
    return (
      <SubscriberDashboardView
        firstName={firstName}
        products={products}
        financialSummary={financialSummary}
        pendingApprovals={pendingApprovals}
      />
    );
  }

  await advancePipelinesForUser(user.id);
  const [activeBuilds, recentRuns, statusCounts, pendingApprovals, monthly, onboarding] =
    await Promise.all([
      listActiveBuildsForUser(user.id, 6),
      listRecentAgentRunsForUser(user.id, 12),
      countProductsByStatus(user.id),
      listLaunchApprovalsForUser(user.id, 10),
      sumMonthlyCostForUser(user.id),
      getOnboardingProgress(user.id),
    ]);
  return (
    <DashboardView
      firstName={firstName}
      activeBuilds={activeBuilds}
      recentRuns={recentRuns}
      statusCounts={statusCounts}
      pendingApprovals={pendingApprovals}
      monthlyOpexEur={monthly.total_eur}
      onboarding={onboarding}
    />
  );
}
