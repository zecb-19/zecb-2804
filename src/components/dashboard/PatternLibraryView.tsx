"use client";

import { motion } from "framer-motion";
import { useActionState, useState } from "react";

import {
  approveCandidateAction,
  rejectCandidateAction,
  type CandidateActionState,
} from "@/app/actions/patterns";
import type { PatternRow, PatternCandidateRow } from "@/lib/patterns/queries";

import { easeOut, fadeUp, fadeUpSm, scaleIn, stagger } from "./motion";

type Props = {
  patterns: PatternRow[];
  categories: { category: string; count: number }[];
  candidates: PatternCandidateRow[];
  stats: { total: number; active: number; categories: number; pending_candidates: number };
};

const CATEGORY_ICONS: Record<string, string> = {
  data: "database",
  ui: "dashboard",
  integration: "cable",
  workflow: "account_tree",
  reporting: "summarize",
  ai: "psychology",
};

const COMPLEXITY_BADGES: Record<string, { label: string; cls: string }> = {
  low: { label: "Low", cls: "bg-emerald-100 text-emerald-800" },
  medium: { label: "Medium", cls: "bg-amber-100 text-amber-800" },
  high: { label: "High", cls: "bg-error-container text-on-error-container" },
};

export function PatternLibraryView({ patterns, categories, candidates, stats }: Props) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = patterns.filter((p) => {
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.08)}
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-h1 text-h1 text-primary">Pattern Library</h1>
          <p className="text-on-surface-variant mt-1.5 max-w-3xl">
            Layer-3 horizontal building blocks. Every build surfaces reusable
            components — the weekly Friday promotion ritual is the single most
            important ritual for the system's long-term moat.
          </p>
        </div>
        {candidates.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-label-sm font-semibold flex-none">
            {candidates.length} pending promotion
          </span>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={stagger(0.05, 0.06)}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <StatCard label="Total patterns" value={String(stats.total)} icon="extension" />
        <StatCard label="Active" value={String(stats.active)} icon="check_circle" />
        <StatCard label="Categories" value={String(stats.categories)} icon="category" />
        <StatCard label="Pending promotion" value={String(stats.pending_candidates)} icon="pending_actions" />
      </motion.div>

      {/* Promotion queue */}
      {candidates.length > 0 && (
        <motion.div variants={fadeUp}>
          <PromotionQueue candidates={candidates} />
        </motion.div>
      )}

      {/* Search + category filter */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            style={{ fontSize: 20 }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search patterns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-variant text-body-md bg-white focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterPill
            label={`All (${patterns.length})`}
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          {categories.map((c) => (
            <FilterPill
              key={c.category}
              label={`${c.category} (${c.count})`}
              active={activeCategory === c.category}
              onClick={() => setActiveCategory(c.category)}
            />
          ))}
        </div>
      </motion.div>

      {/* Pattern grid */}
      {filtered.length === 0 ? (
        <motion.div variants={scaleIn} className="bg-white rounded-xl border border-surface-variant p-8 text-center">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 40 }}>
            search_off
          </span>
          <h3 className="font-h3 text-h3 text-on-surface mt-3">No patterns found</h3>
          <p className="text-on-surface-variant mt-1 text-body-md">
            {search ? "Try a different search term." : "No patterns in this category yet."}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={stagger(0.03, 0.04)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((p) => (
            <PatternCard key={p.id} pattern={p} />
          ))}
        </motion.div>
      )}

      {/* Growth projection */}
      <motion.div
        variants={fadeUp}
        className="bg-secondary-fixed/30 rounded-lg p-4 border border-secondary/20"
      >
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary flex-none" style={{ fontSize: 20 }}>trending_up</span>
          <div className="text-body-md text-on-surface-variant">
            <span className="font-semibold text-on-surface">Growth target (PRD §3.1):</span>{" "}
            ~40-60 patterns by build #10, over 200 by build #50. Currently
            at {stats.total} patterns. Each new build should surface 3-5
            promotion candidates for the Friday ritual.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --- Pattern Card --------------------------------------------------------- */

function PatternCard({ pattern: p }: { pattern: PatternRow }) {
  const catIcon = CATEGORY_ICONS[p.category] ?? "extension";
  const complexity = COMPLEXITY_BADGES[p.complexity] ?? COMPLEXITY_BADGES.medium;

  return (
    <motion.div
      variants={fadeUpSm}
      whileHover={{ y: -2, transition: { duration: 0.2, ease: easeOut } }}
      className="bg-white rounded-xl border border-surface-variant p-4 hover:border-primary/40 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
            {catIcon}
          </span>
          <span className="text-label-sm text-on-surface-variant capitalize">{p.category}</span>
        </div>
        <span className={"px-2 py-0.5 rounded-full text-label-sm font-semibold " + complexity.cls}>
          {complexity.label}
        </span>
      </div>

      <h3 className="font-semibold text-body-lg text-on-surface">{p.name}</h3>
      <p className="text-label-sm text-on-surface-variant mt-1 line-clamp-2">
        {p.description}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {p.tags.slice(0, 3).map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-surface-container-low text-label-sm text-on-surface-variant">
              {t}
            </span>
          ))}
        </div>
        <span className="text-label-sm text-on-surface-variant">v{p.version}</span>
      </div>

      <div className="mt-3 pt-3 border-t border-surface-variant grid grid-cols-2 gap-2 text-label-sm">
        <div>
          <span className="text-on-surface-variant">Used in</span>
          <span className="font-semibold text-on-surface ml-1">{p.used_in_builds} builds</span>
        </div>
        {p.source_product_slug && (
          <div>
            <span className="text-on-surface-variant">Source:</span>
            <span className="font-mono text-on-surface ml-1">{p.source_product_slug}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* --- Promotion Queue ------------------------------------------------------ */

function PromotionQueue({ candidates }: { candidates: PatternCandidateRow[] }) {
  return (
    <section className="bg-white rounded-xl border border-amber-300 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-amber-600" style={{ fontSize: 22 }}>
          pending_actions
        </span>
        <h2 className="font-h3 text-h3 text-on-surface">
          Friday Promotion Queue
        </h2>
        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-label-sm font-semibold">
          {candidates.length} pending
        </span>
      </div>
      <p className="text-on-surface-variant text-body-md mb-4">
        Reviewer Agent flagged these during builds. Approve to extract into the
        Pattern Library; reject to keep local to their product.
      </p>
      <div className="space-y-3">
        {candidates.map((c) => (
          <CandidateCard key={c.id} candidate={c} />
        ))}
      </div>
    </section>
  );
}

function CandidateCard({ candidate: c }: { candidate: PatternCandidateRow }) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveCandidateAction, undefined as CandidateActionState,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectCandidateAction, undefined as CandidateActionState,
  );
  const anyPending = approvePending || rejectPending;
  const resolved = approveState?.ok || rejectState?.ok;

  return (
    <div className={
      "rounded-lg border p-4 transition-opacity " +
      (resolved ? "border-surface-variant opacity-50" : "border-amber-200 bg-amber-50/30")
    }>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-body-md text-on-surface">{c.pattern_name}</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-label-sm">
              {c.category}
            </span>
            {c.product_slug && (
              <span className="text-label-sm text-on-surface-variant">
                from <span className="font-mono">{c.product_slug}</span>
              </span>
            )}
          </div>
          {c.description && (
            <p className="text-label-sm text-on-surface-variant mt-1">{c.description}</p>
          )}
          {c.reason && (
            <p className="text-label-sm text-on-surface-variant mt-0.5 italic">
              Reason: {c.reason}
            </p>
          )}
        </div>

        {!resolved && (
          <div className="flex items-center gap-2 flex-none">
            <form action={approveAction}>
              <input type="hidden" name="candidate_id" value={c.id} />
              <button
                type="submit"
                disabled={anyPending}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                Promote
              </button>
            </form>
            <form action={rejectAction}>
              <input type="hidden" name="candidate_id" value={c.id} />
              <button
                type="submit"
                disabled={anyPending}
                className="px-3 py-1.5 rounded-lg border border-surface-variant text-on-surface-variant text-label-sm font-semibold hover:bg-surface-container-low disabled:opacity-60 inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                Reject
              </button>
            </form>
          </div>
        )}
        {resolved && (
          <span className="text-label-sm text-on-surface-variant italic flex-none">
            {approveState?.ok ? "Promoted" : "Rejected"}
          </span>
        )}
      </div>

      {(approveState && !approveState.ok) && (
        <p className="text-error text-label-sm mt-1">{approveState.message}</p>
      )}
      {(rejectState && !rejectState.ok) && (
        <p className="text-error text-label-sm mt-1">{rejectState.message}</p>
      )}
    </div>
  );
}

/* --- Shared --------------------------------------------------------------- */

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <motion.div variants={scaleIn} className="bg-white rounded-xl border border-surface-variant p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>{icon}</span>
        <span className="text-label-sm text-on-surface-variant">{label}</span>
      </div>
      <div className="font-display text-2xl font-bold text-primary leading-none">{value}</div>
    </motion.div>
  );
}

function FilterPill({
  label, active, onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3 py-1.5 rounded-full text-label-sm font-semibold transition-colors capitalize " +
        (active
          ? "bg-primary text-on-primary"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-low")
      }
    >
      {label}
    </button>
  );
}
