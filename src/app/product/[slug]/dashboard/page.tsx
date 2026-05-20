import { redirect } from "next/navigation";
import Link from "next/link";

import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema } from "@/lib/db";
import { getTenantDashboard, type DayCount, type SourceHealth } from "@/lib/tenant/queries";

export default async function TenantDashboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await readTenantSession();
  if (!session || session.productSlug !== slug) redirect(`/product/${slug}`);

  await ensureSchema();
  const d = await getTenantDashboard(session.productId);
  const firstName = session.name.split(" ")[0];

  const healthySources = d.source_health.filter((s) => s.last_fetch_status === "ok").length;
  const totalSources = d.source_health.length;
  const allHealthy = totalSources > 0 && healthySources === totalSources;
  const someDown = totalSources > 0 && healthySources < totalSources;

  return (
    <div className="space-y-6">
      {/* System Status Bar */}
      <div className={`flex items-center justify-between px-5 py-3 rounded-2xl border ${
        allHealthy ? "bg-emerald-50/60 border-emerald-200" : someDown ? "bg-amber-50/60 border-amber-200" : "bg-slate-50 border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              allHealthy ? "bg-emerald-400" : someDown ? "bg-amber-400" : "bg-slate-400"
            }`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              allHealthy ? "bg-emerald-500" : someDown ? "bg-amber-500" : "bg-slate-400"
            }`} />
          </span>
          <span className={`text-sm font-semibold ${
            allHealthy ? "text-emerald-800" : someDown ? "text-amber-800" : "text-slate-600"
          }`}>
            {allHealthy ? "All systems operational" : someDown ? `${totalSources - healthySources} source${totalSources - healthySources > 1 ? "s" : ""} need attention` : "No sources configured"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
          {d.source_health.length > 0 && d.source_health[0].last_fetch_at
            ? `Last check ${timeAgo(d.source_health[0].last_fetch_at)}`
            : "No checks yet"}
        </div>
      </div>

      {/* Hero Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sources Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sources</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>sensors</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">{d.data_sources}</span>
            <span className="text-sm text-slate-400">active</span>
          </div>
          <div className="flex gap-1.5 mt-4">
            {d.source_health.map((s) => (
              <div
                key={s.id}
                title={`${s.name}: ${s.last_fetch_status === "ok" ? "healthy" : s.last_fetch_status ?? "unknown"}`}
                className={`h-2 flex-1 rounded-full ${
                  s.last_fetch_status === "ok" ? "bg-emerald-400" : s.last_fetch_status ? "bg-amber-400" : "bg-slate-200"
                }`}
              />
            ))}
            {d.source_health.length === 0 && <div className="h-2 flex-1 rounded-full bg-slate-100" />}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {healthySources}/{totalSources} healthy
          </div>
        </div>

        {/* Observations Card with Sparkline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Observations</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>monitoring</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">{d.observations_total}</span>
            <span className="text-sm text-slate-400">total</span>
          </div>
          <div className="mt-4 h-10">
            <Sparkline data={d.obs_sparkline} color="#10b981" />
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {d.observations_today > 0 ? (
              <span className="text-emerald-600 font-semibold">+{d.observations_today} today</span>
            ) : "No data today"}
            <span className="mx-1.5">·</span>Last 14 days
          </div>
        </div>

        {/* Alerts Card with Sparkline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Alerts</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
              d.alerts_today > 0
                ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20"
                : "bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-400/20"
            }`}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>
                {d.alerts_today > 0 ? "notifications_active" : "notifications_none"}
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">{d.alerts_total}</span>
            <span className="text-sm text-slate-400">triggered</span>
          </div>
          <div className="mt-4 h-10">
            <Sparkline data={d.alerts_sparkline} color="#f59e0b" />
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {d.alerts_today > 0 ? (
              <span className="text-amber-600 font-semibold">{d.alerts_today} today</span>
            ) : "Quiet today"}
            <span className="mx-1.5">·</span>{d.alert_rules} rule{d.alert_rules !== 1 ? "s" : ""} active
          </div>
        </div>
      </div>

      {/* Source Health Cards */}
      {d.source_health.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Source Health</h2>
            <Link href={`/product/${slug}/sources`} className="text-xs text-blue-600 font-semibold hover:text-blue-700">
              Manage sources
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {d.source_health.map((source) => (
              <SourceCard key={source.id} source={source} slug={slug} />
            ))}
          </div>
        </div>
      )}

      {/* Getting started — only show if nothing configured */}
      {(d.data_sources === 0 || d.alert_rules === 0) && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h3 className="text-xl font-bold">Get monitoring in 3 steps</h3>
            <p className="text-slate-400 mt-1 text-sm">Set up in under 2 minutes. No code required.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <StepCard
                step={1}
                done={d.data_sources > 0}
                title="Connect a source"
                desc="API, website, or RSS feed"
                href={`/product/${slug}/sources`}
                icon="link"
              />
              <StepCard
                step={2}
                done={d.alert_rules > 0}
                title="Create an alert rule"
                desc="Price change, new item, deadline"
                href={`/product/${slug}/rules`}
                icon="tune"
              />
              <StepCard
                step={3}
                done={d.observations_total > 0}
                title="Get your first alert"
                desc="Email, Slack, or webhook"
                href={`/product/${slug}/sources`}
                icon="notifications"
              />
            </div>
          </div>
        </div>
      )}

      {/* Two-column feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Feed */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-bold text-slate-900">Live Feed</h2>
            </div>
            <Link href={`/product/${slug}/timeline`} className="text-xs text-blue-600 font-semibold hover:text-blue-700">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {d.recent_observations.length === 0 ? (
              <EmptyState icon="stream" message="No data points yet" sub="Observations will appear once monitoring starts" />
            ) : (
              d.recent_observations.map((obs) => (
                <div key={obs.id} className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${kindBg(obs.source_kind)}`}>
                        <span className={`material-symbols-outlined ${kindColor(obs.source_kind)}`} style={{ fontSize: 16 }}>
                          {kindIcon(obs.source_kind)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{obs.source_name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(obs.measures).slice(0, 3).map(([k, v]) => (
                            <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600">
                              <span className="text-slate-400">{formatKey(k)}</span>
                              <span className="font-mono font-semibold text-slate-800">{formatValue(v)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 flex-none tabular-nums">
                      {timeAgo(obs.observed_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Alerts */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Recent Alerts</h2>
            <Link href={`/product/${slug}/alerts`} className="text-xs text-blue-600 font-semibold hover:text-blue-700">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {d.recent_alerts.length === 0 ? (
              <EmptyState
                icon="shield"
                message="All clear"
                sub={<>No alerts triggered yet. <Link href={`/product/${slug}/rules`} className="text-blue-600 hover:underline">Create a rule</Link> to start.</>}
              />
            ) : (
              d.recent_alerts.map((alert) => {
                const isSent = alert.status === "sent" || alert.status === "pending";
                return (
                  <div key={alert.id} className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none mt-0.5 ${
                        isSent ? "bg-amber-100" : "bg-emerald-100"
                      }`}>
                        <span className={`material-symbols-outlined ${isSent ? "text-amber-600" : "text-emerald-600"}`} style={{ fontSize: 16 }}>
                          {isSent ? "warning" : "check_circle"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate">{alert.rule_name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isSent ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{alert.message}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 flex-none tabular-nums whitespace-nowrap">
                        {timeAgo(alert.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ─── Helper Components ──────────────────────────────────────────── */

function Sparkline({ data, color }: { data: DayCount[]; color: string }) {
  if (data.length === 0) return <div className="h-full bg-slate-50 rounded-lg" />;
  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 200;
  const h = 40;
  const gap = w / (data.length - 1 || 1);
  const points = data.map((d, i) => `${i * gap},${h - (d.count / max) * (h - 4) - 2}`);
  const line = points.join(" ");
  const areaPoints = `0,${h} ${line} ${(data.length - 1) * gap},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sg-${color.replace("#", "")})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.length > 0 && (
        <circle cx={(data.length - 1) * gap} cy={h - (data[data.length - 1].count / max) * (h - 4) - 2} r="3" fill={color} />
      )}
    </svg>
  );
}

function SourceCard({ source, slug }: { source: SourceHealth; slug: string }) {
  const isOk = source.last_fetch_status === "ok";
  const isUnknown = !source.last_fetch_status;
  return (
    <Link
      href={`/product/${slug}/sources`}
      className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kindBg(source.kind)}`}>
          <span className={`material-symbols-outlined ${kindColor(source.kind)}`} style={{ fontSize: 18 }}>
            {kindIcon(source.kind)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
            {source.name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-none ${isOk ? "bg-emerald-500" : isUnknown ? "bg-slate-300" : "bg-amber-500"}`} />
            <span className="text-[11px] text-slate-400">
              {isOk ? "Healthy" : isUnknown ? "Pending" : "Check failed"}
              {source.last_fetch_at ? ` · ${timeAgo(source.last_fetch_at)}` : ""}
            </span>
          </div>
        </div>
        <div className="text-right flex-none">
          <div className="text-lg font-bold text-slate-700">{source.observations_count}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">fetches</div>
        </div>
      </div>
    </Link>
  );
}

function StepCard({ step, done, title, desc, href, icon }: { step: number; done: boolean; title: string; desc: string; href: string; icon: string }) {
  return (
    <Link href={href} className={`block rounded-xl p-4 border transition-all duration-200 ${
      done ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
    }`}>
      <div className="flex items-center gap-2 mb-2">
        {done ? (
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 14 }}>check</span>
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center text-xs font-bold text-white/60">
            {step}
          </div>
        )}
        <span className="material-symbols-outlined text-white/40" style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div className={`text-sm font-semibold ${done ? "text-emerald-300" : "text-white"}`}>{title}</div>
      <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
    </Link>
  );
}

function EmptyState({ icon, message, sub }: { icon: string; message: string; sub: React.ReactNode }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 32 }}>{icon}</span>
      </div>
      <p className="text-slate-600 mt-4 font-semibold">{message}</p>
      <p className="text-sm text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

/* ─── Formatters ─────────────────────────────────────────────────── */

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatKey(k: string): string {
  return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(v: unknown): string {
  if (typeof v === "number") {
    if (v >= 1000) return v.toLocaleString("de-DE");
    if (v % 1 !== 0) return v.toFixed(2);
    return String(v);
  }
  return String(v);
}

const KIND_CONFIG: Record<string, { icon: string; bg: string; color: string }> = {
  http_api: { icon: "api", bg: "bg-blue-100", color: "text-blue-600" },
  webscrape: { icon: "language", bg: "bg-violet-100", color: "text-violet-600" },
  rss: { icon: "rss_feed", bg: "bg-orange-100", color: "text-orange-600" },
  csv_upload: { icon: "upload_file", bg: "bg-emerald-100", color: "text-emerald-600" },
  google_sheets: { icon: "table_chart", bg: "bg-green-100", color: "text-green-600" },
  pdf_watch: { icon: "picture_as_pdf", bg: "bg-red-100", color: "text-red-600" },
  email_inbound: { icon: "email", bg: "bg-cyan-100", color: "text-cyan-600" },
};

function kindIcon(kind: string) { return KIND_CONFIG[kind]?.icon ?? "database"; }
function kindBg(kind: string) { return KIND_CONFIG[kind]?.bg ?? "bg-slate-100"; }
function kindColor(kind: string) { return KIND_CONFIG[kind]?.color ?? "text-slate-600"; }
