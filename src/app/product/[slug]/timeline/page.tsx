import { redirect } from "next/navigation";

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
        <p className="text-slate-900-variant mt-1">
          Chronological observation history across all data sources.
          {observations.length > 0 && ` Showing ${observations.length} most recent.`}
        </p>
      </div>

      {/* Source filter pills */}
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold">
            All ({observations.length})
          </span>
          {sources.map((s) => {
            const count = observations.filter((o) => o.data_source_name === s.name).length;
            return (
              <span key={s.id} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-900-variant text-xs font-semibold">
                {s.name} ({count})
              </span>
            );
          })}
        </div>
      )}

      {observations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <span className="material-symbols-outlined text-slate-900-variant" style={{ fontSize: 40 }}>timeline</span>
          <h3 className="text-lg font-semibold text-slate-900 mt-3">No observations yet</h3>
          <p className="text-slate-900-variant mt-1 text-sm">
            Observations appear here as data sources are monitored.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {observations.map((obs) => (
            <div key={obs.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>visibility</span>
                    <span className="font-semibold text-sm text-slate-900">{obs.data_source_name}</span>
                    <span className="text-xs text-slate-900-variant">
                      {new Date(obs.observed_at).toLocaleString()}
                    </span>
                    {obs.fetch_duration_ms && (
                      <span className="text-xs text-slate-900-variant">
                        {obs.fetch_duration_ms}ms
                      </span>
                    )}
                  </div>

                  {/* Dimensions */}
                  {Object.keys(obs.dimensions).filter((k) => !k.startsWith("_")).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(obs.dimensions)
                        .filter(([k]) => !k.startsWith("_"))
                        .map(([k, v]) => (
                          <span key={k} className="px-2 py-0.5 rounded bg-slate-50 text-xs text-slate-900-variant">
                            {k}: <span className="font-mono text-slate-900">{v}</span>
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Measures */}
                  {Object.keys(obs.measures).length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {Object.entries(obs.measures).map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 rounded bg-blue-50/50 text-xs">
                          {k}: <span className="font-mono font-semibold text-slate-900">{String(v)}</span>
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
