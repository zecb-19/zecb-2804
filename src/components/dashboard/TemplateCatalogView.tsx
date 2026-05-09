"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import type { TemplateRow, ArtifactStatus } from "@/lib/templates/queries";

import { easeOut, fadeUp, fadeUpSm, scaleIn, stagger } from "./motion";

type Props = { templates: TemplateRow[] };

const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-emerald-100 text-emerald-800" },
  draft: { label: "Draft", cls: "bg-amber-100 text-amber-800" },
  deprecated: { label: "Deprecated", cls: "bg-slate-100 text-slate-500" },
};

const TIER_LABELS: Record<string, string> = {
  v1: "V1",
  v2: "V2",
  v3: "V3",
};

const ARTIFACT_STATUS_ICON: Record<string, { icon: string; cls: string }> = {
  complete: { icon: "check_circle", cls: "text-emerald-500" },
  in_progress: { icon: "pending", cls: "text-amber-500" },
  not_started: { icon: "radio_button_unchecked", cls: "text-slate-500" },
};

export function TemplateCatalogView({ templates }: Props) {
  const activeCount = templates.filter((t) => t.status === "active").length;
  const totalProducts = templates.reduce((s, t) => s + t.products_total, 0);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.08)}
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Template Catalog</h1>
          <p className="text-slate-500 mt-1.5 max-w-3xl">
            Layer-2 product archetypes. Each template ships only when all 7
            mandatory artifacts exist, are documented, and pass the test suite.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-none">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            {activeCount} active
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
            {totalProducts} products built
          </span>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div
        variants={stagger(0.05, 0.06)}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {templates.map((t) => (
          <TemplateSummaryCard key={t.id} template={t} />
        ))}
      </motion.div>

      {/* Detailed cards */}
      <motion.div variants={stagger(0.05, 0.1)} className="space-y-6">
        {templates.map((t) => (
          <TemplateDetailCard key={t.id} template={t} />
        ))}
      </motion.div>

      {/* Governance note */}
      <motion.div
        variants={fadeUp}
        className="bg-blue-50/30 rounded-2xl p-4 border border-secondary/20"
      >
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600 flex-none" style={{ fontSize: 20 }}>
            gavel
          </span>
          <div className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">Template governance (PRD §7.8):</span>{" "}
            Adding a template requires at least 3 validated opportunities no existing
            template can serve, a distinct core workflow, Foundation compatibility,
            estimated build under 4 weeks, and eval suite + runbook defined before
            code is written.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --- Summary Card --------------------------------------------------------- */

function TemplateSummaryCard({ template: t }: { template: TemplateRow }) {
  const badge = STATUS_BADGES[t.status] ?? STATUS_BADGES.draft;
  const artifactsComplete = t.artifacts.filter((a) => a.status === "complete").length;
  const artifactsTotal = t.artifacts.length;

  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: -2, transition: { duration: 0.2, ease: easeOut } }}
      className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-primary/40 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
          {TIER_LABELS[t.tier] ?? t.tier}
        </span>
        <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + badge.cls}>
          {badge.label}
        </span>
      </div>
      <div className="font-semibold text-base text-slate-900">{t.name}</div>
      <div className="text-xs text-slate-500 mt-0.5">v{t.version}</div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-slate-500">Products</div>
          <div className="font-semibold text-slate-900">{t.products_total}</div>
        </div>
        <div>
          <div className="text-slate-500">Artifacts</div>
          <div className="font-semibold text-slate-900">{artifactsComplete} / {artifactsTotal}</div>
        </div>
      </div>
    </motion.div>
  );
}

/* --- Detail Card ---------------------------------------------------------- */

