import { redirect } from "next/navigation";

import { OutreachQueuesView } from "@/components/dashboard/OutreachQueuesView";
import { getCurrentUser, isSubscriber } from "@/lib/auth/dal";
import { ensureSchema } from "@/lib/db";
import { listProductsForUser } from "@/lib/builds/queries";
import {
  listOutreachQueueItems,
  getOutreachQueueStats,
} from "@/lib/outreach/queries";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (isSubscriber(user)) redirect("/dashboard");

  await ensureSchema();

  const [items, stats, products] = await Promise.all([
    listOutreachQueueItems(user.id),
    getOutreachQueueStats(user.id),
    listProductsForUser(user.id),
  ]);

  const liveProducts = products
    .filter((p) => p.status === "live")
    .map((p) => ({ id: p.id, slug: p.slug, name: p.name }));

  return <OutreachQueuesView items={items} stats={stats} products={liveProducts} />;
}
