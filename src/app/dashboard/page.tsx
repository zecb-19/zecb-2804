import { getCurrentUser } from "@/lib/auth/dal";
import {
  countProductsByStatus,
  listActiveBuildsForUser,
  listRecentAgentRunsForUser,
} from "@/lib/builds/queries";
import { advancePipelinesForUser } from "@/lib/builds/simulator";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  // Advance any in-flight builds before reading — keeps the dashboard
  // honest. Lazy on view; no background workers required.
  await advancePipelinesForUser(user.id);
  const [activeBuilds, recentRuns, statusCounts] = await Promise.all([
    listActiveBuildsForUser(user.id, 6),
    listRecentAgentRunsForUser(user.id, 12),
    countProductsByStatus(user.id),
  ]);
  const firstName = user.name.split(" ")[0] ?? "Founder";
  return (
    <DashboardView
      firstName={firstName}
      activeBuilds={activeBuilds}
      recentRuns={recentRuns}
      statusCounts={statusCounts}
    />
  );
}
