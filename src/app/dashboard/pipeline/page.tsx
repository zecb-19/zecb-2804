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
          <h1 className="text-2xl font-bold text-slate-900">Build Pipeline</h1>
          <p className="text-slate-500 mt-1 max-w-3xl">
            Track every product through the 11-step build process.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 28 }}>rocket_launch</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-4">No builds yet</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">
            Create a BuildSpec and dispatch it to start building your first product.
          </p>
          <Link
            href="/dashboard/buildspec"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Start your first build
          </Link>
        </div>
      </div>
    );
  }

  return <PipelineView products={products} />;
}
