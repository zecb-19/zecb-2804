"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useState } from "react";

import {
  createDataSourceAction,
  deleteDataSourceAction,
  runMonitoringAction,
  updateDataSourceAction,
  toggleDataSourceAction,
  testDataSourceAction,
  type DataSourceState,
} from "@/app/actions/tenant-datasources";
import type { DataSourceRow } from "@/lib/monitoring/queries";

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease } } };
const stagger = (d = 0.05, s = 0.06) => ({ hidden: {}, visible: { transition: { delayChildren: d, staggerChildren: s } } });

const inputCls =
  "w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors";
const labelCls = "text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block";

const SOURCE_TYPES = [
  { value: "http_api", label: "HTTP API", needsUrl: true, placeholder: "https://api.example.com/v1/data", icon: "api", color: "from-blue-500 to-indigo-600" },
  { value: "webscrape", label: "Web Scrape", needsUrl: true, placeholder: "https://example.com/prices", icon: "language", color: "from-violet-500 to-purple-600" },
  { value: "rss", label: "RSS Feed", needsUrl: true, placeholder: "https://example.com/feed.xml", icon: "rss_feed", color: "from-orange-500 to-amber-600" },
  { value: "pdf_watch", label: "PDF Watch", needsUrl: true, placeholder: "https://example.com/report.pdf", icon: "picture_as_pdf", color: "from-red-500 to-rose-600" },
  { value: "csv_upload", label: "CSV Upload", needsUrl: false, placeholder: "", icon: "upload_file", color: "from-emerald-500 to-teal-600" },
  { value: "email_inbound", label: "Email", needsUrl: false, placeholder: "", icon: "mail", color: "from-pink-500 to-rose-600" },
  { value: "google_sheets", label: "Sheets", needsUrl: true, placeholder: "https://docs.google.com/spreadsheets/d/...", icon: "table_chart", color: "from-green-500 to-emerald-600" },
] as const;

type SourceConfig = Record<string, unknown>;

