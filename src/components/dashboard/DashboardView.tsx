"use client";

import { motion } from "framer-motion";

import {
  cardHover,
  easeOut,
  fadeUp,
  fadeUpSm,
  inViewOnce,
  scaleIn,
  stagger,
} from "./motion";

type Kpi = {
  label: string;
  value: string;
  trend: string;
  icon: string;
  trendTone: "neutral" | "good" | "warn";
};

const KPIS: Kpi[] = [
  {
    label: "Live products",
    value: "3",
    trend: "+1 this month",
    icon: "rocket_launch",
    trendTone: "good",
  },
  {
    label: "Build queue",
    value: "2",
    trend: "in flight",
    icon: "settings_suggest",
    trendTone: "neutral",
  },
  {
    label: "Monthly opex",
    value: "€4,820",
    trend: "of €15,000 cap",
    icon: "payments",
    trendTone: "neutral",
  },
  {
    label: "Pending approvals",
    value: "4",
    trend: "needs your action",
    icon: "task_alt",
    trendTone: "warn",
  },
];

// Step names mirror PRD §7.2 Build Orchestrator pipeline.
const ACTIVE_BUILDS = [
  {
    slug: "einkaufspreis-monitor",
    template: "Monitoring-SaaS",
    step: 7,
    total: 11,
    current: "Onboarding flow generation",
    eta: "~6h",
  },
  {
    slug: "vertragsfristen-wächter",
    template: "Monitoring-SaaS",
    step: 4,
    total: 11,
    current: "Product repo init",
    eta: "~18h",
  },
];

const OUTREACH = [
  {
    label: "CAC (7d, multi-touch)",
    value: "€87",
    delta: "−12%",
    tone: "good" as const,
  },
  {
    label: "Top creative CTR",
    value: "3.4%",
    delta: "Mehl-Preissprung jagen",
    tone: "good" as const,
  },
  {
    label: "Frequency cap",
    value: "18 / 25",
    delta: "impressions / wk",
    tone: "neutral" as const,
  },
  {
    label: "Active campaigns",
    value: "6",
    delta: "Meta Ads + LinkedIn",
    tone: "neutral" as const,
  },
];

type ApprovalType = "launch" | "content" | "pattern" | "propagation";
const APPROVALS: Array<{
  type: ApprovalType;
  title: string;
  subtitle: string;
  waiting: string;
}> = [
  {
    type: "launch",
    title: "Approve launch — einkaufspreis-monitor.de",
    subtitle: "Staging green · QA passed · est. €310/mo opex",
    waiting: "12h",
  },
  {
    type: "content",
    title: "Approve 2 SEO drafts — fördermittel-radar",
    subtitle: "Friday content batch · Reviewer Agent passed brand voice",
    waiting: "2d",
  },
  {
    type: "pattern",
    title: "Promote pattern: observability_panel",
    subtitle: "Reviewer Agent flagged · used by 3 templates",
    waiting: "1d",
  },
  {
    type: "propagation",
    title: "Test top ad headline as LP H1 variant",
    subtitle: "Meta winner · 14-day significance reached",
    waiting: "3h",
  },
];

const ACTIVITY = [
  {
    time: "12:43",
    actor: "Build Orchestrator",
    text: "advanced einkaufspreis-monitor to step 7 (Onboarding flow generation)",
  },
  {
    time: "11:50",
    actor: "Reviewer Agent",
    text: "flagged observability_panel for pattern promotion",
  },
  {
    time: "10:50",
    actor: "Meta Ads Agent",
    text: "auto-paused fördermittel-radar creative #4 (CTR −42% under set mean)",
  },
  {
    time: "10:12",
    actor: "Content Agent",
    text: "drafted 2 SEO articles for vertragsfristen-wächter awaiting review",
  },
  {
    time: "09:33",
    actor: "Lifecycle Email",
    text: "delivered D7 'common pitfalls' to 87 tenants of einkaufspreis-monitor",
  },
  {
    time: "09:00",
    actor: "Orchestrator",
    text: "queued Friday pattern-promotion ritual (4 candidates)",
  },
];

