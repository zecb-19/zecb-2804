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
        <h1 className="font-h1 text-h1 text-primary">Timeline</h1>
        <p className="text-on-surface-variant mt-1">
          Chronological observation history across all data sources.
          {observations.length > 0 && ` Showing ${observations.length} most recent.`}
        </p>
      </div>

      {/* Source filter pills */}
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-full bg-primary text-on-primary text-label-sm font-semibold">
            All ({observations.length})
          </span>
          {sources.map((s) => {
            const count = observations.filter((o) => o.data_source_name === s.name).length;
            return (
              <span key={s.id} className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-label-sm font-semibold">
                {s.name} ({count})
              </span>
            );
          })}
        </div>
      )}

      {observations.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-variant p-8 text-center">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 40 }}>timeline</span>
          <h3 className="font-h3 text-h3 text-on-surface mt-3">No observations yet</h3>
          <p className="text-on-surface-variant mt-1 text-body-md">
            Observations appear here as data sources are monitored.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {observations.map((obs) => (
            <div key={obs.id} className="bg-white rounded-xl border border-surface-variant p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>visibility</span>
                    <span className="font-semibold text-body-md text-on-surface">{obs.data_source_name}</span>
                    <span className="text-label-sm text-on-surface-variant">
                      {new Date(obs.observed_at).toLocaleString()}
                    </span>
                    {obs.fetch_duration_ms && (
                      <span className="text-label-sm text-on-surface-variant">
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
                          <span key={k} className="px-2 py-0.5 rounded bg-surface-container-low text-label-sm text-on-surface-variant">
                            {k}: <span className="font-mono text-on-surface">{v}</span>
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Measures */}
                  {Object.keys(obs.measures).length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {Object.entries(obs.measures).map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 rounded bg-secondary-fixed/50 text-label-sm">
                          {k}: <span className="font-mono font-semibold text-on-surface">{String(v)}</span>
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
