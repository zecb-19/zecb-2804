import { redirect } from "next/navigation";
import Link from "next/link";

import { readTenantSession } from "@/lib/tenant/session";
import { ensureSchema } from "@/lib/db";
import { listAlertsForProduct } from "@/lib/monitoring/queries";

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await readTenantSession();
  if (!session || session.productSlug !== slug) redirect(`/product/${slug}`);

  await ensureSchema();
  const alerts = await listAlertsForProduct(session.productId, 100);

  const statusConfig: Record<string, { icon: string; iconColor: string; bgColor: string; borderColor: string; label: string; labelColor: string }> = {
    sent: { icon: "warning", iconColor: "text-amber-500", bgColor: "bg-amber-50", borderColor: "border-amber-200", label: "Triggered", labelColor: "bg-amber-50 text-amber-700 border-amber-200" },
    pending: { icon: "schedule", iconColor: "text-slate-400", bgColor: "bg-slate-50", borderColor: "border-slate-200", label: "Pending", labelColor: "bg-slate-100 text-slate-500 border-slate-200" },
    delivered: { icon: "check_circle", iconColor: "text-emerald-500", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", label: "Delivered", labelColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
        <p className="text-slate-500 mt-1">
          Triggered notifications from your alert rules.
          {alerts.length > 0 && ` ${alerts.length} in history.`}
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 32 }}>notifications_off</span>
          </div>
          <h3 className="font-bold text-slate-900 mt-5 text-lg">No alerts yet</h3>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            Alerts appear when monitoring rules are triggered.{" "}
            <Link href={`/product/${slug}/rules`} className="text-blue-600 font-semibold hover:text-blue-700">Create a rule</Link> to start monitoring.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const cfg = statusConfig[alert.status] ?? statusConfig.pending;
            return (
              <div key={alert.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-slate-300 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bgColor} flex items-center justify-center flex-none`}>
                    <span className={`material-symbols-outlined ${cfg.iconColor}`} style={{ fontSize: 22 }}>{cfg.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">{alert.rule_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.labelColor}`}>
                          {cfg.label}
                        </span>
                        {alert.channels.map((ch) => (
                          <span key={ch} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">
                            {ch}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-slate-400 flex-none text-right font-mono">
                        {new Date(alert.created_at).toISOString().slice(0, 16).replace("T", " ")}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{alert.message}</p>
                    {alert.notified_at && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                        Notified at {new Date(alert.notified_at).toISOString().slice(11, 16)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