export function DashboardView({ firstName }: { firstName: string }) {
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
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          All systems nominal · DACH-EU
        </div>
      </motion.div>

      {/* KPI cards */}
      <motion.div
        variants={stagger(0.05, 0.07)}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {KPIS.map((k) => (
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
            <span className="text-label-sm text-on-surface-variant px-2 py-1 rounded-full bg-surface-container-low">
              {ACTIVE_BUILDS.length} in flight
            </span>
          </div>
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={stagger(0.3, 0.12)}
            className="space-y-5"
          >
            {ACTIVE_BUILDS.map((b) => {
              const pct = (b.step / b.total) * 100;
              return (
                <motion.li key={b.slug} variants={fadeUpSm}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-mono text-body-md text-on-surface truncate">
                        {b.slug}
                      </div>
                      <div className="text-label-sm text-on-surface-variant truncate">
                        {b.template} · {b.current}
                      </div>
                    </div>
                    <div className="text-label-sm text-on-surface-variant flex-none">
                      ETA {b.eta}
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
                    Step {b.step} of {b.total}
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
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
            {OUTREACH.map((o) => (
              <motion.div key={o.label} variants={fadeUpSm}>
                <div className="text-label-sm text-on-surface-variant">
                  {o.label}
                </div>
                <div className="font-h3 text-h3 text-primary mt-1 truncate">
                  {o.value}
                </div>
                <div
                  className={
                    o.tone === "good"
                      ? "text-label-sm text-emerald-600 mt-0.5"
                      : "text-label-sm text-on-surface-variant mt-0.5"
                  }
                >
                  {o.delta}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </motion.div>

      {/* Pending approvals — appears as user reaches it */}
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
              Friday batch — keep operator time bounded
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-label-sm font-semibold">
            {APPROVALS.length} waiting
          </span>
        </div>
        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          variants={stagger(0.1, 0.07)}
          className="divide-y divide-surface-variant"
        >
          {APPROVALS.map((a) => (
            <motion.li
              key={a.title}
              variants={fadeUpSm}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
              className="py-3 first:pt-0 last:pb-0 flex items-center gap-4 cursor-pointer hover:bg-surface-container-low/40 -mx-2 px-2 rounded-lg"
            >
              <ApprovalBadge type={a.type} />
              <div className="flex-1 min-w-0">
                <div className="text-body-md font-semibold text-on-surface truncate">
                  {a.title}
                </div>
                <div className="text-label-sm text-on-surface-variant truncate">
                  {a.subtitle}
                </div>
              </div>
              <div className="text-label-sm text-on-surface-variant flex-none hidden sm:block">
                waiting {a.waiting}
              </div>
              <button
                type="button"
                className="text-secondary font-semibold text-label-sm hover:underline flex-none"
              >
                Review →
              </button>
            </motion.li>
          ))}
        </motion.ul>
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
          <a
            href="/dashboard/audit"
            className="text-secondary font-semibold text-label-sm hover:underline"
          >
            Open audit trail →
          </a>
        </div>
        <motion.ol
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          variants={stagger(0.1, 0.05)}
          className="space-y-3"
        >
          {ACTIVITY.map((a, i) => (
            <motion.li key={i} variants={fadeUpSm} className="flex gap-3">
              <div className="text-label-sm font-mono text-on-surface-variant w-12 flex-none pt-0.5 tabular-nums">
                {a.time}
              </div>
              <div className="flex-1 text-body-md">
                <span className="font-semibold text-on-surface">{a.actor}</span>{" "}
                <span className="text-on-surface-variant">{a.text}</span>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </motion.section>
    </motion.div>
  );
}

function ApprovalBadge({ type }: { type: ApprovalType }) {
  const map: Record<ApprovalType, { icon: string; cls: string }> = {
    launch: {
      icon: "rocket_launch",
      cls: "bg-secondary-fixed text-secondary",
    },
    content: {
      icon: "edit_note",
      cls: "bg-amber-100 text-amber-800",
    },
    pattern: {
      icon: "extension",
      cls: "bg-emerald-100 text-emerald-800",
    },
    propagation: {
      icon: "share",
      cls: "bg-purple-100 text-purple-800",
    },
  };
  const { icon, cls } = map[type];
  return (
    <motion.div
      whileHover={{ scale: 1.08, rotate: 4 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-none ${cls}`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
        {icon}
      </span>
    </motion.div>
  );
}
