"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { approveBuildAction, type ApproveBuildState } from "@/app/actions/builds";
import { PIPELINE_STEPS } from "@/lib/builds/definitions";
import type { ProductRow } from "@/lib/builds/queries";

import { easeOut, fadeUp, stagger } from "./motion";

const initialApproveState: ApproveBuildState = undefined;

const POLL_INTERVAL_MS = 10_000;

const STATUS_BADGES: Record<
  ProductRow["status"],
  { label: string; cls: string }
> = {
  building: { label: "Building", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  live: { label: "Live", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  paused: { label: "Paused", cls: "bg-slate-100 text-slate-500 border border-slate-200" },
  killed: { label: "Killed", cls: "bg-red-50 text-red-600 border border-red-200" },
};

export function PipelineView({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const hasBuilding = products.some((p) => p.status === "building" && p.build_step < p.build_total_steps);

  useEffect(() => {
    if (!hasBuilding) return;
    const id = setInterval(() => router.refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [hasBuilding, router]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.07)}
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Builds</h1>
          <p className="text-slate-500 mt-1 max-w-3xl">
            Track every product through the 11-step build process. Approve launches at step 11.
          </p>
        </div>
        <Link
          href="/dashboard/buildspec"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors flex-none"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          New Build
        </Link>
      </motion.div>

      {hasBuilding && (
        <motion.div variants={fadeUp} className="flex items-center gap-2 text-sm text-slate-500">
          <motion.span
            className="inline-block w-2 h-2 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          Live updates every 10 seconds
        </motion.div>
      )}

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
  const [expanded, setExpanded] = useState(false);
  const [activePulse, setActivePulse] = useState(false);

  const pct = (p.build_step / p.build_total_steps) * 100;
  const stepLabel =
    p.current_step_label ?? PIPELINE_STEPS[p.build_step - 1] ?? "Unknown";
  const badge = STATUS_BADGES[p.status];
  const awaitingApproval =
    p.status === "building" && p.build_step >= p.build_total_steps;
  const inFlight =
    p.status === "building" && p.build_step < p.build_total_steps;
  const isLive = p.status === "live";

  useEffect(() => {
    if (!inFlight) return;
    setActivePulse(true);
    const t = setTimeout(() => setActivePulse(false), 1200);
    return () => clearTimeout(t);
  }, [inFlight, p.build_step]);

  return (
    <motion.li
      variants={fadeUp}
      className={
        "bg-white rounded-2xl border shadow-sm transition-all " +
        (awaitingApproval
          ? "border-amber-200 hover:border-amber-300 hover:shadow-md"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md")
      }
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-5 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-slate-900 truncate">
                {p.slug}
              </span>
              <span
                className={
                  "px-2 py-0.5 rounded-full text-xs font-semibold " +
                  badge.cls
                }
              >
                {badge.label}
              </span>
              {awaitingApproval && (
                <motion.span
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold inline-flex items-center gap-1"
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
                  className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold inline-flex items-center gap-1"
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="material-symbols-outlined inline-block"
                    style={{ fontSize: 14 }}
                  >
                    autorenew
                  </motion.span>
                  Running
                </motion.span>
              )}
              <motion.span
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="material-symbols-outlined text-slate-500 ml-1"
                style={{ fontSize: 18 }}
              >
                chevron_right
              </motion.span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {p.name} · {p.template} v{p.template_version}
            </div>
          </div>
          <div className="text-xs text-slate-500 flex-none text-right">
            Created {formatRelative(p.created_at)}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>
              Step {p.build_step} of {p.build_total_steps} · {stepLabel}
            </span>
            <span className="tabular-nums">{Math.round(pct)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className={
                "h-full " + (awaitingApproval ? "bg-amber-400" : "bg-blue-600")
              }
              initial={{ width: "0%" }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: easeOut, delay: 0.1 }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-200 pt-4">
              <h4 className="text-xs font-semibold text-slate-500 mb-3">
                Pipeline steps
              </h4>
              <ol className="space-y-1">
                {PIPELINE_STEPS.map((label, idx) => {
                  const stepNum = idx + 1;
                  const done = isLive
                    ? true
                    : p.build_step > stepNum;
                  const current = !isLive && p.build_step === stepNum;
                  const waiting = !done && !current;

                  return (
                    <li key={stepNum} className="flex items-center gap-3 py-1.5">
                      <div className="flex-none w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold">
                        {done ? (
                          <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
                          </span>
                        ) : current ? (
                          <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                              className="material-symbols-outlined inline-block"
                              style={{ fontSize: 16 }}
                            >
                              autorenew
                            </motion.span>
                          </span>
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center">
                            {stepNum}
                          </span>
                        )}
                      </div>
                      <span
                        className={
                          "text-sm " +
                          (done
                            ? "text-slate-900"
                            : current
                              ? "text-blue-600 font-semibold"
                              : "text-slate-500")
                        }
                      >
                        {label}
                      </span>
                      {current && inFlight && (
                        <span className="text-xs text-blue-600 ml-auto">
                          In progress...
                        </span>
                      )}
                      {current && awaitingApproval && (
                        <span className="text-xs text-amber-600 ml-auto">
                          Waiting for your approval
                        </span>
                      )}
                      {done && (
                        <span className="text-xs text-emerald-600 ml-auto">
                          Done
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {awaitingApproval && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: easeOut }}
          className="mx-5 mb-5 border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="text-sm text-slate-900">
            <span className="font-semibold">Step 11 — Launch approval.</span>{" "}
            <span className="text-slate-500">
              Steps 1–10 passed. Approving cuts production DNS via the Release
              Agent.
            </span>
          </div>
          <form action={action} className="flex-none">
            <input type="hidden" name="product_id" value={p.id} />
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
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
        <p className="text-red-500 text-xs mx-5 mb-5">{state.message}</p>
      ) : null}
    </motion.li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-slate-500">{label}</div>
      <div className="text-slate-900 font-medium mt-0.5 truncate">{value}</div>
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
