"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import type { TemplateRow, ArtifactStatus } from "@/lib/templates/queries";

import { easeOut, fadeUp, fadeUpSm, scaleIn, stagger } from "./motion";

type Props = { templates: TemplateRow[] };

const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-emerald-100 text-emerald-800" },
  draft: { label: "Draft", cls: "bg-amber-100 text-amber-800" },
  deprecated: { label: "Deprecated", cls: "bg-surface-container text-on-surface-variant" },
};

const TIER_LABELS: Record<string, string> = {
  v1: "V1",
  v2: "V2",
  v3: "V3",
};

const ARTIFACT_STATUS_ICON: Record<string, { icon: string; cls: string }> = {
  complete: { icon: "check_circle", cls: "text-emerald-500" },
  in_progress: { icon: "pending", cls: "text-amber-500" },
  not_started: { icon: "radio_button_unchecked", cls: "text-on-surface-variant" },
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
          <h1 className="font-h1 text-h1 text-primary">Template Catalog</h1>
          <p className="text-on-surface-variant mt-1.5 max-w-3xl">
            Layer-2 product archetypes. Each template ships only when all 7
            mandatory artifacts exist, are documented, and pass the test suite.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-none">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-label-sm font-semibold">
            {activeCount} active
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-label-sm font-semibold">
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
        className="bg-secondary-fixed/30 rounded-lg p-4 border border-secondary/20"
      >
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary flex-none" style={{ fontSize: 20 }}>
            gavel
          </span>
          <div className="text-body-md text-on-surface-variant">
            <span className="font-semibold text-on-surface">Template governance (PRD §7.8):</span>{" "}
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
      className="bg-white rounded-xl border border-surface-variant p-4 hover:border-primary/40 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-0.5 rounded-full text-label-sm font-semibold bg-secondary-fixed text-secondary">
          {TIER_LABELS[t.tier] ?? t.tier}
        </span>
        <span className={"px-2 py-0.5 rounded-full text-label-sm font-semibold " + badge.cls}>
          {badge.label}
        </span>
      </div>
      <div className="font-semibold text-body-lg text-on-surface">{t.name}</div>
      <div className="text-label-sm text-on-surface-variant mt-0.5">v{t.version}</div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-label-sm">
        <div>
          <div className="text-on-surface-variant">Products</div>
          <div className="font-semibold text-on-surface">{t.products_total}</div>
        </div>
        <div>
          <div className="text-on-surface-variant">Artifacts</div>
          <div className="font-semibold text-on-surface">{artifactsComplete} / {artifactsTotal}</div>
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
      className="bg-white rounded-xl border border-surface-variant overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-5 flex items-start justify-between gap-4 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-body-lg text-on-surface">{t.name}</span>
            <span className="px-2 py-0.5 rounded-full text-label-sm font-semibold bg-secondary-fixed text-secondary">
              {TIER_LABELS[t.tier] ?? t.tier}
            </span>
            <span className={"px-2 py-0.5 rounded-full text-label-sm font-semibold " + badge.cls}>
              {badge.label}
            </span>
            {t.eval_pass_rate !== null && (
              <span className={
                "px-2 py-0.5 rounded-full text-label-sm font-semibold " +
                (t.eval_pass_rate >= 98
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-error-container text-on-error-container")
              }>
                Eval: {t.eval_pass_rate}%
              </span>
            )}
          </div>
          <div className="text-on-surface-variant text-body-md mt-1 max-w-2xl">
            {t.description}
          </div>
        </div>
        <span
          className="material-symbols-outlined text-on-surface-variant flex-none transition-transform"
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
          className="border-t border-surface-variant"
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
                <div className="text-label-sm font-semibold text-on-surface-variant mb-1">
                  Why this template
                </div>
                <p className="text-body-md text-on-surface">{t.identity}</p>
              </div>
            )}
            {t.core_workflow && (
              <div>
                <div className="text-label-sm font-semibold text-on-surface-variant mb-1">
                  Core workflow
                </div>
                <p className="text-body-md text-on-surface font-mono bg-surface-container-low rounded-lg px-3 py-2">
                  {t.core_workflow}
                </p>
              </div>
            )}

            {/* 7 Artifacts checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-label-sm font-semibold text-on-surface-variant">
                  7 Mandatory Artifacts (PRD §7.1)
                </div>
                <span className={
                  "px-2 py-0.5 rounded-full text-label-sm font-semibold " +
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
                <div className="text-label-sm font-semibold text-on-surface-variant mb-2">
                  Supported product examples ({t.supported_examples.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {t.supported_examples.map((ex) => (
                    <div
                      key={ex.name}
                      className="flex items-start gap-2 bg-surface-container-low rounded-lg px-3 py-2"
                    >
                      <span className="material-symbols-outlined text-secondary flex-none mt-0.5" style={{ fontSize: 16 }}>
                        category
                      </span>
                      <div className="min-w-0">
                        <div className="text-body-md font-semibold text-on-surface truncate">
                          {ex.name}
                        </div>
                        <div className="text-label-sm text-on-surface-variant">
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
              <div className="text-label-sm text-on-surface-variant italic">
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
            className="flex items-start gap-3 px-3 py-2 rounded-lg bg-surface-container-low"
          >
            <span className="text-label-sm font-bold text-on-surface-variant w-5 flex-none pt-0.5">
              {i + 1}
            </span>
            <span
              className={"material-symbols-outlined flex-none mt-0.5 " + statusInfo.cls}
              style={{ fontSize: 18 }}
            >
              {statusInfo.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-body-md font-semibold text-on-surface">{a.name}</div>
              <div className="text-label-sm text-on-surface-variant">{a.description}</div>
            </div>
            <span className={
              "px-2 py-0.5 rounded-full text-label-sm font-semibold flex-none " +
              (a.status === "complete"
                ? "bg-emerald-100 text-emerald-800"
                : a.status === "in_progress"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-surface-container text-on-surface-variant")
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
    <div className="bg-surface-container-low rounded-lg px-3 py-2">
      <div className="text-label-sm text-on-surface-variant">{label}</div>
      <div className="font-semibold text-body-md text-on-surface">{value}</div>
    </div>
  );
}

function formatCost(eur: number): string {
  if (eur === 0) return "€0";
  if (eur < 1) return `€${eur.toFixed(4)}`;
  return `€${eur.toFixed(2)}`;
}
