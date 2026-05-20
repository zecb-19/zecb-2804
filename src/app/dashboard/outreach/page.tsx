import { redirect } from "next/navigation";

import { OutreachQueuesView } from "@/components/dashboard/OutreachQueuesView";
import { OutreachPerformanceView } from "@/components/dashboard/OutreachPerformanceView";
import { getCurrentUser, isSubscriber } from "@/lib/auth/dal";
import { ensureSchema } from "@/lib/db";
import { listProductsForUser } from "@/lib/builds/queries";
import {
  listOutreachQueueItems,
  getOutreachQueueStats,
  getOutreachPerformance,
} from "@/lib/outreach/queries";
import { OutreachTabs } from "./outreach-tabs";

type SearchParams = Promise<{ tab?: string }>;

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (isSubscriber(user)) redirect("/dashboard");

  await ensureSchema();
  const params = (await searchParams) ?? {};
  const tab = params.tab === "performance" ? "performance" : "queues";

  const [items, stats, products, perfData] = await Promise.all([
    listOutreachQueueItems(user.id),
    getOutreachQueueStats(user.id),
    listProductsForUser(user.id),
    getOutreachPerformance(user.id),
  ]);

  const liveProducts = products
    .filter((p) => p.status === "live")
    .map((p) => ({ id: p.id, slug: p.slug, name: p.name }));

  return (
    <div className="space-y-6">
      <OutreachTabs active={tab} />
      {tab === "queues" ? (
        <OutreachQueuesView items={items} stats={stats} products={liveProducts} />
      ) : (
        <OutreachPerformanceView data={perfData} />
      )}
    </div>
  );
}
