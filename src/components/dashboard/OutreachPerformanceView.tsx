"use client";

import { motion } from "framer-motion";
import type { OutreachPerformanceData } from "@/lib/outreach/queries";
import { fadeUp, stagger } from "./motion";

type Props = { data: OutreachPerformanceData };

function fmtEur(n: number): string {
  if (n === 0) return "€0";
  if (n < 1) return `€${n.toFixed(4)}`;
  return `€${n.toFixed(2)}`;
}

export function OutreachPerformanceView({ data }: Props) {
  const openRate = data.total_email_sent > 0
    ? ((data.total_email_opened / data.total_email_sent) * 100).toFixed(1)
    : "—";

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger()} className="space-y-6">
      {/* KPI Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="CDP Events" value={data.total_cdp_events.toLocaleString()} icon="analytics" color="blue" />
        <KpiCard label="Emails Sent" value={String(data.total_email_sent)} icon="email" color="violet" />
        <KpiCard label="Open Rate" value={`${openRate}%`} icon="mark_email_read" color="emerald" />
        <KpiCard label="Content Pieces" value={String(data.top_content.length)} icon="article" color="amber" />
      </motion.div>

      {/* Channel Performance Table */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 20 }}>campaign</span>
          <h2 className="font-bold text-slate-900">Channel Performance (Last 30 Days)</h2>
        </div>
        {data.channels.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-slate-300 mb-2" style={{ fontSize: 32 }}>bar_chart</span>
            <p className="text-sm text-slate-500">No outreach data yet. Channel stats appear once campaigns run.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Channel</th>
                  <th className="text-right px-3 py-3 font-semibold">Impressions</th>
                  <th className="text-right px-3 py-3 font-semibold">Clicks</th>
                  <th className="text-right px-3 py-3 font-semibold">Signups</th>
                  <th className="text-right px-3 py-3 font-semibold">Conversions</th>
                  <th className="text-right px-3 py-3 font-semibold">Spend</th>
                  <th className="text-right px-3 py-3 font-semibold">CAC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.channels.map((ch) => (
                  <tr key={ch.channel} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900 capitalize">{ch.channel.replace("_", " ")}</td>
                    <td className="text-right px-3 py-3 font-mono text-slate-600">{ch.impressions.toLocaleString()}</td>
                    <td className="text-right px-3 py-3 font-mono text-slate-600">{ch.clicks.toLocaleString()}</td>
                    <td className="text-right px-3 py-3 font-mono text-slate-600">{ch.signups}</td>
                    <td className="text-right px-3 py-3 font-mono text-slate-700 font-semibold">{ch.conversions}</td>
                    <td className="text-right px-3 py-3 font-mono text-slate-600">{fmtEur(ch.spend_eur)}</td>
                    <td className={`text-right px-3 py-3 font-mono font-semibold ${ch.cac_eur !== null ? "text-blue-700" : "text-slate-400"}`}>
                      {ch.cac_eur !== null ? fmtEur(ch.cac_eur) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Content Performance */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-violet-600" style={{ fontSize: 20 }}>article</span>
          <h2 className="font-bold text-slate-900">Recent Content</h2>
        </div>
        {data.top_content.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-slate-300 mb-2" style={{ fontSize: 32 }}>edit_note</span>
            <p className="text-sm text-slate-500">No content generated yet. Use the outreach queue to generate articles and social posts.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {data.top_content.map((item) => (
              <div key={item.id} className="px-6 py-3 flex items-center gap-3 hover:bg-slate-50/50">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${item.type === "article" ? "bg-blue-50" : "bg-violet-50"}`}>
                  <span className={`material-symbols-outlined ${item.type === "article" ? "text-blue-600" : "text-violet-600"}`} style={{ fontSize: 16 }}>
                    {item.type === "article" ? "article" : "share"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{item.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {item.type === "article" ? `${item.category} · ${item.word_count ?? 0} words` : item.platform}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function KpiCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const colors: Record<string, { bg: string; icon: string }> = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600" },
    violet: { bg: "bg-violet-50", icon: "text-violet-600" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600" },
  };
  const c = colors[color] ?? colors.blue;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
        <span className={`material-symbols-outlined ${c.icon}`} style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
