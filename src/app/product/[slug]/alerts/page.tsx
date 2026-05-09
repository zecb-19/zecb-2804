import { redirect } from "next/navigation";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
        <p className="text-slate-500 mt-1">
          Triggered notifications from your alert rules.
          {alerts.length > 0 && ` ${alerts.length} alerts in history.`}
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 40 }}>notifications_off</span>
          <h3 className="text-lg font-semibold text-slate-900 mt-3">No alerts yet</h3>
          <p className="text-slate-500 mt-1 text-sm">
            Alerts appear here when your monitoring rules are triggered.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={
                    "material-symbols-outlined flex-none mt-0.5 " +
                    (alert.status === "sent" ? "text-amber-500" : alert.status === "pending" ? "text-slate-500" : "text-emerald-500")
                  } style={{ fontSize: 20 }}>
                    {alert.status === "sent" ? "warning" : alert.status === "pending" ? "schedule" : "check_circle"}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900">{alert.rule_name}</span>
                      <span className={
                        "px-2 py-0.5 rounded-full text-xs font-semibold " +
                        (alert.status === "sent" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500")
                      }>
                        {alert.status}
                      </span>
                      <div className="flex gap-1">
                        {alert.channels.map((ch) => (
                          <span key={ch} className="px-1.5 py-0.5 rounded bg-blue-50/50 text-xs text-blue-600">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mt-0.5">{alert.message}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 flex-none text-right">
                  <div>{new Date(alert.created_at).toLocaleDateString()}</div>
                  <div>{new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  {alert.notified_at && (
                    <div className="text-emerald-600">
                      Sent {new Date(alert.notified_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
