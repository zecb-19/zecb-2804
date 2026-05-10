"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useState } from "react";

import {
  createDataSourceAction,
  deleteDataSourceAction,
  runMonitoringAction,
  type DataSourceState,
} from "@/app/actions/tenant-datasources";
import type { DataSourceRow } from "@/lib/monitoring/queries";

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease } } };
const stagger = (d = 0.05, s = 0.06) => ({ hidden: {}, visible: { transition: { delayChildren: d, staggerChildren: s } } });

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors";

const SOURCE_TYPES = [
  { value: "http_api", label: "HTTP API", needsUrl: true, placeholder: "https://api.example.com/v1/data", icon: "api", color: "from-blue-500 to-indigo-600" },
  { value: "webscrape", label: "Web Scrape", needsUrl: true, placeholder: "https://example.com/prices", icon: "language", color: "from-violet-500 to-purple-600" },
  { value: "rss", label: "RSS Feed", needsUrl: true, placeholder: "https://example.com/feed.xml", icon: "rss_feed", color: "from-orange-500 to-amber-600" },
  { value: "pdf_watch", label: "PDF Watch", needsUrl: true, placeholder: "https://example.com/report.pdf", icon: "picture_as_pdf", color: "from-red-500 to-rose-600" },
  { value: "csv_upload", label: "CSV Upload", needsUrl: false, placeholder: "", icon: "upload_file", color: "from-emerald-500 to-teal-600" },
  { value: "email_inbound", label: "Email", needsUrl: false, placeholder: "", icon: "mail", color: "from-pink-500 to-rose-600" },
  { value: "google_sheets", label: "Sheets", needsUrl: true, placeholder: "https://docs.google.com/spreadsheets/d/...", icon: "table_chart", color: "from-green-500 to-emerald-600" },
] as const;

const initialState: DataSourceState = undefined;

export function SourcesView({ slug, sources }: { slug: string; sources: DataSourceRow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [createState, createAction, createPending] = useActionState(createDataSourceAction, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteDataSourceAction, initialState);
  const [monitorState, monitorAction, monitorPending] = useActionState(runMonitoringAction, initialState);
  const [kind, setKind] = useState("http_api");

  const selectedType = SOURCE_TYPES.find((t) => t.value === kind) ?? SOURCE_TYPES[0];
  const createSuccess = createState && createState.ok;
  const createFailure = createState && !createState.ok ? createState : null;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger()} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Sources</h1>
          <p className="text-slate-500 mt-1">Connect the data your product monitors.</p>
        </div>
        <div className="flex items-center gap-3">
          <form action={monitorAction}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={monitorPending || sources.length === 0}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-shadow inline-flex items-center gap-2"
            >
              {monitorPending ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="material-symbols-outlined inline-block"
                    style={{ fontSize: 18 }}
                  >
                    autorenew
                  </motion.span>
                  Running...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
                  Run Monitoring
                </>
              )}
            </motion.button>
          </form>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/10 transition-all inline-flex items-center gap-2"
          >
            <motion.span
              animate={{ rotate: showForm ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              add
            </motion.span>
            {showForm ? "Cancel" : "Add Source"}
          </motion.button>
        </div>
      </motion.div>

      {/* Monitoring result */}
      <AnimatePresence>
        {monitorState && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
              monitorState.ok
                ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                : "bg-red-50 border border-red-100 text-red-700"
            }`}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {monitorState.ok ? "check_circle" : "error"}
              </span>
              {monitorState.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>add_circle</span>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Add Data Source</h2>
                  <p className="text-sm text-slate-500">Connect a new data feed to monitor</p>
                </div>
              </div>

              {createSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                  {createState.message}
                </motion.div>
              )}
              {createFailure && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"
                >
                  {createFailure.message}
                </motion.div>
              )}

              {/* Type selector cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
                {SOURCE_TYPES.map((t) => (
                  <motion.button
                    key={t.value}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setKind(t.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      kind === t.value
                        ? "border-blue-300 bg-blue-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>{t.icon}</span>
                    </div>
                    <span className={`text-xs font-medium ${kind === t.value ? "text-blue-700" : "text-slate-600"}`}>{t.label}</span>
                  </motion.button>
                ))}
              </div>

              <form action={createAction} className="space-y-4">
                <input type="hidden" name="kind" value={kind} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Source Name</label>
                    <input type="text" name="name" required placeholder="e.g. Amazon Price API" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Rate Limit</label>
                    <input type="number" name="rate_limit" min={1} max={1000} defaultValue={60} className={inputCls} />
                    <p className="text-xs text-slate-400 mt-1">Requests per hour</p>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedType.needsUrl && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">URL</label>
                      <input type="url" name="url" required placeholder={selectedType.placeholder} className={inputCls} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={createPending}
                  className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                >
                  {createPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                      Create Source
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sources list */}
      {sources.length === 0 ? (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto shadow-inner"
          >
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 32 }}>database</span>
          </motion.div>
          <h3 className="font-bold text-slate-900 mt-5 text-lg">No data sources yet</h3>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto leading-relaxed">
            Add your first data source to start collecting data. The monitoring engine will fetch data and evaluate your alert rules automatically.
          </p>
          {!showForm && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/10 transition-all inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Add your first source
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={stagger(0.05, 0.08)} className="space-y-3">
          {sources.map((source, i) => (
            <motion.div
              key={source.id}
              variants={scaleIn}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 card-hover glow-blue"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-none shadow-sm ${
                      source.enabled
                        ? `bg-gradient-to-br ${SOURCE_TYPES.find(t => t.value === source.kind)?.color ?? "from-blue-500 to-indigo-600"}`
                        : "bg-slate-200"
                    }`}
                  >
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>
                      {SOURCE_TYPES.find(t => t.value === source.kind)?.icon ?? "database"}
                    </span>
                  </motion.div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{source.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        {source.kind.replace("_", " ")}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                        source.enabled
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${source.enabled ? "bg-emerald-400" : "bg-slate-400"}`} />
                        {source.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>speed</span>
                        {source.rate_limit_per_hour} req/hr
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span>
                        {source.observations_count} observations
                      </span>
                      {source.last_fetch_at ? (
                        <span className="inline-flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            source.last_fetch_status === "ok" ? "bg-emerald-400" : "bg-red-400"
                          }`} />
                          Last: {new Date(source.last_fetch_at).toISOString().slice(0, 16).replace("T", " ")}
                        </span>
                      ) : (
                        <span className="text-slate-300">Never fetched</span>
                      )}
                    </div>
                    {source.config && typeof source.config === "object" && "url" in (source.config as Record<string, unknown>) && (
                      <div className="mt-2 text-xs text-slate-400 font-mono truncate max-w-lg bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        {String((source.config as Record<string, unknown>).url)}
                      </div>
                    )}
                  </div>
                </div>
                <form action={deleteAction}>
                  <input type="hidden" name="source_id" value={source.id} />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={deletePending}
                    aria-label={`Delete ${source.name}`}
                    title={`Delete ${source.name}`}
                    className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                  </motion.button>
                </form>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {deleteState && !deleteState.ok && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"
          >
            {deleteState.message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
