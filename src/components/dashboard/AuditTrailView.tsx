"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import type { AuditRunRow } from "@/lib/builds/queries";

import { fadeUp, fadeUpSm, stagger } from "./motion";

const STATUS_TONE: Record<string, string> = {
  ok: "bg-emerald-100 text-emerald-800",
  success: "bg-emerald-100 text-emerald-800",
  failed: "bg-error-container text-on-error-container",
  error: "bg-error-container text-on-error-container",
  running: "bg-amber-100 text-amber-800",
};

type Props = {
  runs: AuditRunRow[];
  agents: string[];
  productSlugs: string[];
  filters: {
    agent: string;
    product: string;
    since: string;
    status: string;
  };
  page: number;
  hasNext: boolean;
  totalCostShown: number;
};

const SINCE_LABELS: Array<{ value: string; label: string }> = [
  { value: "1h", label: "Last 1 hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

export function AuditTrailView({
  runs,
  agents,
  productSlugs,
  filters,
  page,
  hasNext,
  totalCostShown,
}: Props) {
  const baseQS = new URLSearchParams();
  if (filters.agent) baseQS.set("agent", filters.agent);
  if (filters.product) baseQS.set("product", filters.product);
  if (filters.since) baseQS.set("since", filters.since);
  if (filters.status && filters.status !== "all")
    baseQS.set("status", filters.status);

  const prevQS = new URLSearchParams(baseQS);
  if (page > 1) prevQS.set("page", String(page - 1));
  const nextQS = new URLSearchParams(baseQS);
  nextQS.set("page", String(page + 1));

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.07)}
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h1 className="font-h1 text-h1 text-primary">Audit Trail</h1>
        <p className="text-on-surface-variant mt-1.5 max-w-3xl">
          Every <code className="font-mono text-label-sm">agent_runs</code> row
          attributable to your portfolio. Click any row to inspect input/output
          payloads and ledgered cost.
        </p>
      </motion.div>

      <motion.section
        variants={fadeUp}
        className="bg-white rounded-xl border border-surface-variant p-5"
      >
        <form
          method="get"
          action="/dashboard/audit"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
              Agent
            </label>
            <select
              name="agent"
              defaultValue={filters.agent}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-variant text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All agents</option>
              {agents.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
              Product
            </label>
            <select
              name="product"
              defaultValue={filters.product}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-variant text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All products</option>
              {productSlugs.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
              Since
            </label>
            <select
              name="since"
              defaultValue={filters.since}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-variant text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {SINCE_LABELS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
              Status
            </label>
            <select
              name="status"
              defaultValue={filters.status}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-variant text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All</option>
              <option value="ok">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90"
            >
              Apply
            </button>
            <Link
              href="/dashboard/audit"
              className="px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low text-label-sm font-semibold"
            >
              Clear
            </Link>
          </div>
        </form>
      </motion.section>

      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between text-label-sm text-on-surface-variant"
      >
        <span>
          Showing {runs.length} run{runs.length === 1 ? "" : "s"} · ledgered
          cost on this page: €{totalCostShown.toFixed(4)}
        </span>
        <span>
          Page {page}
          {hasNext ? " (more →)" : ""}
        </span>
      </motion.div>

      {runs.length === 0 ? (
        <motion.div
          variants={fadeUp}
          className="bg-white rounded-xl border border-surface-variant p-10 text-center"
        >
          <span
            className="material-symbols-outlined text-on-surface-variant"
            style={{ fontSize: 36 }}
          >
            fact_check
          </span>
          <h3 className="font-h3 text-h3 text-on-surface mt-2">
            No agent runs match
          </h3>
          <p className="text-on-surface-variant mt-1 max-w-md mx-auto text-body-md">
            Try widening the time range or clearing filters. New activity
            appears as you generate ideas, dispatch builds, or approve
            launches.
          </p>
        </motion.div>
      ) : (
        <motion.ul
          variants={stagger(0.04, 0.04)}
          className="bg-white rounded-xl border border-surface-variant divide-y divide-surface-variant"
        >
          {runs.map((r) => (
            <motion.li key={r.id} variants={fadeUpSm}>
              <details className="group">
                <summary className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-surface-container-low/40 transition-colors list-none">
                  <span
                    className="material-symbols-outlined text-on-surface-variant transition-transform group-open:rotate-90 flex-none"
                    style={{ fontSize: 16 }}
                  >
                    chevron_right
                  </span>
                  <div className="text-label-sm font-mono text-on-surface-variant w-32 flex-none tabular-nums">
                    {formatTime(r.created_at)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-on-surface">
                        {r.agent}
                      </span>
                      <span className="font-mono text-label-sm text-on-surface-variant">
                        {r.task_name}
                      </span>
                      <span
                        className={
                          "px-2 py-0.5 rounded-full text-label-sm font-semibold " +
                          (STATUS_TONE[r.status] ??
                            "bg-surface-container text-on-surface-variant")
                        }
                      >
                        {r.status}
                      </span>
                      {r.product_slug ? (
                        <span className="font-mono text-label-sm bg-surface-container-low px-1.5 py-0.5 rounded">
                          {r.product_slug}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-label-sm font-mono text-on-surface-variant flex-none tabular-nums">
                    €{Number(r.cost_eur || 0).toFixed(4)}
                  </div>
                </summary>
                <div className="px-12 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-3 text-label-sm">
                  <JsonBlock label="Input" value={r.input} />
                  <JsonBlock label="Output" value={r.output} />
                  {r.error_message ? (
                    <div className="lg:col-span-2 px-3 py-2 rounded-lg bg-error-container text-on-error-container">
                      <strong>Error:</strong> {r.error_message}
                    </div>
                  ) : null}
                  <div className="lg:col-span-2 text-on-surface-variant">
                    {r.llm_model ? (
                      <>
                        <span className="font-semibold">Model:</span>{" "}
                        <span className="font-mono">{r.llm_model}</span>
                      </>
                    ) : (
                      <span>No LLM call</span>
                    )}{" "}
                    · run id:{" "}
                    <span className="font-mono">{r.id.slice(0, 8)}…</span>
                  </div>
                </div>
              </details>
            </motion.li>
          ))}
        </motion.ul>
      )}

      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        {page > 1 ? (
          <Link
            href={`/dashboard/audit?${prevQS.toString()}`}
            className="px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low text-label-sm font-semibold inline-flex items-center gap-1"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              chevron_left
            </span>
            Newer
          </Link>
        ) : (
          <span />
        )}
        {hasNext ? (
          <Link
            href={`/dashboard/audit?${nextQS.toString()}`}
            className="px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low text-label-sm font-semibold inline-flex items-center gap-1"
          >
            Older
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              chevron_right
            </span>
          </Link>
        ) : (
          <span />
        )}
      </motion.div>
    </motion.div>
  );
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  let pretty: string;
  try {
    pretty = JSON.stringify(value, null, 2);
  } catch {
    pretty = String(value);
  }
  return (
    <div>
      <span className="text-label-sm font-semibold text-on-surface-variant">
        {label}
      </span>
      <pre className="mt-1 px-3 py-2 rounded-lg bg-surface-container-low text-label-sm font-mono whitespace-pre-wrap break-words max-h-72 overflow-auto">
        {pretty}
      </pre>
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
