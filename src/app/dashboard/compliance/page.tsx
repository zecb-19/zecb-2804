import { redirect } from "next/navigation";

import { ComplianceGatesView } from "@/components/dashboard/ComplianceGatesView";
import { getCurrentUser } from "@/lib/auth/dal";
import { ensureSchema } from "@/lib/db";
import {
  listComplianceChecks,
  getComplianceSummary,
  getUnsubscribeStats,
} from "@/lib/compliance/queries";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  await ensureSchema();

  const [checks, summary, unsubStats] = await Promise.all([
    listComplianceChecks(),
    getComplianceSummary(),
    getUnsubscribeStats(),
  ]);

  return (
    <ComplianceGatesView
      checks={checks}
      summary={summary}
      unsubStats={unsubStats}
    />
  );
}