function TemplateDetailCard({ template: t }: { template: TemplateRow }) {
  const [expanded, setExpanded] = useState(t.status === "active");
  const badge = STATUS_BADGES[t.status] ?? STATUS_BADGES.draft;
  const artifactsComplete = t.artifacts.filter((a) => a.status === "complete").length;

  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-5 flex items-start justify-between gap-4 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-base text-slate-900">{t.name}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
              {TIER_LABELS[t.tier] ?? t.tier}
            </span>
            <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + badge.cls}>
              {badge.label}
            </span>
            {t.eval_pass_rate !== null && (
              <span className={
                "px-2 py-0.5 rounded-full text-xs font-semibold " +
                (t.eval_pass_rate >= 98
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-50 text-red-700")
              }>
                Eval: {t.eval_pass_rate}%
              </span>
            )}
          </div>
          <div className="text-slate-500 text-sm mt-1 max-w-2xl">
            {t.description}
          </div>
        </div>
        <span
          className="material-symbols-outlined text-slate-500 flex-none transition-transform"
          style={{
            fontSize: 22,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          expand_more
        </span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3, ease: easeOut }}
          className="border-t border-slate-200"
        >
          <div className="p-5 space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <MiniStat label="Version" value={`v${t.version}`} />
              <MiniStat label="Products built" value={String(t.products_total)} />
              <MiniStat label="Live" value={String(t.products_live)} />
              <MiniStat label="Building" value={String(t.products_building)} />
              <MiniStat label="Build cost" value={formatCost(t.total_build_cost_eur)} />
            </div>

            {/* Identity & core workflow */}
            {t.identity && (
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  Why this template
                </div>
                <p className="text-sm text-slate-900">{t.identity}</p>
              </div>
            )}
            {t.core_workflow && (
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  Core workflow
                </div>
                <p className="text-sm text-slate-900 font-mono bg-slate-50 rounded-2xl px-3 py-2">
                  {t.core_workflow}
                </p>
              </div>
            )}

            {/* 7 Artifacts checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-slate-500">
                  7 Mandatory Artifacts (PRD §7.1)
                </div>
                <span className={
                  "px-2 py-0.5 rounded-full text-xs font-semibold " +
                  (artifactsComplete === t.artifacts.length
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800")
                }>
                  {artifactsComplete} / {t.artifacts.length} complete
                </span>
              </div>
              <ArtifactsList artifacts={t.artifacts} />
            </div>

            {/* Supported examples */}
            {t.supported_examples.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">
                  Supported product examples ({t.supported_examples.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {t.supported_examples.map((ex) => (
                    <div
                      key={ex.name}
                      className="flex items-start gap-2 bg-slate-50 rounded-2xl px-3 py-2"
                    >
                      <span className="material-symbols-outlined text-blue-600 flex-none mt-0.5" style={{ fontSize: 16 }}>
                        category
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {ex.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {ex.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Governance notes */}
            {t.governance_notes && (
              <div className="text-xs text-slate-500 italic">
                {t.governance_notes}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* --- Shared --------------------------------------------------------------- */

function ArtifactsList({ artifacts }: { artifacts: ArtifactStatus[] }) {
  return (
    <div className="space-y-1.5">
      {artifacts.map((a, i) => {
        const statusInfo = ARTIFACT_STATUS_ICON[a.status] ?? ARTIFACT_STATUS_ICON.not_started;
        return (
          <motion.div
            key={a.name}
            variants={fadeUpSm}
            className="flex items-start gap-3 px-3 py-2 rounded-2xl bg-slate-50"
          >
            <span className="text-xs font-bold text-slate-500 w-5 flex-none pt-0.5">
              {i + 1}
            </span>
            <span
              className={"material-symbols-outlined flex-none mt-0.5 " + statusInfo.cls}
              style={{ fontSize: 18 }}
            >
              {statusInfo.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900">{a.name}</div>
              <div className="text-xs text-slate-500">{a.description}</div>
            </div>
            <span className={
              "px-2 py-0.5 rounded-full text-xs font-semibold flex-none " +
              (a.status === "complete"
                ? "bg-emerald-100 text-emerald-800"
                : a.status === "in_progress"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-500")
            }>
              {a.status.replace(/_/g, " ")}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-2xl px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold text-sm text-slate-900">{value}</div>
    </div>
  );
}

function formatCost(eur: number): string {
  if (eur === 0) return "€0";
  if (eur < 1) return `€${eur.toFixed(4)}`;
  return `€${eur.toFixed(2)}`;
}
