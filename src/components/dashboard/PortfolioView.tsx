"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useActionState } from "react";

import {
  pauseProductAction,
  resumeProductAction,
  killProductAction,
  type ProductActionState,
} from "@/app/actions/portfolio";
import type { PortfolioProduct, PortfolioSummary, ProductPnL } from "@/lib/portfolio/queries";

import { easeOut, fadeUp, fadeUpSm, scaleIn, stagger } from "./motion";

type Props = {
  products: PortfolioProduct[];
  summary: PortfolioSummary;
  pnl: ProductPnL[];
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: string }> = {
  live: { label: "Live", cls: "bg-emerald-100 text-emerald-800", icon: "check_circle" },
  building: { label: "Building", cls: "bg-amber-100 text-amber-800", icon: "construction" },
  paused: { label: "Paused", cls: "bg-slate-100 text-slate-500", icon: "pause_circle" },
  killed: { label: "Killed", cls: "bg-red-50 text-red-700", icon: "cancel" },
};

const PHASE_CONFIG: Record<string, { label: string; description: string }> = {
  ignition: { label: "Ignition", description: "Week 1-4: Signal collection, max channel diversity" },
  consolidation: { label: "Consolidation", description: "Month 2-3: Hard selection, unit economics check" },
  scale: { label: "Scale", description: "Month 4+: Budget scaling on winners" },
};

