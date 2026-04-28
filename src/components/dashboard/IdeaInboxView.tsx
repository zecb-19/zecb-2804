"use client";

import { motion } from "framer-motion";
import { useActionState, useState } from "react";

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

import { fadeUp, fadeUpSm, scaleIn, stagger } from "./motion";

const inputCls =
  "w-full px-3 py-2.5 rounded-lg bg-surface-container-low border border-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-body-md";
const labelCls = "text-label-sm font-semibold text-on-surface mb-1.5 block";

const STATUS_TONE: Record<IdeaStatus, { label: string; cls: string }> = {
  pending: { label: "Pending review", cls: "bg-amber-100 text-amber-800" },
  approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejected", cls: "bg-error-container text-on-error-container" },
  promoted: { label: "Promoted to BuildSpec", cls: "bg-secondary-fixed text-secondary" },
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
  const filtered = ideas.filter((i) => filter === "all" || i.status === filter);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.07)}
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h1 className="font-h1 text-h1 text-primary">Idea Inbox</h1>
        <p className="text-on-surface-variant mt-1.5 max-w-3xl">
          Validated MarketSignalReports from the Architect Agent. Approve one,
          then promote it to a BuildSpec — fields pre-fill so you can dispatch
          in seconds.
        </p>
      </motion.div>

      <GenerateIdeasForm />

      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
        <FilterPill
          label={`All (${ideas.length})`}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterPill
          label={`Pending (${counts.pending})`}
          active={filter === "pending"}
          onClick={() => setFilter("pending")}
        />
        <FilterPill
          label={`Approved (${counts.approved})`}
          active={filter === "approved"}
          onClick={() => setFilter("approved")}
        />
        <FilterPill
          label={`Promoted (${counts.promoted})`}
          active={filter === "promoted"}
          onClick={() => setFilter("promoted")}
        />
        <FilterPill
          label={`Rejected (${counts.rejected})`}
          active={filter === "rejected"}
          onClick={() => setFilter("rejected")}
        />
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div
          variants={fadeUp}
          className="bg-white rounded-xl border border-surface-variant p-10 text-center"
        >
          <span
            className="material-symbols-outlined text-on-surface-variant"
            style={{ fontSize: 36 }}
          >
            inbox
          </span>
          <h3 className="font-h3 text-h3 text-on-surface mt-2">
            {ideas.length === 0
              ? "No ideas yet"
              : "Nothing matches that filter"}
          </h3>
          <p className="text-on-surface-variant mt-1 max-w-md mx-auto text-body-md">
            {ideas.length === 0
              ? "Describe your verticals above and let the Architect Agent surface 3 validated opportunities."
              : "Try another filter or generate fresh ideas."}
          </p>
        </motion.div>
      ) : (
        <motion.ul
          variants={stagger(0.05, 0.06)}
          className="grid grid-cols-1 gap-4"
        >
          {filtered.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </motion.ul>
      )}
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  onClick,
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
        "px-3 py-1.5 rounded-full text-label-sm font-semibold transition-colors " +
        (active
          ? "bg-primary text-on-primary"
          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high")
      }
    >
      {label}
    </button>
  );
}

