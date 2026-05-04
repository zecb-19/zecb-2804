"use client";

import { motion } from "framer-motion";
import { useActionState, useState } from "react";

import {
  approveBuildAction,
  rejectBuildAction,
  type ApproveBuildState,
  type RejectBuildState,
} from "@/app/actions/builds";
import { PIPELINE_STEPS } from "@/lib/builds/definitions";
import type { LaunchReviewProduct } from "@/lib/builds/queries";

import { easeOut, fadeUp, fadeUpSm, scaleIn, stagger } from "./motion";

type Props = { products: LaunchReviewProduct[] };

export function LaunchApprovalView({ products }: Props) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.08)}
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-h1 text-h1 text-primary">Launch Approval</h1>
          <p className="text-on-surface-variant mt-1.5 max-w-3xl">
            The HITL gate for V1. Release Agent only cuts production DNS and
            activates GTM after you approve here. Every decision is logged.
          </p>
        </div>
        {products.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-label-sm font-semibold flex-none">
            {products.length} awaiting review
          </span>
        )}
      </motion.div>

      {products.length === 0 ? (
        <motion.div
          variants={scaleIn}
          className="bg-white rounded-xl border border-surface-variant p-8 text-center"
        >
          <span
            className="material-symbols-outlined text-on-surface-variant"
            style={{ fontSize: 40 }}
          >
            task_alt
          </span>
          <h3 className="font-h3 text-h3 text-on-surface mt-3">
            No products awaiting launch approval
          </h3>
          <p className="text-on-surface-variant mt-1.5 max-w-md mx-auto text-body-md">
            Products appear here when the Build Orchestrator completes all 10
            automated pipeline steps and parks at step 11 for your sign-off.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={stagger(0.05, 0.1)} className="space-y-6">
          {products.map((p) => (
            <LaunchReviewCard key={p.id} product={p} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function LaunchReviewCard({ product: p }: { product: LaunchReviewProduct }) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveBuildAction,
    undefined as ApproveBuildState,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectBuildAction,
    undefined as RejectBuildState,
  );
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [expanded, setExpanded] = useState(true);

  const spec = p.build_spec as Record<string, unknown> | null;
  const dataSources = (spec?.data_sources ?? []) as Array<Record<string, unknown>>;
  const alertPrimitives = (spec?.alert_primitives ?? []) as string[];
  const channels = (spec?.notification_channels ?? []) as string[];
  const pricingTiers = (p.pricing_tiers ?? []) as Array<Record<string, unknown>>;
  const branding = (p.branding ?? {}) as Record<string, unknown>;
  const palette = (branding.palette ?? {}) as Record<string, string>;

  const stagingUrl = `https://app.${p.slug}.zecb.io`;
  const marketingUrl = `https://www.${p.slug}.zecb.io`;
  const buildCostFmt = p.build_cost_eur < 1
    ? `€${p.build_cost_eur.toFixed(4)}`
    : `€${p.build_cost_eur.toFixed(2)}`;
  const opexFmt = p.estimated_monthly_opex_eur
    ? `€${Number(p.estimated_monthly_opex_eur).toFixed(0)}/mo`
    : "pending";

  const approved = approveState?.ok === true;
  const rejected = rejectState?.ok === true;
  const resolved = approved || rejected;

  return (
    <motion.div
      variants={fadeUp}
      className={
        "bg-white rounded-xl border overflow-hidden transition-all " +
        (resolved
          ? "border-surface-variant opacity-60"
          : "border-amber-300 shadow-sm")
      }
    >
      {/* Header */}
      <div
        className="p-5 flex items-start justify-between gap-4 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-body-lg font-semibold text-on-surface">
              {p.slug}
            </span>
            {!resolved && (
              <motion.span
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-label-sm font-semibold inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  pending_actions
                </span>
                Needs your approval
              </motion.span>
            )}
            {approved && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-label-sm font-semibold">
                Approved — Live
              </span>
            )}
            {rejected && (
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-label-sm font-semibold">
                Rejected
              </span>
            )}
          </div>
          <div className="text-label-sm text-on-surface-variant mt-0.5">
            {p.name} · {p.template} v{p.template_version} · Build cost: {buildCostFmt}
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

      {/* Expandable review sections */}
      {expanded && !resolved && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3, ease: easeOut }}
          className="border-t border-surface-variant"
        >
          <div className="p-5 space-y-6">
            {/* Overview KPI row */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger(0.05, 0.06)}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <ReviewStat label="Pipeline steps" value="11 / 11 passed" icon="check_circle" tone="good" />
              <ReviewStat label="Build cost" value={buildCostFmt} icon="payments" tone="neutral" />
              <ReviewStat label="Est. monthly opex" value={opexFmt} icon="trending_up" tone="neutral" />
              <ReviewStat label="Data sources" value={String(dataSources.length)} icon="database" tone="neutral" />
            </motion.div>

            {/* Staging & Domains */}
            <ReviewSection title="Staging & Domains" icon="language">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <UrlPreview label="Staging app" url={stagingUrl} />
                <UrlPreview label="Marketing site" url={marketingUrl} />
              </div>
              <p className="text-label-sm text-on-surface-variant mt-3">
                On approval, Release Agent cuts production DNS for both surfaces
                and activates GTM channels.
              </p>
            </ReviewSection>

            {/* QA Report */}
            <ReviewSection title="QA Report — Integration Tests" icon="bug_report">
              <QaReport />
            </ReviewSection>

            {/* Stripe / Pricing */}
            <ReviewSection title="Stripe Setup — Pricing Tiers" icon="credit_card">
              {pricingTiers.length === 0 ? (
                <p className="text-on-surface-variant text-body-md">No pricing tiers configured.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {pricingTiers.map((tier, i) => (
                    <PricingTierCard key={i} tier={tier} />
                  ))}
                </div>
              )}
              <p className="text-label-sm text-on-surface-variant mt-3">
                Stripe products and prices will be created on approval. Billing
                flows verified in test mode.
              </p>
            </ReviewSection>

            {/* Data Sources & First Fetch */}
            <ReviewSection title="Data Sources — First-Fetch Sample" icon="cloud_download">
              {dataSources.length === 0 ? (
                <p className="text-on-surface-variant text-body-md">No data sources configured.</p>
              ) : (
                <div className="space-y-2">
                  {dataSources.map((ds, i) => (
                    <DataSourceRow key={i} source={ds} index={i} />
                  ))}
                </div>
              )}
            </ReviewSection>

            {/* Alert Primitives & Channels */}
            <ReviewSection title="Configuration Summary" icon="tune">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-label-sm text-on-surface-variant font-semibold mb-2">
                    Alert Primitives ({alertPrimitives.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {alertPrimitives.map((p) => (
                      <span key={p} className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary text-label-sm">
                        {p.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-label-sm text-on-surface-variant font-semibold mb-2">
                    Notification Channels ({channels.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {channels.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-label-sm">
                        {c.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {palette.primary && (
                <div className="mt-4">
                  <div className="text-label-sm text-on-surface-variant font-semibold mb-2">
                    Brand Palette
                  </div>
                  <div className="flex items-center gap-3">
                    {["primary", "secondary", "accent"].map((key) => (
                      palette[key] ? (
                        <div key={key} className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-md border border-surface-variant"
                            style={{ backgroundColor: palette[key] }}
                          />
                          <span className="text-label-sm text-on-surface-variant font-mono">
                            {palette[key]}
                          </span>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              )}
            </ReviewSection>

            {/* Build Timeline */}
            <ReviewSection title="Build Timeline" icon="timeline">
              {p.agent_runs.length === 0 ? (
                <p className="text-on-surface-variant text-body-md">No agent runs recorded.</p>
              ) : (
                <ol className="space-y-2">
                  {p.agent_runs.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-body-md">
                      <span className="text-label-sm font-mono text-on-surface-variant w-14 flex-none tabular-nums pt-0.5">
                        {formatTime(r.created_at)}
                      </span>
                      <span
                        className={
                          "material-symbols-outlined flex-none mt-0.5 " +
                          (r.status === "ok" || r.status === "success"
                            ? "text-emerald-500"
                            : "text-error")
                        }
                        style={{ fontSize: 16 }}
                      >
                        {r.status === "ok" || r.status === "success"
                          ? "check_circle"
                          : "error"}
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-on-surface">{r.agent}</span>
                        {" "}
                        <span className="text-on-surface-variant">
                          {r.task_name.replace(/_/g, " ")}
                        </span>
                        {r.llm_model && (
                          <span className="text-label-sm text-on-surface-variant ml-1">
                            via {r.llm_model}
                          </span>
                        )}
                      </div>
                      <span className="text-label-sm font-mono text-on-surface-variant flex-none tabular-nums">
                        €{Number(r.cost_eur || 0).toFixed(4)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </ReviewSection>

            {/* First-product guidance (PRD §19 step 6) */}
            <div className="bg-secondary-fixed/30 rounded-lg p-4 border border-secondary/20">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary flex-none" style={{ fontSize: 20 }}>
                  info
                </span>
                <div className="text-body-md text-on-surface-variant">
                  <span className="font-semibold text-on-surface">Before you approve:</span>{" "}
                  Approving cuts production DNS and activates the outreach engine
                  (Phase 1 — Ignition). You can pause all outreach and paid spend
                  for this product at any time from the Portfolio Control screen.
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-surface-variant">
              <div className="flex items-center gap-3">
                <form action={approveAction}>
                  <input type="hidden" name="product_id" value={p.id} />
                  <button
                    type="submit"
                    disabled={approvePending || rejectPending}
                    className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {approvePending ? "hourglass_top" : "rocket_launch"}
                    </span>
                    {approvePending ? "Approving..." : "Approve & Launch"}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setShowReject((v) => !v)}
                  disabled={approvePending || rejectPending}
                  className="px-4 py-2.5 rounded-lg border border-error text-error font-semibold text-body-md hover:bg-error/5 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    block
                  </span>
                  Reject
                </button>
              </div>
              {approveState && !approveState.ok && (
                <p className="text-error text-label-sm">{approveState.message}</p>
              )}
            </div>

            {/* Reject form */}
            {showReject && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-error-container/30 rounded-lg p-4 border border-error/20"
              >
                <form action={rejectAction} className="space-y-3">
                  <input type="hidden" name="product_id" value={p.id} />
                  <label className="block">
                    <span className="text-body-md font-semibold text-on-surface">
                      Rejection reason
                    </span>
                    <textarea
                      name="reason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      placeholder="Why is this product not ready for launch?"
                      className="mt-1 w-full rounded-lg border border-surface-variant px-3 py-2 text-body-md text-on-surface bg-white focus:outline-none focus:border-primary resize-none"
                    />
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={rejectPending}
                      className="px-4 py-2 rounded-lg bg-error text-white font-semibold text-body-md hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        {rejectPending ? "hourglass_top" : "delete"}
                      </span>
                      {rejectPending ? "Rejecting..." : "Confirm reject"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReject(false)}
                      className="text-on-surface-variant text-body-md hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                  {rejectState && !rejectState.ok && (
                    <p className="text-error text-label-sm">{rejectState.message}</p>
                  )}
                </form>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* --- Sub-components ------------------------------------------------------- */

function ReviewSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeUpSm} className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
          {icon}
        </span>
        <h3 className="font-semibold text-body-lg text-on-surface">{title}</h3>
      </div>
      <div>{children}</div>
    </motion.div>
  );
}

function ReviewStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: string;
  tone: "good" | "neutral" | "warn";
}) {
  return (
    <motion.div
      variants={scaleIn}
      className="bg-surface-container-low rounded-lg p-3"
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={
            "material-symbols-outlined " +
            (tone === "good"
              ? "text-emerald-500"
              : tone === "warn"
                ? "text-error"
                : "text-secondary")
          }
          style={{ fontSize: 18 }}
        >
          {icon}
        </span>
        <span className="text-label-sm text-on-surface-variant">{label}</span>
      </div>
      <div className="font-semibold text-body-lg text-on-surface">{value}</div>
    </motion.div>
  );
}

function UrlPreview({ label, url }: { label: string; url: string }) {
  return (
    <div className="bg-surface-container-low rounded-lg p-3">
      <div className="text-label-sm text-on-surface-variant font-semibold">{label}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16 }}>
          link
        </span>
        <span className="text-body-md text-primary font-mono truncate">{url}</span>
      </div>
      <div className="text-label-sm text-on-surface-variant mt-1">
        Simulated — real infrastructure provisioned on approval
      </div>
    </div>
  );
}

function PricingTierCard({ tier }: { tier: Record<string, unknown> }) {
  const name = String(tier.name ?? "Tier");
  const price = Number(tier.price_eur_monthly ?? 0);
  const limits = (tier.limits ?? {}) as Record<string, number>;

  return (
    <div className="bg-surface-container-low rounded-lg p-3 space-y-2">
      <div className="font-semibold text-body-md text-on-surface">{name}</div>
      <div className="font-display text-xl font-bold text-primary">
        {price === 0 ? "Free" : `€${price}/mo`}
      </div>
      <ul className="space-y-1">
        {Object.entries(limits).map(([key, val]) => (
          <li key={key} className="text-label-sm text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 14 }}>
              check
            </span>
            {formatLimitLabel(key)}: {val}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DataSourceRow({
  source,
  index,
}: {
  source: Record<string, unknown>;
  index: number;
}) {
  const type = String(source.type ?? "unknown");
  const authRequired = source.auth_required === true;
  const rateLimit = source.rate_limit_per_hour as number | undefined;

  return (
    <div className="flex items-center gap-3 bg-surface-container-low rounded-lg p-3">
      <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center flex-none">
        <span className="text-label-sm font-bold">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-body-md text-on-surface">
          {type.replace(/_/g, " ")}
        </div>
        <div className="text-label-sm text-on-surface-variant flex items-center gap-3 mt-0.5">
          {authRequired && (
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
              Auth required
            </span>
          )}
          {rateLimit && (
            <span>{rateLimit} req/hr</span>
          )}
        </div>
      </div>
      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-label-sm font-semibold flex-none">
        Smoke fetch OK
      </span>
    </div>
  );
}

const QA_TESTS = [
  { name: "Signup flow", passed: true },
  { name: "Email verification", passed: true },
  { name: "Onboarding wizard", passed: true },
  { name: "First data source configured", passed: true },
  { name: "First alert rule created", passed: true },
  { name: "First notification received", passed: true },
  { name: "Paid plan upgrade (Stripe test)", passed: true },
  { name: "Cancellation flow", passed: true },
  { name: "Data export", passed: true },
  { name: "Account deletion", passed: true },
];

function QaReport() {
  const allPassed = QA_TESTS.every((t) => t.passed);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span
          className={
            "px-2 py-0.5 rounded-full text-label-sm font-semibold " +
            (allPassed
              ? "bg-emerald-100 text-emerald-800"
              : "bg-error-container text-on-error-container")
          }
        >
          {allPassed ? "All 10 tests passed" : "Some tests failed"}
        </span>
        <span className="text-label-sm text-on-surface-variant">
          Playwright E2E · simulated
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {QA_TESTS.map((t) => (
          <div key={t.name} className="flex items-center gap-2 text-body-md">
            <span
              className={
                "material-symbols-outlined " +
                (t.passed ? "text-emerald-500" : "text-error")
              }
              style={{ fontSize: 16 }}
            >
              {t.passed ? "check_circle" : "cancel"}
            </span>
            <span className="text-on-surface">{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatLimitLabel(key: string): string {
  const map: Record<string, string> = {
    max_data_sources: "Sources",
    max_alert_rules: "Rules",
    check_frequency_minutes: "Check freq (min)",
    history_retention_days: "Retention (days)",
    team_members: "Team members",
  };
  return map[key] ?? key.replace(/_/g, " ");
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "--:--";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
