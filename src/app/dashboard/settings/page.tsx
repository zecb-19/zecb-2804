import { redirect } from "next/navigation";

import { SettingsView } from "@/components/dashboard/SettingsView";
import { getCurrentUser } from "@/lib/auth/dal";
import {
  getUserProfile,
  getIntegrationStatuses,
  getAccountStats,
} from "@/lib/settings/queries";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [profile, stats] = await Promise.all([
    getUserProfile(user.id),
    getAccountStats(user.id),
  ]);

  if (!profile) redirect("/");

  const integrations = getIntegrationStatuses();

  return (
    <SettingsView
      profile={profile}
      integrations={integrations}
      stats={stats}
    />
  );
}