function GenerateIdeasForm() {
  const [state, action, pending] = useActionState(
    generateIdeasAction,
    initialGenState,
  );
  const failure = state && !state.ok ? state : null;
  const success = state && state.ok ? state : null;

  return (
    <motion.section
      variants={scaleIn}
      className="bg-white rounded-xl border border-surface-variant p-6"
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-h3 text-h3 text-primary">
            Generate ideas with the Architect Agent
          </h2>
          <p className="text-label-sm text-on-surface-variant mt-1 max-w-2xl">
            Describe verticals, end-buyer types, or constraints. The agent
            returns 3 distinct MarketSignalReports with positive-unit-economic
            estimates. Median cost per generation: ~€0.05.
          </p>
        </div>
      </header>

      <form action={action} className="space-y-4">
        {failure?.message ? (
          <div className="px-3 py-2 rounded-lg bg-error-container text-on-error-container text-body-md">
            {failure.message}
          </div>
        ) : null}
        {success ? (
          <div className="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-800 text-body-md">
            Generated 3 ideas · cost €{success.cost_eur.toFixed(4)} · scroll
            below to review.
          </div>
        ) : null}

        <div>
          <label htmlFor="verticals" className={labelCls}>
            Target verticals or angles
          </label>
          <textarea
            id="verticals"
            name="verticals"
            rows={3}
            placeholder="e.g. DACH gastronomy operators · Handwerk SMBs · regional accountants · supplier-compliance teams"
            className={inputCls}
            required
          />
          {failure?.errors?.verticals?.map((e) => (
            <p key={e} className="text-error text-label-sm mt-1">
              {e}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="region" className={labelCls}>
              Region
            </label>
            <select
              id="region"
              name="region"
              defaultValue="DACH"
              className={inputCls}
            >
              {IDEA_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="capital_cap_eur" className={labelCls}>
              Operator monthly opex cap (€)
            </label>
            <input
              id="capital_cap_eur"
              name="capital_cap_eur"
              type="number"
              min={0}
              max={100000}
              defaultValue={500}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className={labelCls}>
            Constraints, preferences, or anti-goals (optional)
          </label>
          <input
            id="notes"
            name="notes"
            type="text"
            maxLength={800}
            placeholder="e.g. avoid price-monitoring (already shipped), prefer DATEV-adjacent ideas"
            className={inputCls}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {pending ? "hourglass_top" : "auto_awesome"}
          </span>
          {pending ? "Architect thinking…" : "Generate 3 ideas"}
        </button>
      </form>
    </motion.section>
  );
}

// ────────────────────────────────────────────────────────────────────────

function IdeaCard({ idea }: { idea: IdeaRow }) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveIdeaAction,
    initialReviewState,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectIdeaAction,
    initialReviewState,
  );

  const tone = STATUS_TONE[idea.status];
  const ue = idea.unit_economics;
  const reviewError =
    (approveState && !approveState.ok ? approveState.message : null) ??
    (rejectState && !rejectState.ok ? rejectState.message : null);

  const dispatchedToBuildSpec = idea.status === "promoted";

  return (
    <motion.li
      variants={fadeUpSm}
      className="bg-white rounded-xl border border-surface-variant p-6"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary text-label-sm font-semibold">
              {idea.vertical}
            </span>
            <span
              className={
                "px-2 py-0.5 rounded-full text-label-sm font-semibold " + tone.cls
              }
            >
              {tone.label}
            </span>
            {idea.suggested_slug ? (
              <span className="font-mono text-label-sm text-on-surface-variant">
                {idea.suggested_slug}
              </span>
            ) : null}
          </div>
          <h3 className="font-h3 text-h3 text-on-surface mt-2">
            {idea.opportunity}
          </h3>
          <p className="text-label-sm text-on-surface-variant mt-1">
            For <span className="font-semibold">{idea.persona.role}</span> at{" "}
            {idea.persona.company_size} · {idea.persona.country}
          </p>
        </div>
        <div className="text-label-sm text-on-surface-variant text-right flex-none">
          €{Number(idea.cost_eur).toFixed(4)} · {idea.llm_model ?? "—"}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Block label="Pain">{idea.pain_statement}</Block>
        <Block label="Promise">{idea.core_promise}</Block>
        {idea.mechanism ? <Block label="Mechanism">{idea.mechanism}</Block> : null}
        {idea.tam_estimate ? <Block label="TAM">{idea.tam_estimate}</Block> : null}
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-label-sm">
        <Stat
          label="CAC"
          value={`€${ue.estimated_cac_eur.toFixed(0)}`}
          tone="neutral"
        />
        <Stat
          label="LTV"
          value={`€${ue.estimated_ltv_eur.toFixed(0)}`}
          tone="good"
        />
        <Stat
          label="Payback"
          value={`${ue.estimated_payback_months.toFixed(1)} mo`}
          tone={ue.estimated_payback_months <= 6 ? "good" : "neutral"}
        />
        <Stat label="Confidence" value={ue.confidence} tone="neutral" />
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <span className="text-label-sm font-semibold text-on-surface-variant">
            Data sources
          </span>
          <ul className="mt-1.5 space-y-1.5">
            {idea.suggested_data_sources.map((d) => (
              <li
                key={d.source_name}
                className="text-body-md text-on-surface flex gap-2"
              >
                <span
                  className="material-symbols-outlined text-secondary flex-none mt-0.5"
                  style={{ fontSize: 16 }}
                >
                  database
                </span>
                <span>
                  <span className="font-mono text-label-sm bg-surface-container-low px-1.5 py-0.5 rounded">
                    {d.type}
                  </span>{" "}
                  <span className="font-semibold">{d.source_name}</span>
                  <span className="text-on-surface-variant"> — {d.why_relevant}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="text-label-sm font-semibold text-on-surface-variant">
            Pricing
          </span>
          <ul className="mt-1.5 space-y-1">
            {idea.suggested_pricing_tiers.map((t) => (
              <li
                key={t.name}
                className="text-body-md text-on-surface flex justify-between gap-2"
              >
                <span>
                  <span className="font-semibold">{t.name}</span>
                  {t.target_segment ? (
                    <span className="text-on-surface-variant">
                      {" "}
                      · {t.target_segment}
                    </span>
                  ) : null}
                </span>
                <span className="text-on-surface-variant tabular-nums">
                  €{t.price_eur_monthly.toFixed(0)}/mo
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <span className="text-label-sm font-semibold text-on-surface-variant">
              Channels
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {idea.suggested_notification_channels.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded-full bg-surface-container-low text-label-sm"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {idea.reasoning ? (
        <details className="mt-4">
          <summary className="text-label-sm text-secondary font-semibold cursor-pointer hover:underline">
            Architect Agent reasoning
          </summary>
          <p className="text-body-md text-on-surface-variant mt-2 whitespace-pre-wrap">
            {idea.reasoning}
          </p>
        </details>
      ) : null}

      <div className="mt-5 border-t border-surface-variant pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-label-sm text-on-surface-variant">
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
                  className="px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-semibold text-label-sm disabled:opacity-60"
                >
                  {rejectPending ? "Rejecting…" : "Reject"}
                </button>
              </form>
              <form action={approveAction}>
                <input type="hidden" name="idea_id" value={idea.id} />
                <button
                  type="submit"
                  disabled={approvePending}
                  className="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-semibold text-label-sm disabled:opacity-60"
                >
                  {approvePending ? "Approving…" : "Approve"}
                </button>
              </form>
              <form action={promoteIdeaAction}>
                <input type="hidden" name="idea_id" value={idea.id} />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 font-semibold text-label-sm inline-flex items-center gap-1.5"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 16 }}
                  >
                    rocket_launch
                  </span>
                  Promote to BuildSpec
                </button>
              </form>
            </>
          ) : idea.status === "approved" ? (
            <form action={promoteIdeaAction}>
              <input type="hidden" name="idea_id" value={idea.id} />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 font-semibold text-label-sm inline-flex items-center gap-1.5"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 16 }}
                >
                  rocket_launch
                </span>
                Promote to BuildSpec
              </button>
            </form>
          ) : dispatchedToBuildSpec ? (
            <span className="text-label-sm text-on-surface-variant">
              Promoted{idea.reviewed_at ? ` · ${formatRelative(idea.reviewed_at)}` : ""}
            </span>
          ) : (
            <span className="text-label-sm text-on-surface-variant">
              Rejected{idea.reviewed_at ? ` · ${formatRelative(idea.reviewed_at)}` : ""}
            </span>
          )}
        </div>
      </div>

      {reviewError ? (
        <p className="text-error text-label-sm mt-2">{reviewError}</p>
      ) : null}
    </motion.li>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-label-sm font-semibold text-on-surface-variant">
        {label}
      </span>
      <p className="text-body-md text-on-surface mt-0.5">{children}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "neutral";
}) {
  return (
    <div className="bg-surface-container-low/40 rounded-lg p-3">
      <div className="text-label-sm text-on-surface-variant">{label}</div>
      <div
        className={
          "font-h3 text-h3 mt-0.5 " +
          (tone === "good"
            ? "text-emerald-600"
            : tone === "warn"
              ? "text-error"
              : "text-on-surface")
        }
      >
        {value}
      </div>
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
  return new Date(iso).toLocaleDateString();
}
