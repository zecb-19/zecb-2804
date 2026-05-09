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
  const firstName = session.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJoMTJ6bTAtNHYySDI0di0yaDEyem0wLTR2MkgyNHYtMmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative">
          <p className="text-blue-200 text-sm font-medium">{greeting}</p>
          <h1 className="text-3xl font-bold mt-1">Welcome back, {firstName}</h1>
          <p className="text-blue-100 mt-2 max-w-xl">
            Your monitoring overview for <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-semibold">{slug}</span>
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          label="Data Sources"
          value={data.data_sources}
          icon="database"
          color="blue"
          subtitle="Connected"
          href={`/product/${slug}/settings`}
        />
        <KpiCard
          label="Observations"
          value={data.observations_total}
          icon="visibility"
          color="emerald"
          subtitle={`${data.observations_today} today`}
          href={`/product/${slug}/timeline`}
        />
        <KpiCard
          label="Alert Rules"
          value={data.alert_rules}
          icon="tune"
          color="violet"
          subtitle="Active"
          href={`/product/${slug}/rules`}
        />
        <KpiCard
          label="Total Alerts"
          value={data.alerts_total}
          icon="notifications_active"
          color="amber"
          subtitle={`${data.alerts_today} today`}
          href={`/product/${slug}/alerts`}
        />
        <KpiCard
          label="Today's Data"
          value={data.observations_today}
          icon="today"
          color="cyan"
          subtitle="Observations"
          href={`/product/${slug}/timeline`}
        />
        <KpiCard
          label="Today's Alerts"
          value={data.alerts_today}
          icon="notification_important"
          color="rose"
          subtitle="Triggered"
          href={`/product/${slug}/alerts`}
        />
      </div>

      {/* Getting started steps */}
      {(data.data_sources === 0 || data.alert_rules === 0) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 22 }}>checklist</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Get started</h3>
              <p className="text-sm text-slate-500">Complete these steps to start monitoring</p>
            </div>
          </div>
          <div className="space-y-1">
            <StepItem
              done={data.data_sources > 0}
              label="Add a data source"
              description="Connect an API, website, or RSS feed to monitor"
              href={`/product/${slug}/sources`}
              action="Add source"
            />
            <StepItem
              done={data.alert_rules > 0}
              label="Create an alert rule"
              description="Define conditions that trigger notifications"
              href={`/product/${slug}/rules`}
              action="Create rule"
            />
            <StepItem
              done={data.observations_total > 0}
              label="Run your first monitoring cycle"
              description="Fetch data from your sources and evaluate rules"
              href={`/product/${slug}/sources`}
              action="Run now"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent observations */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 18 }}>visibility</span>
              </div>
              <h2 className="font-bold text-slate-900">Recent Observations</h2>
            </div>
            <Link href={`/product/${slug}/timeline`} className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
              View all
            </Link>
          </div>
          <div className="p-4">
            {data.recent_observations.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 28 }}>visibility_off</span>
                </div>
                <p className="text-slate-500 mt-3 font-medium">No observations yet</p>
                <p className="text-slate-400 text-sm mt-1">Data will appear once monitoring runs begin</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.recent_observations.map((obs) => (
                  <div key={obs.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-none" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-slate-900">{obs.source_name}</span>
                        <span className="text-xs font-mono text-slate-400">
                          {new Date(obs.observed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {Object.entries(obs.measures).slice(0, 3).map(([k, v]) => (
                          <span key={k} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                            {k}: <span className="font-mono">{String(v)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent alerts */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600" style={{ fontSize: 18 }}>notifications_active</span>
              </div>
              <h2 className="font-bold text-slate-900">Recent Alerts</h2>
            </div>
            <Link href={`/product/${slug}/alerts`} className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
              View all
            </Link>
          </div>
          <div className="p-4">
            {data.recent_alerts.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 28 }}>notifications_off</span>
                </div>
                <p className="text-slate-500 mt-3 font-medium">No alerts triggered yet</p>
                <p className="text-slate-400 text-sm mt-1">
                  <Link href={`/product/${slug}/rules`} className="text-blue-600 hover:text-blue-700 font-medium">
                    Create an alert rule
                  </Link>{" "}
                  to start monitoring
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.recent_alerts.map((alert) => {
                  const isSent = alert.status === "sent";
                  return (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${isSent ? "bg-amber-50" : "bg-slate-100"}`}>
                        <span
                          className={`material-symbols-outlined ${isSent ? "text-amber-500" : "text-slate-400"}`}
                          style={{ fontSize: 18 }}
                        >
                          {isSent ? "warning" : "schedule"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">{alert.rule_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isSent ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{alert.message}</p>
                      </div>
                      <span className="text-xs text-slate-400 flex-none whitespace-nowrap">
                        {new Date(alert.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StepItem({ done, label, description, href, action }: { done: boolean; label: string; description: string; href: string; action: string }) {
  return (
    <div className={`flex items-center gap-4 py-3 px-3 rounded-xl ${done ? "bg-emerald-50/50" : "hover:bg-slate-50"} transition-colors`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-none ${done ? "bg-emerald-100" : "border-2 border-slate-200"}`}>
        {done && <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 18 }}>check</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${done ? "text-slate-400 line-through" : "text-slate-900"}`}>{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{description}</div>
      </div>
      {!done && (
        <Link href={href} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex-none">
          {action}
        </Link>
      )}
    </div>
  );
}

const COLOR_MAP = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", value: "text-blue-700", ring: "ring-blue-100" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", value: "text-emerald-700", ring: "ring-emerald-100" },
  violet: { bg: "bg-violet-50", icon: "text-violet-600", value: "text-violet-700", ring: "ring-violet-100" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", value: "text-amber-700", ring: "ring-amber-100" },
  cyan: { bg: "bg-cyan-50", icon: "text-cyan-600", value: "text-cyan-700", ring: "ring-cyan-100" },
  rose: { bg: "bg-rose-50", icon: "text-rose-600", value: "text-rose-700", ring: "ring-rose-100" },
} as const;

function KpiCard({
  label,
  value,
  icon,
  color,
  subtitle,
  href,
}: {
  label: string;
  value: number;
  icon: string;
  color: keyof typeof COLOR_MAP;
  subtitle: string;
  href: string;
}) {
  const c = COLOR_MAP[color];
  return (
    <Link href={href} className="group block">
      <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all ring-1 ${c.ring}`}>
        <div className="flex items-center justify-between">
          <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
            <span className={`material-symbols-outlined ${c.icon}`} style={{ fontSize: 22 }}>{icon}</span>
          </div>
          <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-400 transition-colors" style={{ fontSize: 18 }}>
            arrow_forward
          </span>
        </div>
        <div className={`text-3xl font-bold ${c.value} mt-3`}>{value}</div>
        <div className="text-sm text-slate-500 mt-0.5">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>
      </div>
    </Link>
  );
}
