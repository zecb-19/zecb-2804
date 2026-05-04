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
import type { PortfolioProduct, PortfolioSummary } from "@/lib/portfolio/queries";

import { easeOut, fadeUp, fadeUpSm, scaleIn, stagger } from "./motion";

type Props = {
  products: PortfolioProduct[];
  summary: PortfolioSummary;
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: string }> = {
  live: { label: "Live", cls: "bg-emerald-100 text-emerald-800", icon: "check_circle" },
  building: { label: "Building", cls: "bg-amber-100 text-amber-800", icon: "construction" },
  paused: { label: "Paused", cls: "bg-surface-container text-on-surface-variant", icon: "pause_circle" },
  killed: { label: "Killed", cls: "bg-error-container text-on-error-container", icon: "cancel" },
};

const PHASE_CONFIG: Record<string, { label: string; description: string }> = {
  ignition: { label: "Ignition", description: "Week 1-4: Signal collection, max channel diversity" },
  consolidation: { label: "Consolidation", description: "Month 2-3: Hard selection, unit economics check" },
  scale: { label: "Scale", description: "Month 4+: Budget scaling on winners" },
};

export function PortfolioView({ products, summary }: Props) {
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
          <h1 className="font-h1 text-h1 text-primary">Portfolio Control Plane</h1>
          <p className="text-on-surface-variant mt-1.5 max-w-3xl">
            Cross-product budget enforcement and unified reporting. Per-product
            budget vs spend, lifecycle stage, and drift alerts.
          </p>
        </div>
        <Link
          href="/dashboard/buildspec"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90 flex-none"
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
      <motion.div variants={fadeUp} className="bg-white rounded-xl border border-surface-variant p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>monitoring</span>
            <span className="font-semibold text-body-md text-on-surface">Monthly platform opex</span>
          </div>
          <span className="text-label-sm text-on-surface-variant">
            {fmtEur(summary.monthly_opex_eur)} / {fmtEur(summary.platform_opex_cap_eur)} V3 target
          </span>
        </div>
        <div className="h-2 bg-surface-variant rounded-full overflow-hidden">
          <motion.div
            className={opexPct > 80 ? "h-full bg-error" : "h-full bg-secondary"}
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(100, opexPct)}%` }}
            transition={{ duration: 0.8, ease: easeOut }}
          />
        </div>
        <div className="text-label-sm text-on-surface-variant mt-1">
          {opexPct.toFixed(1)}% of V3 cap (€15,000/mo)
        </div>
      </motion.div>

      {/* Product cards */}
      {products.length === 0 ? (
        <motion.div
          variants={scaleIn}
          className="bg-white rounded-xl border border-surface-variant p-8 text-center"
        >
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 40 }}>
            inventory_2
          </span>
          <h3 className="font-h3 text-h3 text-on-surface mt-3">No products yet</h3>
          <p className="text-on-surface-variant mt-1.5 max-w-md mx-auto text-body-md">
            Compose a BuildSpec to create your first product. The portfolio will
            track budget, lifecycle, and performance once products are live.
          </p>
          <Link
            href="/dashboard/buildspec"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90"
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
        className="bg-secondary-fixed/30 rounded-lg p-4 border border-secondary/20"
      >
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary flex-none" style={{ fontSize: 20 }}>info</span>
          <div className="text-body-md text-on-surface-variant">
            <span className="font-semibold text-on-surface">Outreach attribution (PRD §8.3):</span>{" "}
            CAC by channel, LTV by multi-touch attribution, and creative fatigue
            indicators will appear here once PostHog CDP is connected and outreach
            channels are live. Budget decisions will use owned attribution only,
            never platform-reported conversions.
          </div>
        </div>
      </motion.div>
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
      className="bg-white rounded-xl border border-surface-variant p-5 hover:shadow-md transition-shadow"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-body-lg font-semibold text-on-surface">{p.slug}</span>
            <span className={"px-2 py-0.5 rounded-full text-label-sm font-semibold " + statusCfg.cls}>
              {statusCfg.label}
            </span>
            {p.status === "live" && (
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary text-label-sm font-semibold">
                {lifecyclePhase.label}
              </span>
            )}
          </div>
          <div className="text-label-sm text-on-surface-variant mt-0.5">
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
                className="px-3 py-1.5 rounded-lg border border-surface-variant text-on-surface-variant text-label-sm font-semibold hover:bg-surface-container-low disabled:opacity-60 inline-flex items-center gap-1"
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
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-1"
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
                className="px-3 py-1.5 rounded-lg border border-error text-error text-label-sm font-semibold hover:bg-error/5 disabled:opacity-60 inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                Kill
              </button>
            </form>
          )}
        </div>
      </div>

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
        <div className="mt-4 pt-3 border-t border-surface-variant">
          <div className="flex items-center justify-between text-label-sm mb-2">
            <span className="text-on-surface-variant">
              Lifecycle: <span className="font-semibold text-on-surface">{lifecyclePhase.label}</span>
            </span>
            <span className="text-on-surface-variant">{lifecyclePhase.description}</span>
          </div>
          <LifecycleBar ageDays={p.age_days} />
        </div>
      )}

      {errorMsg && "message" in errorMsg! && (
        <p className="text-error text-label-sm mt-2">
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
    { label: "Consolidation", endDay: 90, cls: "bg-secondary" },
    { label: "Scale or Kill", endDay: 180, cls: "bg-primary" },
  ];
  const maxDay = 180;
  const currentPct = Math.min(100, (ageDays / maxDay) * 100);

  return (
    <div className="relative">
      <div className="h-2 bg-surface-variant rounded-full overflow-hidden flex">
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
              <div className="h-full bg-surface-variant">
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
      <div className="flex justify-between mt-1 text-label-sm text-on-surface-variant">
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
      className="bg-white rounded-xl border border-surface-variant p-4 hover:border-primary/40 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>{icon}</span>
        <span className="text-label-sm text-on-surface-variant">{label}</span>
      </div>
      <div className={
        "font-display text-2xl font-bold leading-none " +
        (tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-error" : "text-primary")
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
    <motion.div variants={fadeUpSm} className="bg-surface-container-low rounded-lg px-3 py-2">
      <div className="text-label-sm text-on-surface-variant">{label}</div>
      <div className={
        "font-semibold text-body-md " +
        (tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-error" : "text-on-surface")
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
