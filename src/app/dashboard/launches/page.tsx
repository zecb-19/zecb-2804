import { redirect } from "next/navigation";

import { LaunchApprovalView } from "@/components/dashboard/LaunchApprovalView";
import { getCurrentUser } from "@/lib/auth/dal";
import { listLaunchReviewsForUser } from "@/lib/builds/queries";
import { advancePipelinesForUser } from "@/lib/builds/simulator";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  await advancePipelinesForUser(user.id);
  const products = await listLaunchReviewsForUser(user.id);

  return <LaunchApprovalView products={products} />;
}
