"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { PIPELINE_STEPS } from "@/lib/builds/definitions";
import type { AgentRunRow, ProductRow } from "@/lib/builds/queries";

import {
  cardHover,
  easeOut,
  fadeUp,
  fadeUpSm,
  inViewOnce,
  scaleIn,
  stagger,
} from "./motion";

type StatusCounts = {
  building: number;
  live: number;
  paused: number;
  killed: number;
};

type Props = {
  firstName: string;
  activeBuilds: ProductRow[];
  recentRuns: AgentRunRow[];
  statusCounts: StatusCounts;
  pendingApprovals: ProductRow[];
  monthlyOpexEur: number;
};

type Kpi = {
  label: string;
  value: string;
  trend: string;
  icon: string;
  trendTone: "neutral" | "good" | "warn";
};

const OUTREACH_PLACEHOLDER = [
  { label: "CAC (7d, multi-touch)", value: "—", delta: "no campaigns yet", tone: "neutral" as const },
  { label: "Top creative CTR", value: "—", delta: "awaiting first creative", tone: "neutral" as const },
  { label: "Frequency cap", value: "0 / 25", delta: "impressions / wk", tone: "neutral" as const },
  { label: "Active campaigns", value: "0", delta: "Meta Ads + LinkedIn", tone: "neutral" as const },
];