export function SourcesView({ slug, sources }: { slug: string; sources: DataSourceRow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createState, createAction, createPending] = useActionState(createDataSourceAction, undefined as DataSourceState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteDataSourceAction, undefined as DataSourceState);
  const [monitorState, monitorAction, monitorPending] = useActionState(runMonitoringAction, undefined as DataSourceState);
  const [updateState, updateAction, updatePending] = useActionState(updateDataSourceAction, undefined as DataSourceState);
  const [toggleState, toggleAction, togglePending] = useActionState(toggleDataSourceAction, undefined as DataSourceState);
  const [testState, testAction, testPending] = useActionState(testDataSourceAction, undefined as DataSourceState);
  const [kind, setKind] = useState("http_api");

  const selectedType = SOURCE_TYPES.find((t) => t.value === kind) ?? SOURCE_TYPES[0];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger()} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Data Sources</h1>
          <p className="text-sm text-slate-500 mt-0.5">{sources.length} source{sources.length !== 1 ? "s" : ""} configured</p>
        </div>
        <div className="flex items-center gap-2">
          <form action={monitorAction}>
            <button
              type="submit"
              disabled={monitorPending || sources.length === 0}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{monitorPending ? "sync" : "play_arrow"}</span>
              {monitorPending ? "Running..." : "Run All"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => { setShowForm((v) => !v); setEditingId(null); }}
            className="px-3.5 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{showForm ? "close" : "add"}</span>
            {showForm ? "Cancel" : "Add Source"}
          </button>
        </div>
      </motion.div>

      {/* Status messages */}
      <StatusBanner state={monitorState} />
      <StatusBanner state={testState} />

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4">New Data Source</h2>

              <StatusBanner state={createState} />

              {/* Type selector */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {SOURCE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setKind(t.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      kind === t.value
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                      {t.icon}
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>

              <form action={createAction} className="space-y-4">
                <input type="hidden" name="kind" value={kind} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Source Name</label>
                    <input type="text" name="name" required placeholder="e.g. Metro Preisliste" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Rate Limit (req/hr)</label>
                    <input type="number" name="rate_limit" min={1} max={1000} defaultValue={60} className={inputCls} />
                  </div>
                </div>

                {selectedType.needsUrl && (
                  <div>
                    <label className={labelCls}>URL</label>
                    <input type="url" name="url" required placeholder={selectedType.placeholder} className={inputCls} />
                  </div>
                )}

                {/* Connector-specific config */}
                <ConnectorConfig kind={kind} config={{}} namePrefix="" />

                <button
                  type="submit"
                  disabled={createPending}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                >
                  {createPending ? "Creating..." : "Create Source"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sources list */}
      {sources.length === 0 ? (
        <motion.div variants={fadeUp} className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 28 }}>sensors</span>
          </div>
          <h3 className="font-bold text-slate-900 mt-4">No data sources yet</h3>
          <p className="text-sm text-slate-500 mt-1">Connect your first data source to start monitoring.</p>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Add Source
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={stagger(0.03, 0.06)} className="space-y-3">
          {sources.map((source) => {
            const typeInfo = SOURCE_TYPES.find((t) => t.value === source.kind);
            const isEditing = editingId === source.id;
            const cfg = (source.config ?? {}) as SourceConfig;

            return (
              <motion.div
                key={source.id}
                variants={scaleIn}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Source Header */}
                <div className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-none shadow-sm ${
                      source.enabled
                        ? `bg-gradient-to-br ${typeInfo?.color ?? "from-blue-500 to-indigo-600"}`
                        : "bg-slate-200"
                    }`}>
                      <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>
                        {typeInfo?.icon ?? "database"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900">{source.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                          {source.kind.replace("_", " ")}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          source.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${source.enabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                          {source.enabled ? "Active" : "Paused"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 flex-wrap">
                        <span>{source.rate_limit_per_hour} req/hr</span>
                        <span>{source.observations_count} observations</span>
                        {source.last_fetch_at ? (
                          <span className="inline-flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${source.last_fetch_status === "ok" ? "bg-emerald-400" : "bg-red-400"}`} />
                            {timeAgo(source.last_fetch_at)}
                          </span>
                        ) : (
                          <span>Never fetched</span>
                        )}
                      </div>
                      {typeof cfg.url === "string" && cfg.url && (
                        <div className="mt-1.5 text-[11px] text-slate-400 font-mono truncate max-w-lg">
                          {cfg.url}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-none">
                    <form action={testAction}>
                      <input type="hidden" name="source_id" value={source.id} />
                      <button type="submit" disabled={testPending} title="Test fetch" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>bug_report</span>
                      </button>
                    </form>
                    <form action={toggleAction}>
                      <input type="hidden" name="source_id" value={source.id} />
                      <button type="submit" disabled={togglePending} title={source.enabled ? "Pause" : "Resume"} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          {source.enabled ? "pause" : "play_arrow"}
                        </span>
                      </button>
                    </form>
                    <button type="button" onClick={() => setEditingId(isEditing ? null : source.id)} title="Edit" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {isEditing ? "expand_less" : "edit"}
                      </span>
                    </button>
                    <form action={deleteAction}>
                      <input type="hidden" name="source_id" value={source.id} />
                      <button type="submit" disabled={deletePending} title="Delete" className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Inline Edit Form */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
                        <StatusBanner state={updateState} />
                        <form action={updateAction} className="space-y-3">
                          <input type="hidden" name="source_id" value={source.id} />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className={labelCls}>Name</label>
                              <input type="text" name="name" required defaultValue={source.name} className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Rate Limit (req/hr)</label>
                              <input type="number" name="rate_limit" min={1} max={1000} defaultValue={source.rate_limit_per_hour} className={inputCls} />
                            </div>
                          </div>
                          <ConnectorConfig kind={source.kind} config={cfg} namePrefix="" isEdit />
                          <input type="hidden" name="config_json" value={buildConfigJson(source.kind, cfg)} />
                          <div className="flex gap-2">
                            <button type="submit" disabled={updatePending} className="px-3.5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors">
                              {updatePending ? "Saving..." : "Save Changes"}
                            </button>
                            <button type="button" onClick={() => setEditingId(null)} className="px-3.5 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-300 transition-colors">
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <StatusBanner state={deleteState && !deleteState.ok ? deleteState : undefined} />
      <StatusBanner state={toggleState && !toggleState.ok ? toggleState : undefined} />
    </motion.div>
  );
}

/* ─── Connector-Specific Config Fields ────────────────────────────── */

function ConnectorConfig({ kind, config, namePrefix, isEdit }: { kind: string; config: SourceConfig; namePrefix: string; isEdit?: boolean }) {
  const cfg = config;
  if (kind === "http_api") {
    return (
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">API Configuration</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>HTTP Method</label>
            <select name={`${namePrefix}method`} defaultValue={String(cfg.method ?? "GET")} className={inputCls}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Auth Type</label>
            <select name={`${namePrefix}auth_type`} defaultValue={String(cfg.auth_type ?? "none")} className={inputCls}>
              <option value="none">None</option>
              <option value="bearer">Bearer Token</option>
              <option value="basic">Basic Auth</option>
              <option value="api_key">API Key (header)</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Auth Token / API Key (optional)</label>
          <input type="password" name={`${namePrefix}auth_token`} defaultValue={String(cfg.auth_token ?? "")} placeholder="sk-..." className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>JSON Path to Extract (optional)</label>
          <input type="text" name={`${namePrefix}json_path`} defaultValue={String(cfg.json_path ?? "")} placeholder="$.data.items[*]" className={inputCls} />
          <p className="text-[10px] text-slate-400 mt-1">JSONPath expression to extract data from response</p>
        </div>
        <div>
          <label className={labelCls}>Custom Headers (optional, one per line: Key: Value)</label>
          <textarea name={`${namePrefix}headers_raw`} defaultValue={String(cfg.headers_raw ?? "")} rows={2} placeholder={"Accept: application/json\nX-Custom: value"} className={inputCls + " font-mono text-xs"} />
        </div>
      </div>
    );
  }
  if (kind === "webscrape") {
    return (
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scrape Configuration</div>
        <div>
          <label className={labelCls}>CSS Selectors (one per line: label | selector)</label>
          <textarea name={`${namePrefix}selectors_raw`} defaultValue={String(cfg.selectors_raw ?? "")} rows={3} placeholder={"price | .product-price span\ntitle | h1.product-name\nstock | .availability-status"} className={inputCls + " font-mono text-xs"} />
          <p className="text-[10px] text-slate-400 mt-1">Each line: field name | CSS selector</p>
        </div>
        <div>
          <label className={labelCls}>Wait for Selector (optional)</label>
          <input type="text" name={`${namePrefix}wait_selector`} defaultValue={String(cfg.wait_selector ?? "")} placeholder=".main-content" className={inputCls} />
        </div>
      </div>
    );
  }
  if (kind === "google_sheets") {
    return (
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sheets Configuration</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Sheet Name</label>
            <input type="text" name={`${namePrefix}sheet_name`} defaultValue={String(cfg.sheet_name ?? "")} placeholder="Sheet1" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Cell Range</label>
            <input type="text" name={`${namePrefix}range`} defaultValue={String(cfg.range ?? "")} placeholder="A1:D100" className={inputCls} />
          </div>
        </div>
      </div>
    );
  }
  if (kind === "csv_upload") {
    return (
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">CSV Configuration</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Delimiter</label>
            <select name={`${namePrefix}delimiter`} defaultValue={String(cfg.delimiter ?? ",")} className={inputCls}>
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Column Mapping (optional)</label>
            <input type="text" name={`${namePrefix}columns`} defaultValue={String(cfg.columns ?? "")} placeholder="price,name,sku" className={inputCls} />
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/* ─── Helpers ─────────────────────────────────────────────────────── */

function buildConfigJson(kind: string, cfg: SourceConfig): string {
  return JSON.stringify(cfg);
}

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatusBanner({ state }: { state: DataSourceState }) {
  if (!state) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
        state.ok ? "bg-emerald-50 border border-emerald-100 text-emerald-700" : "bg-red-50 border border-red-100 text-red-700"
      }`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
        {state.ok ? "check_circle" : "error"}
      </span>
      {state.message}
    </motion.div>
  );
}
