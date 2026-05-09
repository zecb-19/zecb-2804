import { BuildSpecForm } from "@/components/dashboard/BuildSpecForm";
import { getCurrentUser } from "@/lib/auth/dal";
import type { BuildSpec } from "@/lib/builds/definitions";
import { getIdeaById, ideaToBuildSpec } from "@/lib/ideas/queries";

type SearchParams = Promise<{ from?: string }>;

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  let initialSpec: BuildSpec | undefined;
  let fromLabel: string | undefined;

  if (params.from) {
    const user = await getCurrentUser();
    if (user) {
      const idea = await getIdeaById(user.id, params.from);
      if (idea) {
        initialSpec = ideaToBuildSpec(idea);
        fromLabel = idea.opportunity;
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">BuildSpec</h1>
        <p className="text-slate-500 mt-1 max-w-3xl">
          Configure your Monitoring-SaaS product. Every field is validated before the build starts.
        </p>
      </div>
      <BuildSpecForm initialSpec={initialSpec} fromLabel={fromLabel} />
    </div>
  );
}
