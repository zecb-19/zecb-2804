"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import type { SubscriberProduct, SubscriberFinancialSummary } from "@/lib/subscriber/queries";
import { cardHover, fadeUp, fadeUpSm, stagger, scaleIn, easeOut } from "./motion";

type Props = {
  firstName: string;
  products: SubscriberProduct[];
  financialSummary: SubscriberFinancialSummary;
  pendingApprovals: SubscriberProduct[];
};

const STATUS_COLORS: Record<string, string> = {
  building: "bg-blue-100 text-blue-700",
  live: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  killed: "bg-red-100 text-red-700",
};

const PHASE_LABELS: Record<string, string> = {
  ignition: "Ignition — signal collection",
  consolidation: "Consolidation — hard selection",
  scale: "Scale — budget expansion",
};

function fmtEur(n: number): string {
  if (Math.abs(n) < 1) return `€${n.toFixed(4)}`;
  return `€${n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function SubscriberDashboardView({
  firstName,
  products,
  financialSummary,
  pendingApprovals,
}: Props) {
  const { total_revenue_eur, total_cost_eur, net_margin_eur, products_total, products_live } =
    financialSummary;

  const kpis = [
    {
      label: "Total Products",
      value: String(products_total),
      icon: "inventory_2",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Live Products",
      value: String(products_live),
      icon: "check_circle",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Monthly Revenue",
      value: fmtEur(total_revenue_eur),
      icon: "trending_up",
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
    {
      label: "Net Margin",
      value: fmtEur(net_margin_eur),
      icon: net_margin_eur >= 0 ? "savings" : "warning",
      color: net_margin_eur >= 0 ? "text-emerald-600" : "text-red-600",
      bgColor: net_margin_eur >= 0 ? "bg-emerald-50" : "bg-red-50",
    },
  ];

  return (
    <motion.div variants={stagger()} initial="hidden" animate="visible" className="space-y-8">
      {/* Greeting */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {firstName}
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s an overview of your products and their performance.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUpSm} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <motion.div
            key={kpi.label}
            variants={scaleIn}
            {...cardHover}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bgColor} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${kpi.color}`} style={{ fontSize: 22 }}>
                  {kpi.icon}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
            <div className="text-xs text-slate-500 mt-1">{kpi.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <motion.div variants={fadeUp} className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-amber-600" style={{ fontSize: 22 }}>
              pending_actions
            </span>
            <h2 className="text-lg font-bold text-amber-900">
              Pending Approvals ({pendingApprovals.length})
            </h2>
          </div>
          <div className="space-y-2">
            {pendingApprovals.map((p) => (
              <Link
                key={p.id}
                href="/dashboard/pipeline"
                className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-amber-200 hover:border-amber-400 transition-colors"
              >
                <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 20 }}>
                  rocket_launch
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                  <div className="text-xs text-slate-500">
                    Step {p.build_step}/{p.build_total_steps} — awaiting your approval
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>
                  chevron_right
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/inbox"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_awesome</span>
          Submit New Idea
        </Link>
        <Link
          href="/dashboard/pipeline"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rocket_launch</span>
          View Builds
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>credit_card</span>
          Manage Billing
        </Link>
      </motion.div>

      {/* Products List */}
      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Products</h2>
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <span className="material-symbols-outlined text-slate-300 mb-3" style={{ fontSize: 48 }}>
              inventory_2
            </span>
            <h3 className="text-lg font-semibold text-slate-700 mt-3">No products yet</h3>
            <p className="text-slate-500 mt-1 text-sm">
              Submit a product idea to get started. We&apos;ll build it in 72 hours.
            </p>
            <Link
              href="/dashboard/inbox"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_awesome</span>
              Generate Ideas
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const progressPct =
                product.build_total_steps > 0
                  ? Math.round((product.build_step / product.build_total_steps) * 100)
                  : 0;
              const isBuilding = product.status === "building";

              return (
                <motion.div
                  key={product.id}
                  variants={scaleIn}
                  {...cardHover}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[product.status] ?? "bg-slate-100 text-slate-600"}`}
                        >
                          {product.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">{product.slug}</div>
                    </div>

                    {product.status === "live" && (
                      <div className="text-right flex-none">
                        <div className="text-lg font-bold text-slate-900">
                          €{product.mrr_eur}/mo
                        </div>
                        <div className="text-xs text-slate-500">
                          {product.users_count} users
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Build Progress */}
                  {isBuilding && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span>
                          Step {product.build_step}/{product.build_total_steps}
                          {product.current_step_label ? ` — ${product.current_step_label}` : ""}
                        </span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ duration: 0.8, ease: easeOut }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Phase indicator for live products */}
                  {product.status === "live" && product.phase && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        trending_up
                      </span>
                      {PHASE_LABELS[product.phase] ?? product.phase}
                    </div>
                  )}

                  {/* Link to product */}
                  {product.status === "live" && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <Link
                        href={`/product/${product.slug}/dashboard`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        View Product Dashboard
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Financial Summary */}
      {products_total > 0 && (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Financial Overview</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Revenue</div>
              <div className="text-xl font-bold text-emerald-600 mt-1">{fmtEur(total_revenue_eur)}</div>
              <div className="text-xs text-slate-400">monthly</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Costs</div>
              <div className="text-xl font-bold text-slate-700 mt-1">{fmtEur(total_cost_eur)}</div>
              <div className="text-xs text-slate-400">monthly opex</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Net Margin</div>
              <div className={`text-xl font-bold mt-1 ${net_margin_eur >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {fmtEur(net_margin_eur)}
              </div>
              <div className="text-xs text-slate-400">
                {total_revenue_eur > 0
                  ? `${((net_margin_eur / total_revenue_eur) * 100).toFixed(0)}% margin`
                  : "no revenue yet"}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
