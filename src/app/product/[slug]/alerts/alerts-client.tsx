"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useActionState } from "react";

import type { AlertRow } from "@/lib/monitoring/queries";
import { acknowledgeAlertAction, resolveAlertAction, type AlertActionState } from "@/app/actions/tenant-alerts";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = (d = 0.05, s = 0.06) => ({ hidden: {}, visible: { transition: { delayChildren: d, staggerChildren: s } } });

const STATUS_CONFIG: Record<string, { icon: string; iconColor: string; bg: string; label: string; badgeCls: string }> = {
  sent: { icon: "warning", iconColor: "text-amber-500", bg: "bg-amber-50", label: "Triggered", badgeCls: "bg-amber-50 text-amber-700 border-amber-200" },
  pending: { icon: "schedule", iconColor: "text-slate-400", bg: "bg-slate-50", label: "Pending", badgeCls: "bg-slate-100 text-slate-500 border-slate-200" },
  delivered: { icon: "check_circle", iconColor: "text-emerald-500", bg: "bg-emerald-50", label: "Delivered", badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  acknowledged: { icon: "visibility", iconColor: "text-blue-500", bg: "bg-blue-50", label: "Acknowledged", badgeCls: "bg-blue-50 text-blue-700 border-blue-200" },
  resolved: { icon: "check_circle", iconColor: "text-emerald-500", bg: "bg-emerald-50", label: "Resolved", badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

type StatusFilter = "all" | "sent" | "pending" | "delivered" | "acknowledged" | "resolved";

export function AlertsClient({ slug, alerts }: { slug: string; alerts: AlertRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = alerts.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return `${a.rule_name} ${a.message}`.toLowerCase().includes(q);
    }
    return true;
  });

  const counts: Record<StatusFilter, number> = {
    all: alerts.length,
    sent: alerts.filter((a) => a.status === "sent").length,
    pending: alerts.filter((a) => a.status === "pending").length,
    delivered: alerts.filter((a) => a.status === "delivered").length,
    acknowledged: alerts.filter((a) => a.status === "acknowledged").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger()} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
        <p className="text-slate-500 mt-1">
          {alerts.length} alerts in history.
          {filtered.length !== alerts.length && ` Showing ${filtered.length}.`}
        </p>
      </motion.div>

      {/* Search + filter */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "sent", "acknowledged", "resolved", "pending", "delivered"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                statusFilter === s ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {s === "all" ? `All (${counts.all})` : `${s} (${counts[s]})`}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Alert list */}
      {filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 32 }}>
              {alerts.length === 0 ? "notifications_off" : "search_off"}
            </span>
          </div>
          <h3 className="font-bold text-slate-900 mt-5 text-lg">
            {alerts.length === 0 ? "No alerts yet" : "No results"}
          </h3>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            {alerts.length === 0 ? (
              <>Alerts appear when rules are triggered. <Link href={`/product/${slug}/rules`} className="text-blue-600 font-semibold hover:text-blue-700">Create a rule</Link> to start.</>
            ) : "Try a different search or filter."}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={stagger(0.02, 0.04)} className="space-y-3">
          {filtered.map((alert) => {
            const cfg = STATUS_CONFIG[alert.status] ?? STATUS_CONFIG.pending;
            return (
              <motion.div key={alert.id} variants={fadeUp} whileHover={{ y: -1, transition: { duration: 0.15 } }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 card-hover glow-amber">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-none`}>
                    <span className={`material-symbols-outlined ${cfg.iconColor}`} style={{ fontSize: 22 }}>{cfg.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">{alert.rule_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.badgeCls}`}>{cfg.label}</span>
                        {alert.channels.map((ch) => (
                          <span key={ch} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">{ch}</span>
                        ))}
                      </div>
                      <span className="text-xs text-slate-400 flex-none font-mono">
                        {alert.created_at.slice(0, 16).replace("T", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{alert.message}</p>
                    {alert.notified_at && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                        Notified at {alert.notified_at.slice(11, 16)}
                      </div>
                    )}
                    {/* Action buttons */}
                    {(alert.status === "sent" || alert.status === "pending" || alert.status === "delivered") && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                        <AlertActionButton alertId={alert.id} action="acknowledge" label="Acknowledge" icon="visibility" />
                        <AlertActionButton alertId={alert.id} action="resolve" label="Resolve" icon="check_circle" />
                      </div>
                    )}
                    {alert.status === "acknowledged" && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                        <AlertActionButton alertId={alert.id} action="resolve" label="Resolve" icon="check_circle" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}

function AlertActionButton({ alertId, action, label, icon }: { alertId: string; action: "acknowledge" | "resolve"; label: string; icon: string }) {
  const serverAction = action === "acknowledge" ? acknowledgeAlertAction : resolveAlertAction;
  const [, formAction, pending] = useActionState(serverAction, undefined as AlertActionState);
  return (
    <form action={formAction}>
      <input type="hidden" name="alert_id" value={alertId} />
      <button
        type="submit"
        disabled={pending}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
          action === "resolve"
            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{icon}</span>
        {pending ? "..." : label}
      </button>
    </form>
  );
}
