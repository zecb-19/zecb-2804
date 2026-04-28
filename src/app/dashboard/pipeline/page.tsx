import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/dal";
import { listProductsForUser, type ProductRow } from "@/lib/builds/queries";
import { advancePipelinesForUser } from "@/lib/builds/simulator";
import { PipelineView } from "@/components/dashboard/PipelineView";

export default async function Page() {
  const user = await getCurrentUser();
  if (user) await advancePipelinesForUser(user.id);
  const products: ProductRow[] = user ? await listProductsForUser(user.id) : [];

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-h1 text-h1 text-primary">Build Pipeline</h1>
          <p className="text-on-surface-variant mt-1.5 max-w-3xl">
            Live state across the 11-step pipeline per product. Every step logs
            input, output, and cost to the agent_runs ledger.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-surface-variant p-12 text-center">
          <span
            className="material-symbols-outlined text-on-surface-variant"
            style={{ fontSize: 48 }}
          >
            rocket_launch
          </span>
          <h2 className="font-h2 text-h2 text-primary mt-3">
            No builds yet
          </h2>
          <p className="text-on-surface-variant mt-2 max-w-md mx-auto">
            Compose a Monitoring-SaaS BuildSpec and dispatch it to the Build
            Orchestrator. The pipeline runs autonomously through step 10; you
            approve the launch at step 11.
          </p>
          <Link
            href="/dashboard/buildspec"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              add
            </span>
            Start your first build
          </Link>
        </div>
      </div>
    );
  }

  return <PipelineView products={products} />;
}