export function PortfolioView({ products, summary, pnl }: Props) {
  const opexPct = summary.platform_opex_cap_eur > 0
    ? (summary.monthly_opex_eur / summary.platform_opex_cap_eur) * 100
    : 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.08)}
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Portfolio Control Plane</h1>
          <p className="text-slate-500 mt-1.5 max-w-3xl">
            Cross-product budget enforcement and unified reporting. Per-product
            budget vs spend, lifecycle stage, and drift alerts.
          </p>
        </div>
        <Link
          href="/dashboard/buildspec"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:opacity-90 flex-none"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          New Build
        </Link>
      </motion.div>

      {/* Portfolio KPIs */}
      <motion.div
        variants={stagger(0.05, 0.06)}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <KpiCard label="Total products" value={String(summary.total_products)} icon="inventory_2" tone="neutral" />
        <KpiCard label="Live" value={String(summary.live_products)} icon="rocket_launch" tone={summary.live_products > 0 ? "good" : "neutral"} />
        <KpiCard label="Building" value={String(summary.building_products)} icon="construction" tone="neutral" />
        <KpiCard label="Total MRR" value={fmtEur(summary.total_mrr_eur)} icon="payments" tone={summary.total_mrr_eur > 0 ? "good" : "neutral"} />
        <KpiCard label="Total users" value={String(summary.total_users)} icon="group" tone={summary.total_users > 0 ? "good" : "neutral"} />
        <KpiCard label="Build cost" value={fmtEur(summary.total_build_cost_eur)} icon="receipt_long" tone="neutral" />
      </motion.div>

      {/* Platform opex bar */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 20 }}>monitoring</span>
            <span className="font-semibold text-sm text-slate-900">Monthly platform opex</span>
          </div>
          <span className="text-xs text-slate-500">
            {fmtEur(summary.monthly_opex_eur)} / {fmtEur(summary.platform_opex_cap_eur)} V3 target
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className={opexPct > 80 ? "h-full bg-red-500" : "h-full bg-blue-600"}
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(100, opexPct)}%` }}
            transition={{ duration: 0.8, ease: easeOut }}
          />
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {opexPct.toFixed(1)}% of V3 cap (€15,000/mo)
        </div>
      </motion.div>

      {/* Product cards */}
      {products.length === 0 ? (
        <motion.div
          variants={scaleIn}
          className="bg-white rounded-2xl border border-slate-200 p-8 text-center"
        >
          <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 40 }}>
            inventory_2
          </span>
          <h3 className="text-lg font-semibold text-slate-900 mt-3">No products yet</h3>
          <p className="text-slate-500 mt-1.5 max-w-md mx-auto text-sm">
            Compose a BuildSpec to create your first product. The portfolio will
            track budget, lifecycle, and performance once products are live.
          </p>
          <Link
            href="/dashboard/buildspec"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:opacity-90"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Start a build
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={stagger(0.05, 0.08)} className="space-y-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </motion.div>
      )}

      {/* Outreach attribution notice */}
      <motion.div
        variants={fadeUp}
        className="bg-blue-50/30 rounded-2xl p-4 border border-secondary/20"
      >
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600 flex-none" style={{ fontSize: 20 }}>info</span>
          <div className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">Outreach attribution (PRD §8.3):</span>{" "}
            CAC by channel, LTV by multi-touch attribution, and creative fatigue
            indicators will appear here once PostHog CDP is connected and outreach
            channels are live. Budget decisions will use owned attribution only,
            never platform-reported conversions.
          </div>
        </div>
      </motion.div>

      {/* ─── P&L TABLE ─────────────────────────────────────────── */}
      {pnl.length > 0 && (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 20 }}>analytics</span>
              <h2 className="font-bold text-slate-900">Profit & Loss</h2>
            </div>
            <span className="text-xs text-slate-400">All amounts in EUR</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Product</th>
                  <th className="text-right px-3 py-3 font-semibold">MRR</th>
                  <th className="text-right px-3 py-3 font-semibold">Revenue</th>
                  <th className="text-right px-3 py-3 font-semibold">LLM</th>
                  <th className="text-right px-3 py-3 font-semibold">Infra</th>
                  <th className="text-right px-3 py-3 font-semibold">Outreach</th>
                  <th className="text-right px-3 py-3 font-semibold">Total Cost</th>
                  <th className="text-right px-3 py-3 font-semibold">Margin</th>
                  <th className="text-right px-3 py-3 font-semibold">%</th>
                  <th className="text-center px-3 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pnl.map((row) => {
                  const marginColor = row.net_margin_eur >= 0 ? "text-emerald-600" : "text-red-600";
                  const isOld = row.age_days > 90 && !row.breakeven_achieved;
                  return (
                    <tr key={row.id} className={`hover:bg-slate-50/50 ${isOld ? "bg-red-50/30" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{row.name}</div>
                        <div className="text-[11px] text-slate-400">{row.slug} · {row.age_days}d</div>
                      </td>
                      <td className="text-right px-3 py-3 font-mono text-slate-700">{fmtEur(row.mrr_eur)}</td>
                      <td className="text-right px-3 py-3 font-mono text-slate-700">{fmtEur(row.total_revenue_eur)}</td>
                      <td className="text-right px-3 py-3 font-mono text-slate-500">{fmtEur(row.llm_cost_eur)}</td>
                      <td className="text-right px-3 py-3 font-mono text-slate-500">{fmtEur(row.infra_cost_eur)}</td>
                      <td className="text-right px-3 py-3 font-mono text-slate-500">{fmtEur(row.outreach_spend_eur)}</td>
                      <td className="text-right px-3 py-3 font-mono font-semibold text-slate-700">{fmtEur(row.total_cost_eur)}</td>
                      <td className={`text-right px-3 py-3 font-mono font-bold ${marginColor}`}>{fmtEur(row.net_margin_eur)}</td>
                      <td className={`text-right px-3 py-3 font-mono text-xs ${marginColor}`}>
                        {row.total_revenue_eur > 0 ? `${row.net_margin_pct.toFixed(0)}%` : "—"}
                      </td>
                      <td className="text-center px-3 py-3">
                        {isOld ? (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">KILL?</span>
                        ) : row.breakeven_achieved ? (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">SCALE</span>
                        ) : row.status === "live" ? (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">GROW</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">{row.status}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                  <td className="px-4 py-3 text-slate-900">Total</td>
                  <td className="text-right px-3 py-3 font-mono">{fmtEur(pnl.reduce((s, r) => s + r.mrr_eur, 0))}</td>
                  <td className="text-right px-3 py-3 font-mono">{fmtEur(pnl.reduce((s, r) => s + r.total_revenue_eur, 0))}</td>
                  <td className="text-right px-3 py-3 font-mono text-slate-500">{fmtEur(pnl.reduce((s, r) => s + r.llm_cost_eur, 0))}</td>
                  <td className="text-right px-3 py-3 font-mono text-slate-500">{fmtEur(pnl.reduce((s, r) => s + r.infra_cost_eur, 0))}</td>
                  <td className="text-right px-3 py-3 font-mono text-slate-500">{fmtEur(pnl.reduce((s, r) => s + r.outreach_spend_eur, 0))}</td>
                  <td className="text-right px-3 py-3 font-mono">{fmtEur(pnl.reduce((s, r) => s + r.total_cost_eur, 0))}</td>
                  {(() => { const totalMargin = pnl.reduce((s, r) => s + r.net_margin_eur, 0); return (
                    <td className={`text-right px-3 py-3 font-mono font-bold ${totalMargin >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtEur(totalMargin)}</td>
                  ); })()}
                  <td className="text-right px-3 py-3" />
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* --- Product Card --------------------------------------------------------- */

function ProductCard({ product: p }: { product: PortfolioProduct }) {
  const [pauseState, pauseAction, pausePending] = useActionState(
    pauseProductAction, undefined as ProductActionState,
  );
  const [resumeState, resumeAction, resumePending] = useActionState(
    resumeProductAction, undefined as ProductActionState,
  );
  const [killState, killAction, killPending] = useActionState(
    killProductAction, undefined as ProductActionState,
  );

  const anyPending = pausePending || resumePending || killPending;
  const errorMsg = [pauseState, resumeState, killState]
    .find((s) => s && !s.ok)
    ?.ok === false
    ? [pauseState, resumeState, killState].find((s) => s && !s.ok && "message" in s!)
    : null;

  const statusCfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.building;
  const phaseCfg = PHASE_CONFIG[p.phase] ?? { label: p.phase, description: "" };
  const lifecyclePhase = computeLifecyclePhase(p.age_days, p.status);

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -1, transition: { duration: 0.2, ease: easeOut } }}
      className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-base font-semibold text-slate-900">{p.slug}</span>
            <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + statusCfg.cls}>
              {statusCfg.label}
            </span>
            {p.status === "live" && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                {lifecyclePhase.label}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {p.name} · {p.template_id} v{p.template_version} · {p.age_days}d old
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-none">
          {p.status === "live" && (
            <form action={pauseAction}>
              <input type="hidden" name="product_id" value={p.id} />
              <button
                type="submit"
                disabled={anyPending}
                className="px-3 py-1.5 rounded-2xl border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60 inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>pause</span>
                Pause
              </button>
            </form>
          )}
          {p.status === "paused" && (
            <form action={resumeAction}>
              <input type="hidden" name="product_id" value={p.id} />
              <button
                type="submit"
                disabled={anyPending}
                className="px-3 py-1.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>play_arrow</span>
                Resume
              </button>
            </form>
          )}
          {(p.status === "live" || p.status === "paused") && (
            <form action={killAction}>
              <input type="hidden" name="product_id" value={p.id} />
              <button
                type="submit"
                disabled={anyPending}
                className="px-3 py-1.5 rounded-2xl border border-error text-red-500 text-xs font-semibold hover:bg-red-500/5 disabled:opacity-60 inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                Kill
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Product URLs */}
      {(p.status === "live" || p.status === "building") && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Link
            href={`/product/${p.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 14 }}>open_in_new</span>
            Tenant App
            <span className="text-slate-400 font-mono">/product/{p.slug}</span>
          </Link>
          <Link
            href={`/p/${p.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 14 }}>language</span>
            Marketing Page
            <span className="text-slate-400 font-mono">/p/{p.slug}</span>
          </Link>
        </div>
      )}

      {/* Metrics grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger(0.05, 0.04)}
        className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3"
      >
        <Metric label="MRR" value={fmtEur(p.mrr_eur)} />
        <Metric label="Users" value={String(p.users_count)} />
        <Metric label="Growth (30d)" value={fmtPct(p.growth_30d)} tone={p.growth_30d > 0 ? "good" : p.growth_30d < 0 ? "warn" : "neutral"} />
        <Metric label="Build cost" value={fmtEur(p.build_cost_eur)} />
        <Metric label="Monthly opex" value={fmtEur(p.monthly_agent_cost_eur)} />
        <Metric label="Est. opex cap" value={fmtEur(p.estimated_monthly_opex_eur)} />
        <Metric label="Agent runs" value={String(p.agent_runs_count)} />
      </motion.div>

      {/* Lifecycle phase bar for live products */}
      {p.status === "live" && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-500">
              Lifecycle: <span className="font-semibold text-slate-900">{lifecyclePhase.label}</span>
            </span>
            <span className="text-slate-500">{lifecyclePhase.description}</span>
          </div>
          <LifecycleBar ageDays={p.age_days} />
        </div>
      )}

      {errorMsg && "message" in errorMsg! && (
        <p className="text-red-500 text-xs mt-2">
          {(errorMsg as { message: string }).message}
        </p>
      )}
    </motion.div>
  );
}

/* --- Lifecycle Bar -------------------------------------------------------- */

function LifecycleBar({ ageDays }: { ageDays: number }) {
  const phases = [
    { label: "Ignition", endDay: 28, cls: "bg-amber-400" },
    { label: "Consolidation", endDay: 90, cls: "bg-blue-600" },
    { label: "Scale or Kill", endDay: 180, cls: "bg-slate-900" },
  ];
  const maxDay = 180;
  const currentPct = Math.min(100, (ageDays / maxDay) * 100);

  return (
    <div className="relative">
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
        {phases.map((phase, i) => {
          const prevEnd = i === 0 ? 0 : phases[i - 1].endDay;
          const widthPct = ((phase.endDay - prevEnd) / maxDay) * 100;
          const filled = ageDays >= phase.endDay
            ? 100
            : ageDays > prevEnd
              ? ((ageDays - prevEnd) / (phase.endDay - prevEnd)) * 100
              : 0;
          return (
            <div key={phase.label} className="relative" style={{ width: `${widthPct}%` }}>
              <div className="h-full bg-slate-100">
                <motion.div
                  className={"h-full " + phase.cls}
                  initial={{ width: "0%" }}
                  animate={{ width: `${filled}%` }}
                  transition={{ duration: 0.6, ease: easeOut, delay: i * 0.15 }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-xs text-slate-500">
        <span>Day 0</span>
        <span>4w</span>
        <span>3mo</span>
        <span>6mo</span>
      </div>
    </div>
  );
}

/* --- Shared --------------------------------------------------------------- */

function KpiCard({
  label, value, icon, tone,
}: {
  label: string;
  value: string;
  icon: string;
  tone: "neutral" | "good" | "warn";
}) {
  return (
    <motion.div
      variants={scaleIn}
      className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-primary/40 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>{icon}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className={
        "font-display text-2xl font-bold leading-none " +
        (tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-red-500" : "text-slate-900")
      }>
        {value}
      </div>
    </motion.div>
  );
}

function Metric({
  label, value, tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}) {
  return (
    <motion.div variants={fadeUpSm} className="bg-slate-50 rounded-2xl px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={
        "font-semibold text-sm " +
        (tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-red-500" : "text-slate-900")
      }>
        {value}
      </div>
    </motion.div>
  );
}

function computeLifecyclePhase(ageDays: number, status: string) {
  if (status !== "live") return { label: "—", description: "" };
  if (ageDays <= 28) return PHASE_CONFIG.ignition;
  if (ageDays <= 90) return PHASE_CONFIG.consolidation;
  return PHASE_CONFIG.scale;
}

function fmtEur(n: number): string {
  if (n === 0) return "€0";
  if (n < 1) return `€${n.toFixed(4)}`;
  if (n < 1000) return `€${n.toFixed(2)}`;
  return `€${n.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtPct(n: number): string {
  if (n === 0) return "0%";
  const sign = n > 0 ? "+" : "";
  return `${sign}${(n * 100).toFixed(1)}%`;
}
