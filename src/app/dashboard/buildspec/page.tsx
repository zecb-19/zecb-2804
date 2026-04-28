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
        <h1 className="font-h1 text-h1 text-primary">BuildSpec Authoring</h1>
        <p className="text-on-surface-variant mt-1.5 max-w-3xl">
          Compose a Monitoring-SaaS BuildSpec. Schema-validated against PRD
          Appendix B before dispatch — invalid configs return field-level
          errors, not silent failures.
        </p>
      </div>
      <BuildSpecForm initialSpec={initialSpec} fromLabel={fromLabel} />
    </div>
  );
}
