import { getCurrentUser } from "@/lib/auth/dal";
import {
  listAgentRunsFiltered,
  listDistinctAgentsForUser,
  listProductsForUser,
  type AgentRunFilters,
} from "@/lib/builds/queries";
import { AuditTrailView } from "@/components/dashboard/AuditTrailView";

const PAGE_SIZE = 50;
const VALID_SINCE = ["1h", "24h", "7d", "30d", "all"] as const;

type SearchParams = Promise<{
  agent?: string;
  product?: string;
  since?: string;
  status?: string;
  page?: string;
}>;

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const params = (await searchParams) ?? {};

  const since = (
    VALID_SINCE.includes(params.since as (typeof VALID_SINCE)[number])
      ? params.since
      : "30d"
  ) as AgentRunFilters["since"];

  const status = (
    params.status === "ok" || params.status === "failed"
      ? params.status
      : "all"
  ) as AgentRunFilters["status"];

  const pageNum = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const filters: AgentRunFilters = {
    agent: params.agent || undefined,
    product_slug: params.product || undefined,
    status,
    since,
    limit: PAGE_SIZE + 1, // fetch +1 to detect "has next page"
    offset: (pageNum - 1) * PAGE_SIZE,
  };

  const [rawRuns, agents, products] = await Promise.all([
    listAgentRunsFiltered(user.id, filters),
    listDistinctAgentsForUser(user.id),
    listProductsForUser(user.id),
  ]);

  const hasNext = rawRuns.length > PAGE_SIZE;
  const runs = hasNext ? rawRuns.slice(0, PAGE_SIZE) : rawRuns;
  const totalCostShown = runs.reduce(
    (sum, r) => sum + Number(r.cost_eur ?? 0),
    0,
  );

  return (
    <AuditTrailView
      runs={runs}
      agents={agents}
      productSlugs={products.map((p) => p.slug)}
      filters={{
        agent: params.agent ?? "",
        product: params.product ?? "",
        since: since ?? "30d",
        status: status ?? "all",
      }}
      page={pageNum}
      hasNext={hasNext}
      totalCostShown={totalCostShown}
    />
  );
}
