import { redirect } from "next/navigation";

import { OutreachQueuesView } from "@/components/dashboard/OutreachQueuesView";
import { getCurrentUser } from "@/lib/auth/dal";
import { ensureSchema } from "@/lib/db";
import {
  listOutreachQueueItems,
  getOutreachQueueStats,
} from "@/lib/outreach/queries";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  await ensureSchema();

  const [items, stats] = await Promise.all([
    listOutreachQueueItems(user.id),
    getOutreachQueueStats(user.id),
  ]);

  return <OutreachQueuesView items={items} stats={stats} />;
}
