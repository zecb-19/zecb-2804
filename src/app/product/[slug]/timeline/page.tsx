import { redirect } from "next/navigation";
import Link from "next/link";

import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema } from "@/lib/db";
import { listObservationsForProduct, listDataSourcesForProduct } from "@/lib/monitoring/queries";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await readTenantSession();
  if (!session || session.productSlug !== slug) redirect(`/product/${slug}`);

  await ensureSchema();
  const [observations, sources] = await Promise.all([
    listObservationsForProduct(session.productId, 100),
    listDataSourcesForProduct(session.productId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Timeline</h1>
        <p className="text-slate-500 mt-1">
          Chronological observations across all sources.
          {observations.length > 0 && ` Showing ${observations.length} most recent.`}
        </p>
      </div>

      {sources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-sm">
            All ({observations.length})
          </span>
          {sources.map((s) => {
            const count = observations.filter((o) => o.data_source_name === s.name).length;
            return (
              <span key={s.id} className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-semibold hover:border-slate-300 hover:text-slate-700 transition-colors cursor-default">
                {s.name} ({count})
              </span>
            );
          })}
        </div>
      )}

      {observations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 32 }}>timeline</span>
          </div>
          <h3 className="font-bold text-slate-900 mt-5 text-lg">No observations yet</h3>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            Observations appear here as data sources are monitored.{" "}
            <Link href={`/product/${slug}/sources`} className="text-blue-600 font-semibold hover:text-blue-700">Add a source</Link> to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {observations.map((obs) => (
            <div key={obs.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-slate-300 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-none">
                  <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 20 }}>visibility</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900">{obs.data_source_name}</span>
                      {obs.fetch_duration_ms && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs">{obs.fetch_duration_ms}ms</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono flex-none">
                      {new Date(obs.observed_at).toISOString().slice(0, 16).replace("T", " ")}
                    </span>
                  </div>

                  {Object.keys(obs.dimensions).filter((k) => !k.startsWith("_")).length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {Object.entries(obs.dimensions).filter(([k]) => !k.startsWith("_")).map(([k, v]) => (
                        <span key={k} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500">
                          {k}: <span className="font-mono text-slate-700">{v}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {Object.keys(obs.measures).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(obs.measures).map(([k, v]) => (
                        <span key={k} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-xs">
                          {k}: <span className="font-mono font-semibold text-blue-700">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
