"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { PIPELINE_STEPS } from "@/lib/builds/definitions";
import type { AgentRunRow, OnboardingProgress, ProductRow } from "@/lib/builds/queries";

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
  onboarding: OnboardingProgress;
};

type Kpi = {
  label: string;
  value: string;
  trend: string;
  icon: string;
  color: string;
  trendTone: "neutral" | "good" | "warn";
};

export function DashboardView({
  firstName,
  activeBuilds,
  recentRuns,
  statusCounts,
  pendingApprovals,
  monthlyOpexEur,
  onboarding,
}: Props) {
  const opexPct = Math.min(100, (monthlyOpexEur / 15_000) * 100);
  const opexFmt =
    monthlyOpexEur < 1
      ? `€${monthlyOpexEur.toFixed(4)}`
      : `€${monthlyOpexEur.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const greeting = "Welcome back";

  const isNewUser = !onboarding.hasIdeas && !onboarding.hasProduct;
  const showChecklist = !onboarding.hasLiveProduct;

  const kpis: Kpi[] = [
    {
      label: "Live products",
      value: String(statusCounts.live),
      trend: statusCounts.live === 0 ? "ship your first one" : `${statusCounts.live} live`,
      icon: "rocket_launch",
      color: "bg-emerald-50 text-emerald-600",
      trendTone: statusCounts.live > 0 ? "good" : "neutral",
    },
    {
      label: "Build queue",
      value: String(statusCounts.building),
      trend: statusCounts.building === 0 ? "queue empty" : `${statusCounts.building} in flight`,
      icon: "settings_suggest",
      color: "bg-blue-50 text-blue-600",
      trendTone: "neutral",
    },
    {
      label: "Monthly opex",
      value: opexFmt,
      trend: `of €15k cap (${opexPct.toFixed(1)}%)`,
      icon: "payments",
      color: "bg-violet-50 text-violet-600",
      trendTone: opexPct > 80 ? "warn" : "neutral",
    },
    {
      label: "Pending approvals",
      value: String(pendingApprovals.length),
      trend: pendingApprovals.length === 0 ? "all caught up" : "needs your action",
      icon: "task_alt",
      color: "bg-amber-50 text-amber-600",
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
      {/* Hero greeting */}
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.08),transparent_60%)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {greeting}, {firstName}
            </h2>
            <p className="text-slate-400 mt-2 max-w-xl">
              {isNewUser
                ? "Ready to launch your first product? Follow the steps below to get started."
                : "Your portfolio at a glance — approvals first, everything else compounds."}
            </p>
          </div>
          <div className="text-sm text-slate-500 flex items-center gap-2 flex-none">
            <motion.span
              className="inline-block w-2 h-2 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            All systems nominal
          </div>
        </div>
      </motion.div>

      {/* Getting started checklist — shown until first live product */}
      {showChecklist && (
        <motion.section variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 22 }}>checklist</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Getting Started</h3>
              <p className="text-sm text-slate-500">Complete these steps to launch your first product</p>
            </div>
          </div>
          <div className="space-y-1">
            <ChecklistItem
              done={onboarding.hasIdeas}
              label="Generate business ideas"
              description="Let the AI create 3 validated ideas for you"
              href="/dashboard/inbox"
              actionLabel="Generate ideas"
            />
            <ChecklistItem
              done={onboarding.hasApprovedIdea}
              label="Approve and promote an idea"
              description="Review ideas and promote your favorite to a BuildSpec"
              href="/dashboard/inbox"
              actionLabel="Review ideas"
            />
            <ChecklistItem
              done={onboarding.hasProduct}
              label="Configure and build your product"
              description="Fill in the BuildSpec form and dispatch the build"
              href="/dashboard/buildspec"
              actionLabel="Create BuildSpec"
            />
            <ChecklistItem
              done={onboarding.hasLiveProduct}
              label="Approve the launch"
              description="Review the completed build and go live"
              href="/dashboard/pipeline"
              actionLabel="View pipeline"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${([onboarding.hasIdeas, onboarding.hasApprovedIdea, onboarding.hasProduct, onboarding.hasLiveProduct].filter(Boolean).length / 4) * 100}%` }}
                  transition={{ duration: 0.8, ease: easeOut }}
                />
              </div>
              <span className="text-sm font-medium text-slate-500">
                {[onboarding.hasIdeas, onboarding.hasApprovedIdea, onboarding.hasProduct, onboarding.hasLiveProduct].filter(Boolean).length}/4
              </span>
            </div>
          </div>
        </motion.section>
      )}

      {/* Quick actions */}
      <motion.div variants={stagger(0.05, 0.06)} className="flex flex-wrap gap-3">
        <QuickAction href="/dashboard/inbox" icon="auto_awesome" label="Generate Ideas" />
        <QuickAction href="/dashboard/buildspec" icon="add_circle" label="New Build" />
        <QuickAction href="/dashboard/pipeline" icon="rocket_launch" label="Pipeline" />
        <QuickAction href="/dashboard/audit" icon="fact_check" label="Audit Trail" />
        <QuickAction href="/dashboard/compliance" icon="verified_user" label="Compliance" />
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
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-md transition-all cursor-default"
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${k.color} flex items-center justify-center`}>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{k.icon}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{k.label}</span>
            </div>
            <div className="font-bold text-3xl text-slate-900 mt-3 leading-none">{k.value}</div>
            <div className={
              "text-xs mt-1.5 " +
              (k.trendTone === "good" ? "text-emerald-600" : k.trendTone === "warn" ? "text-red-500" : "text-slate-400")
            }>
              {k.trend}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Active builds + Pending approvals */}
      <motion.div variants={stagger(0, 0.1)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.section variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>settings_suggest</span>
              </div>
              <h3 className="font-bold text-slate-900">Active Builds</h3>
            </div>
            <Link href="/dashboard/buildspec" className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              New
            </Link>
          </div>
          {activeBuilds.length === 0 ? (
            <EmptyBlock
              icon="rocket_launch"
              title="No builds in flight"
              body="Create a BuildSpec to get the Build Orchestrator started."
              ctaLabel="Start a build"
              ctaHref="/dashboard/buildspec"
            />
          ) : (
            <motion.ul initial="hidden" animate="visible" variants={stagger(0.2, 0.1)} className="space-y-4">
              {activeBuilds.map((b) => {
                const pct = (b.build_step / b.build_total_steps) * 100;
                const stepLabel = b.current_step_label ?? PIPELINE_STEPS[b.build_step - 1] ?? "Unknown";
                return (
                  <motion.li key={b.id} variants={fadeUpSm}>
                    <Link href="/dashboard/pipeline" className="block hover:bg-slate-50 -mx-2 px-2 py-1 rounded-lg transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-mono text-sm text-slate-900 truncate">{b.slug}</div>
                          <div className="text-xs text-slate-500 truncate">{b.template} · {stepLabel}</div>
                        </div>
                        <div className="text-xs text-slate-400 flex-none">ETA ≤72h</div>
                      </div>
                      <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, ease: easeOut, delay: 0.45 }}
                        />
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Step {b.build_step} of {b.build_total_steps}
                      </div>
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </motion.section>

        <motion.section variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600" style={{ fontSize: 18 }}>task_alt</span>
              </div>
              <h3 className="font-bold text-slate-900">Pending Approvals</h3>
            </div>
            {pendingApprovals.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                {pendingApprovals.length} waiting
              </span>
            )}
          </div>
          {pendingApprovals.length === 0 ? (
            <EmptyBlock
              icon="task_alt"
              title="All caught up"
              body="Launch gates appear here when a build reaches step 11."
            />
          ) : (
            <motion.ul initial="hidden" animate="visible" variants={stagger(0.1, 0.07)} className="space-y-3">
              {pendingApprovals.map((p) => (
                <motion.li key={p.id} variants={fadeUpSm}>
                  <Link
                    href="/dashboard/pipeline"
                    className="flex items-center gap-4 py-2 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-none bg-amber-50">
                      <span className="material-symbols-outlined text-amber-600" style={{ fontSize: 20 }}>rocket_launch</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        Approve — <span className="font-mono">{p.slug}</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        Steps 1–10 passed ·{" "}
                        {p.estimated_monthly_opex_eur
                          ? `est. €${Number(p.estimated_monthly_opex_eur).toFixed(0)}/mo`
                          : "opex pending"}
                      </div>
                    </div>
                    <span className="text-blue-600 font-semibold text-xs flex-none">Review</span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.section>
      </motion.div>

      {/* Activity feed */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={inViewOnce}
        variants={fadeUp}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-600" style={{ fontSize: 18 }}>fact_check</span>
            </div>
            <h3 className="font-bold text-slate-900">Recent Activity</h3>
          </div>
          <Link href="/dashboard/audit" className="text-blue-600 font-semibold text-sm hover:text-blue-700">
            View all
          </Link>
        </div>
        {recentRuns.length === 0 ? (
          <EmptyBlock
            icon="fact_check"
            title="No activity yet"
            body="Activity will appear here once you dispatch a build or generate ideas."
          />
        ) : (
          <motion.ol
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            variants={stagger(0.05, 0.04)}
            className="space-y-2"
          >
            {recentRuns.map((r) => (
              <motion.li key={r.id} variants={fadeUpSm} className="flex gap-3 py-1.5">
                <div className="text-xs font-mono text-slate-400 w-12 flex-none pt-0.5 tabular-nums">
                  {formatTime(r.created_at)}
                </div>
                <div className="flex-1 text-sm min-w-0">
                  <span className="font-semibold text-slate-900">{r.agent}</span>{" "}
                  <span className="text-slate-500">{humanise(r)}</span>
                </div>
                <div className="text-xs font-mono text-slate-400 flex-none hidden sm:block tabular-nums">
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

function ChecklistItem({
  done,
  label,
  description,
  href,
  actionLabel,
}: {
  done: boolean;
  label: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <div className={`flex items-center gap-4 py-3 px-3 rounded-xl transition-colors ${done ? "bg-emerald-50/50" : "hover:bg-slate-50"}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-none ${
        done ? "bg-emerald-100" : "border-2 border-slate-200"
      }`}>
        {done && <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 18 }}>check</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${done ? "text-slate-400 line-through" : "text-slate-900"}`}>{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{description}</div>
      </div>
      {!done && (
        <Link
          href={href}
          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex-none"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <motion.div variants={fadeUpSm}>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all"
      >
        <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>{icon}</span>
        {label}
      </Link>
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
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 24 }}>{icon}</span>
      </div>
      <h4 className="font-semibold text-slate-900 mt-3">{title}</h4>
      <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">{body}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "--:--";
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
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
