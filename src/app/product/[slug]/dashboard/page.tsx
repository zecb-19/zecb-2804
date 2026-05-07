import { redirect } from "next/navigation";
import Link from "next/link";

import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema } from "@/lib/db";
import { getTenantDashboard } from "@/lib/tenant/queries";

export default async function TenantDashboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await readTenantSession();
  if (!session || session.productSlug !== slug) redirect(`/product/${slug}`);

  await ensureSchema();
  const data = await getTenantDashboard(session.productId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-h1 text-h1 text-primary">
          Welcome, {session.name.split(" ")[0]}
        </h1>
        <p className="text-on-surface-variant mt-1">
          Your monitoring overview for <span className="font-mono font-semibold">{slug}</span>
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Kpi label="Data Sources" value={String(data.data_sources)} icon="database" />
        <Kpi label="Observations" value={String(data.observations_total)} icon="visibility" />
        <Kpi label="Today" value={String(data.observations_today)} icon="today" />
        <Kpi label="Alert Rules" value={String(data.alert_rules)} icon="rule" />
        <Kpi label="Alerts" value={String(data.alerts_total)} icon="notifications" />
        <Kpi label="Today" value={String(data.alerts_today)} icon="notification_important" />
      </div>

      {/* Recent observations */}
      <section className="bg-white rounded-xl border border-surface-variant p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-h3 text-h3 text-on-surface">Recent Observations</h2>
          <Link href={`/product/${slug}/timeline`} className="text-primary text-label-sm font-semibold hover:underline">
            View all &rarr;
          </Link>
        </div>
        {data.recent_observations.length === 0 ? (
          <p className="text-on-surface-variant text-body-md py-4 text-center">
            No observations yet. Data sources will populate this once monitoring runs.
          </p>
        ) : (
          <div className="space-y-2">
            {data.recent_observations.map((obs) => (
              <div key={obs.id} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-surface-container-low">
                <span className="text-label-sm font-mono text-on-surface-variant w-16 flex-none pt-0.5">
                  {new Date(obs.observed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-body-md text-on-surface">{obs.source_name}</span>
                  <div className="text-label-sm text-on-surface-variant mt-0.5 flex flex-wrap gap-2">
                    {Object.entries(obs.measures).slice(0, 4).map(([k, v]) => (
                      <span key={k} className="px-1.5 py-0.5 rounded bg-white border border-surface-variant">
                        {k}: <span className="font-mono">{String(v)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent alerts */}
      <section className="bg-white rounded-xl border border-surface-variant p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-h3 text-h3 text-on-surface">Recent Alerts</h2>
          <Link href={`/product/${slug}/alerts`} className="text-primary text-label-sm font-semibold hover:underline">
            View all &rarr;
          </Link>
        </div>
        {data.recent_alerts.length === 0 ? (
          <p className="text-on-surface-variant text-body-md py-4 text-center">
            No alerts triggered yet.{" "}
            <Link href={`/product/${slug}/rules`} className="text-primary hover:underline">
              Create an alert rule
            </Link>{" "}
            to start monitoring.
          </p>
        ) : (
          <div className="space-y-2">
            {data.recent_alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-surface-container-low">
                <span className={"material-symbols-outlined flex-none mt-0.5 " +
                  (alert.status === "sent" ? "text-amber-500" : "text-on-surface-variant")}
                  style={{ fontSize: 18 }}>
                  {alert.status === "sent" ? "warning" : "notifications"}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-body-md text-on-surface">{alert.rule_name}</span>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">{alert.message}</p>
                </div>
                <span className="text-label-sm text-on-surface-variant flex-none">
                  {new Date(alert.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-surface-variant p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>{icon}</span>
        <span className="text-label-sm text-on-surface-variant">{label}</span>
      </div>
      <div className="font-display text-2xl font-bold text-primary leading-none">{value}</div>
    </div>
  );
}
