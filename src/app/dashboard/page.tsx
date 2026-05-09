import { getCurrentUser } from "@/lib/auth/dal";
import {
  countProductsByStatus,
  getOnboardingProgress,
  listActiveBuildsForUser,
  listLaunchApprovalsForUser,
  listRecentAgentRunsForUser,
  sumMonthlyCostForUser,
} from "@/lib/builds/queries";
import { advancePipelinesForUser } from "@/lib/builds/simulator";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
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
  const firstName = user.name.split(" ")[0] ?? "Founder";
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
