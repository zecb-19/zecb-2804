"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { approveBuildAction, type ApproveBuildState } from "@/app/actions/builds";
import { PIPELINE_STEPS } from "@/lib/builds/definitions";
import type { ProductRow } from "@/lib/builds/queries";

import { easeOut, fadeUp, stagger } from "./motion";

const initialApproveState: ApproveBuildState = undefined;

const STATUS_BADGES: Record<
  ProductRow["status"],
  { label: string; cls: string }
> = {
  building: { label: "Building", cls: "bg-amber-100 text-amber-800" },
  live: { label: "Live", cls: "bg-emerald-100 text-emerald-800" },
  paused: { label: "Paused", cls: "bg-surface-container text-on-surface-variant" },
  killed: { label: "Killed", cls: "bg-error-container text-on-error-container" },
};

export function PipelineView({ products }: { products: ProductRow[] }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.07)}
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-h1 text-h1 text-primary">Build Pipeline</h1>
          <p className="text-on-surface-variant mt-1.5 max-w-3xl">
            Every product the Build Orchestrator is shepherding, with current
            step and ledgered cost.
          </p>
        </div>
        <Link
          href="/dashboard/buildspec"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90 flex-none"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            add
          </span>
          New Build
        </Link>
      </motion.div>

      <motion.ul variants={stagger(0.05, 0.06)} className="space-y-4">
        {products.map((p) => (
          <ProductRowCard key={p.id} product={p} />
        ))}
      </motion.ul>
    </motion.div>
  );
}

function ProductRowCard({ product: p }: { product: ProductRow }) {
  const [state, action, pending] = useActionState(
    approveBuildAction,
    initialApproveState,
  );
  const [activePulse, setActivePulse] = useState(false);

  const pct = (p.build_step / p.build_total_steps) * 100;
  const stepLabel =
    p.current_step_label ?? PIPELINE_STEPS[p.build_step - 1] ?? "Unknown";
  const badge = STATUS_BADGES[p.status];
  const awaitingApproval =
    p.status === "building" && p.build_step >= p.build_total_steps;
  const inFlight =
    p.status === "building" && p.build_step < p.build_total_steps;

  useEffect(() => {
    if (!inFlight) return;
    setActivePulse(true);
    const t = setTimeout(() => setActivePulse(false), 1200);
    return () => clearTimeout(t);
  }, [inFlight, p.build_step]);

  return (
    <motion.li
      variants={fadeUp}
      whileHover={{ y: -2, transition: { duration: 0.2, ease: easeOut } }}
      className={
        "bg-white rounded-xl border p-5 transition-shadow " +
        (awaitingApproval
          ? "border-amber-300 hover:border-amber-400 hover:shadow-md"
          : "border-surface-variant hover:border-primary/40 hover:shadow-md")
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-body-md text-on-surface truncate">
              {p.slug}
            </span>
            <span
              className={
                "px-2 py-0.5 rounded-full text-label-sm font-semibold " +
                badge.cls
              }
            >
              {badge.label}
            </span>
            {awaitingApproval && (
              <motion.span
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-label-sm font-semibold inline-flex items-center gap-1"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 14 }}
                >
                  pending_actions
                </span>
                Needs your approval
              </motion.span>
            )}
            {inFlight && (
              <motion.span
                animate={{ opacity: activePulse ? [1, 0.55, 1] : 1 }}
                transition={{ duration: 1.0 }}
                className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary text-label-sm font-semibold inline-flex items-center gap-1"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 14 }}
                >
                  autorenew
                </span>
                Running
              </motion.span>
            )}
          </div>
          <div className="text-label-sm text-on-surface-variant mt-0.5">
            {p.name} · {p.template} v{p.template_version}
          </div>
        </div>
        <div className="text-label-sm text-on-surface-variant flex-none text-right">
          Created {formatRelative(p.created_at)}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-label-sm text-on-surface-variant mb-1.5">
          <span>
            Step {p.build_step} of {p.build_total_steps} · {stepLabel}
          </span>
          <span className="tabular-nums">{Math.round(pct)}%</span>
        </div>
        <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
          <motion.div
            className={
              "h-full " + (awaitingApproval ? "bg-amber-400" : "bg-secondary")
            }
            initial={{ width: "0%" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.1 }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-label-sm">
        <Stat label="Status" value={badge.label} />
        <Stat label="Template" value={p.template} />
        <Stat
          label="Est. opex"
          value={
            p.estimated_monthly_opex_eur
              ? `€${Number(p.estimated_monthly_opex_eur).toFixed(0)}/mo`
              : "—"
          }
        />
        <Stat label="Updated" value={formatRelative(p.updated_at)} />
      </div>

      {awaitingApproval && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: easeOut }}
          className="mt-4 border-t border-surface-variant pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="text-body-md text-on-surface">
            <span className="font-semibold">Step 11 — Launch approval.</span>{" "}
            <span className="text-on-surface-variant">
              Steps 1–10 passed. Approving cuts production DNS via the Release
              Agent.
            </span>
          </div>
          <form action={action} className="flex-none">
            <input type="hidden" name="product_id" value={p.id} />
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                {pending ? "hourglass_top" : "rocket_launch"}
              </span>
              {pending ? "Approving…" : "Approve launch"}
            </button>
          </form>
        </motion.div>
      )}

      {state && !state.ok ? (
        <p className="text-error text-label-sm mt-2">{state.message}</p>
      ) : null}
    </motion.li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-on-surface-variant">{label}</div>
      <div className="text-on-surface font-medium mt-0.5 truncate">{value}</div>
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