export function DashboardView({
  firstName,
  activeBuilds,
  recentRuns,
  statusCounts,
  pendingApprovals,
  monthlyOpexEur,
}: Props) {
  const opexPct = Math.min(100, (monthlyOpexEur / 15_000) * 100);
  const opexFmt =
    monthlyOpexEur < 1
      ? `€${monthlyOpexEur.toFixed(4)}`
      : `€${monthlyOpexEur.toLocaleString("en", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  const kpis: Kpi[] = [
    {
      label: "Live products",
      value: String(statusCounts.live),
      trend:
        statusCounts.live === 0
          ? "ship your first one"
          : `${statusCounts.live === 1 ? "1 live" : `${statusCounts.live} live`}`,
      icon: "rocket_launch",
      trendTone: statusCounts.live > 0 ? "good" : "neutral",
    },
    {
      label: "Build queue",
      value: String(statusCounts.building),
      trend:
        statusCounts.building === 0
          ? "queue empty"
          : statusCounts.building === 1
            ? "1 in flight"
            : `${statusCounts.building} in flight`,
      icon: "settings_suggest",
      trendTone: "neutral",
    },
    {
      label: "Monthly opex",
      value: opexFmt,
      trend: `of €15,000 cap (${opexPct.toFixed(1)}%)`,
      icon: "payments",
      trendTone: opexPct > 80 ? "warn" : "neutral",
    },
    {
      label: "Pending approvals",
      value: String(pendingApprovals.length),
      trend:
        pendingApprovals.length === 0
          ? "all caught up"
          : pendingApprovals.length === 1
            ? "needs your action"
            : "need your action",
      icon: "task_alt",
      trendTone: pendingApprovals.length > 0 ? "warn" : "good",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.08)}
      className="space-y-8"
    >
      {/* Greeting + system status */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"
      >
        <div>
          <h2 className="font-h1 text-h1 text-primary">
            Welcome back, {firstName}
          </h2>
          <p className="text-on-surface-variant mt-1.5 max-w-2xl">
            Your portfolio at a glance — pending approvals, active builds, and
            outreach signal. Approvals first; everything else compounds.
          </p>
        </div>
        <div className="text-label-sm text-on-surface-variant flex items-center gap-2 flex-none">
          <motion.span
            className="inline-block w-2 h-2 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          All systems nominal · DACH-EU
        </div>
      </motion.div>

      {/* KPI cards */}
      <motion.div
        variants={stagger(0.05, 0.07)}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpis.map((k) => (
          <motion.div
            key={k.label}
            variants={scaleIn}
            {...cardHover}
            className="bg-white rounded-xl border border-surface-variant p-5 hover:border-primary/40 hover:shadow-md transition-shadow cursor-default"
          >
            <div className="flex items-start justify-between">
              <motion.div
                whileHover={{ rotate: 6, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                className="w-10 h-10 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 22 }}
                >
                  {k.icon}
                </span>
              </motion.div>
              <span className="text-label-sm text-on-surface-variant">
                {k.label}
              </span>
            </div>
            <div className="font-display text-3xl font-bold text-primary mt-3 leading-none">
              {k.value}
            </div>
            <div
              className={
                k.trendTone === "good"
                  ? "text-label-sm text-emerald-600 mt-1.5"
                  : k.trendTone === "warn"
                    ? "text-label-sm text-error mt-1.5"
                    : "text-label-sm text-on-surface-variant mt-1.5"
              }
            >
              {k.trend}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Active builds + outreach snapshot */}
      <motion.div
        variants={stagger(0, 0.1)}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.section
          variants={fadeUp}
          className="bg-white rounded-xl border border-surface-variant p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-h3 text-h3 text-primary">Active builds</h3>
              <p className="text-label-sm text-on-surface-variant">
                Live state across the 11-step pipeline
              </p>
            </div>
            <Link
              href="/dashboard/buildspec"
              className="text-secondary text-label-sm font-semibold hover:underline flex-none flex items-center gap-1"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                add
              </span>
              New
            </Link>
          </div>
          {activeBuilds.length === 0 ? (
            <EmptyBlock
              icon="rocket_launch"
              title="No builds in flight"
              body="Compose a Monitoring-SaaS BuildSpec to get the Build Orchestrator started."
              ctaLabel="Start a build"
              ctaHref="/dashboard/buildspec"
            />
          ) : (
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={stagger(0.2, 0.1)}
              className="space-y-5"
            >
              {activeBuilds.map((b) => {
                const pct = (b.build_step / b.build_total_steps) * 100;
                const stepLabel =
                  b.current_step_label ??
                  PIPELINE_STEPS[b.build_step - 1] ??
                  "Unknown";
                return (
                  <motion.li key={b.id} variants={fadeUpSm}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-mono text-body-md text-on-surface truncate">
                          {b.slug}
                        </div>
                        <div className="text-label-sm text-on-surface-variant truncate">
                          {b.template} · {stepLabel}
                        </div>
                      </div>
                      <div className="text-label-sm text-on-surface-variant flex-none">
                        ETA ≤72h
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-secondary"
                        initial={{ width: "0%" }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.9,
                          ease: easeOut,
                          delay: 0.45,
                        }}
                      />
                    </div>
                    <div className="text-label-sm text-on-surface-variant mt-1">
                      Step {b.build_step} of {b.build_total_steps}
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </motion.section>

        <motion.section
          variants={fadeUp}
          className="bg-white rounded-xl border border-surface-variant p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-h3 text-h3 text-primary">
                Outreach snapshot
              </h3>
              <p className="text-label-sm text-on-surface-variant">
                7-day, multi-touch attribution
              </p>
            </div>
            <span className="text-label-sm text-on-surface-variant px-2 py-1 rounded-full bg-surface-container-low">
              owned CDP
            </span>
          </div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger(0.25, 0.06)}
            className="grid grid-cols-2 gap-x-6 gap-y-5"
          >
            {OUTREACH_PLACEHOLDER.map((o) => (
              <motion.div key={o.label} variants={fadeUpSm}>
                <div className="text-label-sm text-on-surface-variant">
                  {o.label}
                </div>
                <div className="font-h3 text-h3 text-primary mt-1 truncate">
                  {o.value}
                </div>
                <div className="text-label-sm text-on-surface-variant mt-0.5">
                  {o.delta}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </motion.div>

      {/* Pending approvals */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={inViewOnce}
        variants={fadeUp}
        className="bg-white rounded-xl border border-surface-variant p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-h3 text-h3 text-primary">Pending approvals</h3>
            <p className="text-label-sm text-on-surface-variant">
              Step-11 HITL launch gates — Release Agent waits for your sign-off
            </p>
          </div>
          {pendingApprovals.length > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-label-sm font-semibold">
              {pendingApprovals.length} waiting
            </span>
          ) : null}
        </div>
        {pendingApprovals.length === 0 ? (
          <EmptyBlock
            icon="task_alt"
            title="All caught up"
            body="Launch-approval gates appear here when a build reaches step 11. Pattern, content, and propagation approvals will surface here once those rituals are wired."
          />
        ) : (
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            variants={stagger(0.1, 0.07)}
            className="divide-y divide-surface-variant"
          >
            {pendingApprovals.map((p) => (
              <motion.li
                key={p.id}
                variants={fadeUpSm}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
                className="py-3 first:pt-0 last:pb-0 flex items-center gap-4"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-none bg-secondary-fixed text-secondary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20 }}
                  >
                    rocket_launch
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body-md font-semibold text-on-surface truncate">
                    Approve launch — <span className="font-mono">{p.slug}</span>
                  </div>
                  <div className="text-label-sm text-on-surface-variant truncate">
                    Steps 1–10 passed ·{" "}
                    {p.estimated_monthly_opex_eur
                      ? `est. €${Number(p.estimated_monthly_opex_eur).toFixed(0)}/mo opex`
                      : "opex pending"}
                  </div>
                </div>
                <Link
                  href="/dashboard/pipeline"
                  className="text-secondary font-semibold text-label-sm hover:underline flex-none"
                >
                  Review →
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </motion.section>

      {/* Activity feed */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={inViewOnce}
        variants={fadeUp}
        className="bg-white rounded-xl border border-surface-variant p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-h3 text-h3 text-primary">Recent activity</h3>
            <p className="text-label-sm text-on-surface-variant">
              From the agent_runs ledger — every action attributable, costable
            </p>
          </div>
          <Link
            href="/dashboard/audit"
            className="text-secondary font-semibold text-label-sm hover:underline"
          >
            Open audit trail →
          </Link>
        </div>
        {recentRuns.length === 0 ? (
          <EmptyBlock
            icon="fact_check"
            title="No activity yet"
            body="Once you dispatch a build, every Build Orchestrator and Channel Agent run lands here with cost and latency."
          />
        ) : (
          <motion.ol
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            variants={stagger(0.05, 0.04)}
            className="space-y-3"
          >
            {recentRuns.map((r) => (
              <motion.li key={r.id} variants={fadeUpSm} className="flex gap-3">
                <div className="text-label-sm font-mono text-on-surface-variant w-12 flex-none pt-0.5 tabular-nums">
                  {formatTime(r.created_at)}
                </div>
                <div className="flex-1 text-body-md min-w-0">
                  <span className="font-semibold text-on-surface">
                    {r.agent}
                  </span>{" "}
                  <span className="text-on-surface-variant">
                    {humanise(r)}
                  </span>
                </div>
                <div className="text-label-sm font-mono text-on-surface-variant flex-none hidden sm:block tabular-nums">
                  €{Number(r.cost_eur || 0).toFixed(4)}
                </div>
              </motion.li>
            ))}
          </motion.ol>
        )}
      </motion.section>
    </motion.div>
  );
}

function EmptyBlock({
  icon,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  icon: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="text-center py-6">
      <span
        className="material-symbols-outlined text-on-surface-variant"
        style={{ fontSize: 36 }}
      >
        {icon}
      </span>
      <h4 className="font-h3 text-h3 text-on-surface mt-2">{title}</h4>
      <p className="text-on-surface-variant mt-1 max-w-md mx-auto text-body-md">
        {body}
      </p>
      {ctaLabel && ctaHref ? (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            add
          </span>
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "--:--";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function humanise(r: AgentRunRow): string {
  const slug = r.product_slug ?? "—";
  const task = r.task_name.replace(/_/g, " ");
  const model = r.llm_model ? ` via ${r.llm_model}` : "";
  if (r.status === "ok" || r.status === "success") {
    return `ran ${task} on ${slug}${model}`;
  }
  return `${r.status} on ${task} for ${slug}${model}`;
}
