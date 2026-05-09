"use client";

import { motion } from "framer-motion";
import { useActionState } from "react";

import {
  updateCheckStatusAction,
  type ComplianceActionState,
} from "@/app/actions/compliance";
import type { ComplianceCheck, ComplianceSummary, UnsubscribeStats } from "@/lib/compliance/queries";

import { easeOut, fadeUp, fadeUpSm, scaleIn, stagger } from "./motion";

type Props = {
  checks: ComplianceCheck[];
  summary: ComplianceSummary;
  unsubStats: UnsubscribeStats;
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; description: string }> = {
  dsgvo: {
    label: "DSGVO / Privacy",
    icon: "shield",
    description: "Data protection obligations under DSGVO for every product",
  },
  email: {
    label: "Email Compliance",
    icon: "mail_lock",
    description: "Sending infrastructure, opt-in, and unsubscribe requirements",
  },
  content: {
    label: "Content Governance",
    icon: "fact_check",
    description: "Forbidden claims validation and brand voice enforcement",
  },
  audit: {
    label: "Audit & Logging",
    icon: "history",
    description: "Cost ledger, operator action logging, and retention",
  },
  cold_email: {
    label: "Cold Email (V2 Gate)",
    icon: "lock",
    description: "Hard gate — all checks must pass before activation. Lawyer sign-off required.",
  },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: string }> = {
  complete: { label: "Complete", cls: "bg-emerald-100 text-emerald-800", icon: "check_circle" },
  in_progress: { label: "In Progress", cls: "bg-amber-100 text-amber-800", icon: "pending" },
  not_started: { label: "Not Started", cls: "bg-slate-100 text-slate-500", icon: "radio_button_unchecked" },
};

