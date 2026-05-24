"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  approveIdeaAction,
  generateIdeasAction,
  promoteIdeaAction,
  rejectIdeaAction,
} from "@/app/actions/ideas";
import {
  IDEA_REGIONS,
  type GenerateIdeasState,
  type IdeaRow,
  type IdeaStatus,
  type ReviewIdeaState,
} from "@/lib/ideas/definitions";

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = (d = 0.05, s = 0.06) => ({ hidden: {}, visible: { transition: { delayChildren: d, staggerChildren: s } } });

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors";
const labelCls = "text-sm font-medium text-slate-700 mb-1.5 block";

const STATUS_TONE: Record<IdeaStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-600 border-red-200" },
  promoted: { label: "Promoted", cls: "bg-blue-50 text-blue-700 border-blue-200" },
};

const initialGenState: GenerateIdeasState = undefined;
const initialReviewState: ReviewIdeaState = undefined;

type Filter = "all" | IdeaStatus;

export function IdeaInboxView({
  ideas,
  counts,
}: {
  ideas: IdeaRow[];
  counts: Record<IdeaStatus, number>;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [tab, setTab] = useState<"latest" | "all">("latest");

  const filtered = ideas.filter((i) => filter === "all" || i.status === filter);

  const latestBatchId = ideas.length > 0 ? ideas[0].generation_request_id : null;
  const latestBatch = filtered.filter((i) => i.generation_request_id === latestBatchId);
  const pastIdeas = filtered.filter((i) => i.generation_request_id !== latestBatchId);
  const displayedIdeas = tab === "latest" && latestBatchId ? latestBatch : filtered;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger()} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-slate-900">Idea Inbox</h1>
        <p className="text-slate-500 mt-1 max-w-2xl">
          Generate validated business ideas with AI. Approve your favorites, then promote one to start building.
        </p>
      </motion.div>

      <GenerateIdeasForm />

      {/* Tabs: Latest vs All History */}
      {ideas.length > 3 && (
        <motion.div variants={fadeUp} className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button type="button" onClick={() => setTab("latest")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "latest" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              Latest ({latestBatch.length})
            </button>
            <button type="button" onClick={() => setTab("all")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              All History ({ideas.length})
            </button>
          </div>
        </motion.div>
      )}

      {/* Status filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
        <FilterPill label={`All (${ideas.length})`} active={filter === "all"} onClick={() => setFilter("all")} />
        <FilterPill label={`Pending (${counts.pending})`} active={filter === "pending"} onClick={() => setFilter("pending")} />
        <FilterPill label={`Approved (${counts.approved})`} active={filter === "approved"} onClick={() => setFilter("approved")} />
        <FilterPill label={`Promoted (${counts.promoted})`} active={filter === "promoted"} onClick={() => setFilter("promoted")} />
        <FilterPill label={`Rejected (${counts.rejected})`} active={filter === "rejected"} onClick={() => setFilter("rejected")} />
      </motion.div>

      {displayedIdeas.length === 0 ? (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 28 }}>inbox</span>
          </div>
          <h3 className="font-bold text-slate-900 mt-4">
            {ideas.length === 0 ? "No ideas yet" : "Nothing matches that filter"}
          </h3>
          <p className="text-slate-500 mt-1 max-w-md mx-auto text-sm">
            {ideas.length === 0
              ? "Describe your target market above and generate your first batch of ideas."
              : "Try a different filter or generate new ideas."}
          </p>
        </motion.div>
      ) : (
        <motion.ul variants={stagger(0.05, 0.06)} className="space-y-4">
          {displayedIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </motion.ul>
      )}

      {/* Past batches section when on Latest tab */}
      {tab === "latest" && pastIdeas.length > 0 && (
        <motion.div variants={fadeUp}>
          <button type="button" onClick={() => setTab("all")}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>history</span>
            View {pastIdeas.length} past ideas
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all " +
        (active
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700")
      }
    >
      {label}
    </button>
  );
}

function GenerateIdeasForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(generateIdeasAction, initialGenState);
  const failure = state && !state.ok ? state : null;
  const success = state && state.ok ? state : null;

  useEffect(() => {
    if (success) router.refresh();
  }, [success, router]);

  return (
    <motion.section variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-none shadow-lg shadow-violet-500/20">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>auto_awesome</span>
        </div>
        <div>
          <h2 className="font-bold text-slate-900">Generate Ideas</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            The AI generates 3 validated ideas with unit economics. ~€0.05 per generation.
          </p>
        </div>
      </div>

      <form action={action} className="space-y-4">
        {failure?.message && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{failure.message}</div>
        )}
        {success && (
          <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            Generated 3 ideas · cost €{success.cost_eur.toFixed(4)} · scroll down to review.
          </div>
        )}

        <div>
          <label htmlFor="verticals" className={labelCls}>What market do you want to serve?</label>
          <textarea
            id="verticals"
            name="verticals"
            rows={3}
            placeholder="e.g. Amazon sellers tracking competitor prices in Germany, restaurants monitoring supplier costs..."
            className={inputCls}
            required
          />
          {failure?.errors?.verticals?.map((e) => (
            <p key={e} className="text-red-500 text-xs mt-1">{e}</p>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="region" className={labelCls}>Region</label>
            <select id="region" name="region" defaultValue="DACH" className={inputCls}>
              {IDEA_REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="capital_cap_eur" className={labelCls}>Monthly budget cap (€)</label>
            <input id="capital_cap_eur" name="capital_cap_eur" type="number" min={0} max={100000} defaultValue={500} className={inputCls} />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className={labelCls}>Any constraints? (optional)</label>
          <input
            id="notes"
            name="notes"
            type="text"
            maxLength={800}
            placeholder="e.g. avoid price-monitoring, prefer compliance-related ideas"
            className={inputCls}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
        >
          {pending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_awesome</span>
              Generate 3 Ideas
            </>
          )}
        </button>
      </form>
    </motion.section>
  );
}

function IdeaCard({ idea }: { idea: IdeaRow }) {
  const [approveState, approveAction, approvePending] = useActionState(approveIdeaAction, initialReviewState);
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectIdeaAction, initialReviewState);
  const [expanded, setExpanded] = useState(false);

  const tone = STATUS_TONE[idea.status];
  const ue = idea.unit_economics;
  const reviewError =
    (approveState && !approveState.ok ? approveState.message : null) ??
    (rejectState && !rejectState.ok ? rejectState.message : null);

  return (
    <motion.li variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden card-hover">
      {/* Collapsed header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-6 py-5 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">{idea.vertical}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tone.cls}`}>{tone.label}</span>
              {idea.suggested_slug && (
                <span className="font-mono text-xs text-slate-400">{idea.suggested_slug}</span>
              )}
            </div>
            <h3 className="font-bold text-lg text-slate-900">{idea.opportunity}</h3>
            <p className="text-sm text-slate-500 mt-1">
              For <span className="font-semibold text-slate-700">{idea.persona.role}</span> at {idea.persona.company_size} · {idea.persona.country}
            </p>
            {/* Inline metrics preview when collapsed */}
            {!expanded && (
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                <span>CAC <span className={`font-semibold ${ue.estimated_cac_eur < 100 ? "text-emerald-600" : "text-slate-600"}`}>€{ue.estimated_cac_eur.toFixed(0)}</span></span>
                <span>LTV <span className={`font-semibold ${ue.estimated_ltv_eur > 300 ? "text-emerald-600" : "text-slate-600"}`}>€{ue.estimated_ltv_eur.toFixed(0)}</span></span>
                <span>Payback <span className={`font-semibold ${ue.estimated_payback_months <= 6 ? "text-emerald-600" : "text-slate-600"}`}>{ue.estimated_payback_months.toFixed(1)}mo</span></span>
                <span className={`font-semibold capitalize ${ue.confidence === "high" ? "text-emerald-600" : "text-slate-600"}`}>{ue.confidence}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 flex-none">
            <span className="text-xs text-slate-400 font-mono">€{Number(idea.cost_eur).toFixed(4)}</span>
            <motion.span
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="material-symbols-outlined text-slate-400"
              style={{ fontSize: 20 }}
            >
              chevron_right
            </motion.span>
          </div>
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {/* Pain / Promise */}
            <div className="px-6 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InfoBlock label="Pain" text={idea.pain_statement} color="red" />
              <InfoBlock label="Promise" text={idea.core_promise} color="emerald" />
            </div>

            {/* Unit Economics */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard label="CAC" value={`€${ue.estimated_cac_eur.toFixed(0)}`} good={ue.estimated_cac_eur < 100} />
                <MetricCard label="LTV" value={`€${ue.estimated_ltv_eur.toFixed(0)}`} good={ue.estimated_ltv_eur > 300} />
                <MetricCard label="Payback" value={`${ue.estimated_payback_months.toFixed(1)} mo`} good={ue.estimated_payback_months <= 6} />
                <MetricCard label="Confidence" value={ue.confidence} good={ue.confidence === "high"} />
              </div>
            </div>

            {/* Data sources + Pricing */}
            <div className="px-6 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Sources</span>
          <ul className="mt-2 space-y-1.5">
            {idea.suggested_data_sources.map((d) => (
              <li key={d.source_name} className="flex items-start gap-2 text-sm">
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-mono flex-none">{d.type}</span>
                <span className="text-slate-700">{d.source_name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pricing Tiers</span>
          <ul className="mt-2 space-y-1">
            {idea.suggested_pricing_tiers.map((t) => (
              <li key={t.name} className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-700">{t.name}</span>
                <span className="font-mono text-slate-500">€{t.price_eur_monthly.toFixed(0)}/mo</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {idea.suggested_notification_channels.map((c) => (
              <span key={c} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs">{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Reasoning (collapsible) */}
      {idea.reasoning && (
        <div className="px-6 pb-4">
          <details className="group">
            <summary className="text-xs text-blue-600 font-semibold cursor-pointer hover:text-blue-700 flex items-center gap-1">
              <span className="material-symbols-outlined transition-transform group-open:rotate-90" style={{ fontSize: 14 }}>chevron_right</span>
              AI reasoning
            </summary>
            <p className="text-sm text-slate-500 mt-2 whitespace-pre-wrap leading-relaxed">{idea.reasoning}</p>
          </details>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          {idea.reviewer_note ? (
            <span>Note: {idea.reviewer_note}</span>
          ) : (
            <span>Created {formatRelative(idea.created_at)}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {idea.status === "pending" ? (
            <>
              <form action={rejectAction}>
                <input type="hidden" name="idea_id" value={idea.id} />
                <button
                  type="submit"
                  disabled={rejectPending}
                  className="px-3 py-2 rounded-xl text-slate-500 hover:bg-white hover:text-red-600 border border-transparent hover:border-red-200 font-semibold text-xs transition-all disabled:opacity-50"
                >
                  {rejectPending ? "Rejecting..." : "Reject"}
                </button>
              </form>
              <form action={approveAction}>
                <input type="hidden" name="idea_id" value={idea.id} />
                <button
                  type="submit"
                  disabled={approvePending}
                  className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  {approvePending ? "Approving..." : "Approve"}
                </button>
              </form>
              <form action={promoteIdeaAction}>
                <input type="hidden" name="idea_id" value={idea.id} />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>rocket_launch</span>
                  Promote to Build
                </button>
              </form>
            </>
          ) : idea.status === "approved" ? (
            <form action={promoteIdeaAction}>
              <input type="hidden" name="idea_id" value={idea.id} />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>rocket_launch</span>
                Promote to Build
              </button>
            </form>
          ) : (
            <span className="text-xs text-slate-400">
              {idea.status === "promoted" ? "Promoted" : "Rejected"}
              {idea.reviewed_at ? ` · ${formatRelative(idea.reviewed_at)}` : ""}
            </span>
          )}
        </div>
      </div>

            {reviewError && (
              <div className="px-6 pb-4">
                <p className="text-red-500 text-xs">{reviewError}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function InfoBlock({ label, text, color }: { label: string; text: string; color: "red" | "emerald" }) {
  const colors = color === "red"
    ? "bg-red-50 border-red-100 text-red-800"
    : "bg-emerald-50 border-emerald-100 text-emerald-800";
  return (
    <div className={`rounded-xl border p-4 ${colors}`}>
      <span className="text-xs font-semibold uppercase tracking-wider opacity-60">{label}</span>
      <p className="text-sm mt-1 leading-relaxed">{text}</p>
    </div>
  );
}

function MetricCard({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-lg font-bold ${good ? "text-emerald-600" : "text-slate-700"}`}>{value}</div>
    </div>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "—";
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toISOString().slice(0, 10);
}