export function ComplianceGatesView({ checks, summary, unsubStats }: Props) {
  const v1Pct = summary.v1_total > 0 ? (summary.v1_complete / summary.v1_total) * 100 : 0;
  const v2Pct = summary.v2_total > 0 ? (summary.v2_complete / summary.v2_total) * 100 : 0;

  const grouped: Record<string, ComplianceCheck[]> = {};
  for (const c of checks) {
    (grouped[c.category] ??= []).push(c);
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.08)}
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-slate-900">Compliance Gates</h1>
        <p className="text-slate-500 mt-1.5 max-w-3xl">
          Hard gates before activating regulated channels. No bypass — these
          protect the holding from legal and reputational risk. Every status
          change is audit-logged.
        </p>
      </motion.div>

      {/* Summary stats */}
      <motion.div
        variants={stagger(0.05, 0.06)}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <StatCard label="Total checks" value={String(summary.total)} icon="checklist" />
        <StatCard label="Complete" value={String(summary.complete)} icon="check_circle" tone="good" />
        <StatCard label="In progress" value={String(summary.in_progress)} icon="pending" tone="warn" />
        <StatCard label="Not started" value={String(summary.not_started)} icon="radio_button_unchecked" />
      </motion.div>

      {/* V1 / V2 progress bars */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProgressCard
          label="V1 Compliance"
          current={summary.v1_complete}
          total={summary.v1_total}
          pct={v1Pct}
          required
        />
        <ProgressCard
          label="V2 Cold Email Gate"
          current={summary.v2_complete}
          total={summary.v2_total}
          pct={v2Pct}
          required={false}
        />
      </motion.div>

      {/* Unsubscribe ledger stats */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 22 }}>
            unsubscribe
          </span>
          <h2 className="text-lg font-semibold text-slate-900">
            Holding-Wide Unsubscribe Ledger (A-12)
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-2xl px-3 py-2">
            <div className="text-xs text-slate-500">Blocked addresses</div>
            <div className="font-semibold text-base text-slate-900">{unsubStats.total_entries}</div>
          </div>
          <div className="bg-slate-50 rounded-2xl px-3 py-2">
            <div className="text-xs text-slate-500">Last entry</div>
            <div className="font-semibold text-base text-slate-900">
              {unsubStats.last_entry_at
                ? new Date(unsubStats.last_entry_at).toLocaleDateString()
                : "No entries yet"}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Hashed email, lookup-only access. An unsubscribe in any product blocks
          sends from all current and future products in the holding. No bulk
          export, no cross-product enumeration.
        </p>
      </motion.div>

      {/* Check categories */}
      <motion.div variants={stagger(0.05, 0.1)} className="space-y-6">
        {Object.entries(grouped).map(([category, categoryChecks]) => {
          const catCfg = CATEGORY_CONFIG[category] ?? {
            label: category, icon: "verified_user", description: "",
          };
          const isColdEmail = category === "cold_email";

          return (
            <motion.div
              key={category}
              variants={fadeUp}
              className={
                "bg-white rounded-2xl border p-5 " +
                (isColdEmail ? "border-error/30" : "border-slate-200")
              }
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={
                    "material-symbols-outlined " +
                    (isColdEmail ? "text-red-500" : "text-blue-600")
                  }
                  style={{ fontSize: 22 }}
                >
                  {catCfg.icon}
                </span>
                <h2 className="text-lg font-semibold text-slate-900">{catCfg.label}</h2>
                {isColdEmail && (
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                    V2 Locked
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm mb-4">
                {catCfg.description}
              </p>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger(0.03, 0.03)}
                className="space-y-2"
              >
                {categoryChecks.map((check) => (
                  <CheckRow key={check.id} check={check} />
                ))}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Cold email warning */}
      <motion.div
        variants={fadeUp}
        className="bg-red-50/20 rounded-2xl p-4 border border-error/20"
      >
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-red-500 flex-none" style={{ fontSize: 20 }}>
            warning
          </span>
          <div className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">Cold email (PRD §8.6, A-08):</span>{" "}
            No cold-email sending pathway is reachable in production until all V2
            compliance gates are green. Cold email at scale in the EU without a
            lawyer-reviewed framework is a legal and reputational risk that can
            take down the entire holding.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --- Check Row ------------------------------------------------------------ */

function CheckRow({ check: c }: { check: ComplianceCheck }) {
  const [state, action, pending] = useActionState(
    updateCheckStatusAction, undefined as ComplianceActionState,
  );
  const statusCfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.not_started;
  const nextStatus = c.status === "not_started" ? "in_progress" : c.status === "in_progress" ? "complete" : null;

  return (
    <motion.div
      variants={fadeUpSm}
      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl bg-slate-50"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={"material-symbols-outlined " + (c.status === "complete" ? "text-emerald-500" : c.status === "in_progress" ? "text-amber-500" : "text-slate-500")}
          style={{ fontSize: 20 }}
        >
          {statusCfg.icon}
        </span>
        <div className="min-w-0">
          <div className="text-sm text-slate-900 font-medium">{c.name}</div>
          {c.description && (
            <div className="text-xs text-slate-500 truncate max-w-lg">
              {c.description}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-none">
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
          {c.required_for.toUpperCase()}
        </span>
        <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + statusCfg.cls}>
          {statusCfg.label}
        </span>
        {nextStatus && (
          <form action={action}>
            <input type="hidden" name="check_id" value={c.id} />
            <input type="hidden" name="status" value={nextStatus} />
            <button
              type="submit"
              disabled={pending}
              className="px-2.5 py-1 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-white disabled:opacity-60 inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                {pending ? "hourglass_top" : "arrow_forward"}
              </span>
              {nextStatus === "in_progress" ? "Start" : "Complete"}
            </button>
          </form>
        )}
        {state && !state.ok && (
          <span className="text-red-500 text-xs">{state.message}</span>
        )}
      </div>
    </motion.div>
  );
}

/* --- Shared --------------------------------------------------------------- */

function StatCard({
  label, value, icon, tone = "neutral",
}: {
  label: string;
  value: string;
  icon: string;
  tone?: "neutral" | "good" | "warn";
}) {
  return (
    <motion.div variants={scaleIn} className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>{icon}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className={
        "font-display text-2xl font-bold leading-none " +
        (tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-slate-900")
      }>
        {value}
      </div>
    </motion.div>
  );
}

function ProgressCard({
  label, current, total, pct, required,
}: {
  label: string;
  current: number;
  total: number;
  pct: number;
  required: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-slate-900">{label}</span>
        <span className="text-xs text-slate-500">
          {current} / {total}
          {required && " (required for launch)"}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className={pct === 100 ? "h-full bg-emerald-500" : "h-full bg-blue-600"}
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(100, pct)}%` }}
          transition={{ duration: 0.8, ease: easeOut }}
        />
      </div>
      <div className="text-xs text-slate-500 mt-1">
        {pct.toFixed(0)}% complete
      </div>
    </div>
  );
}
