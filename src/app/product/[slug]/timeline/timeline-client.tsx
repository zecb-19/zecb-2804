"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import type { DataSourceRow, ObservationRow } from "@/lib/monitoring/queries";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = (d = 0.05, s = 0.06) => ({ hidden: {}, visible: { transition: { delayChildren: d, staggerChildren: s } } });

export function TimelineClient({
  slug,
  observations,
  sources,
}: {
  slug: string;
  observations: ObservationRow[];
  sources: DataSourceRow[];
}) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showCount, setShowCount] = useState(50);

  const filtered = observations.filter((obs) => {
    if (sourceFilter !== "all" && obs.data_source_name !== sourceFilter) return false;
    if (dateFrom && obs.observed_at < dateFrom) return false;
    if (dateTo && obs.observed_at > dateTo + "T23:59:59") return false;
    if (search) {
      const q = search.toLowerCase();
      const text = `${obs.data_source_name} ${JSON.stringify(obs.dimensions)} ${JSON.stringify(obs.measures)}`.toLowerCase();
      return text.includes(q);
    }
    return true;
  });
  const visible = filtered.slice(0, showCount);
  const hasMore = filtered.length > showCount;

  function downloadCSV() {
    if (filtered.length === 0) return;
    const allKeys = new Set<string>();
    filtered.forEach((obs) => {
      Object.keys(obs.measures).forEach((k) => allKeys.add(`measure_${k}`));
      Object.keys(obs.dimensions).filter((k) => !k.startsWith("_")).forEach((k) => allKeys.add(`dim_${k}`));
    });
    const headers = ["timestamp", "source", ...Array.from(allKeys)];
    const rows = filtered.map((obs) => {
      const row: Record<string, string> = {
        timestamp: obs.observed_at,
        source: obs.data_source_name,
      };
      Object.entries(obs.measures).forEach(([k, v]) => { row[`measure_${k}`] = String(v); });
      Object.entries(obs.dimensions).filter(([k]) => !k.startsWith("_")).forEach(([k, v]) => { row[`dim_${k}`] = v; });
      return headers.map((h) => `"${(row[h] ?? "").replace(/"/g, '""')}"`).join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-observations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJSON() {
    if (filtered.length === 0) return;
    const data = filtered.map((obs) => ({
      timestamp: obs.observed_at,
      source: obs.data_source_name,
      dimensions: obs.dimensions,
      measures: obs.measures,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-observations-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger()} className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Timeline</h1>
          <p className="text-slate-500 mt-1">
            {observations.length} observations collected.
            {filtered.length !== observations.length && ` Showing ${filtered.length}.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={downloadCSV} disabled={filtered.length === 0}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:border-slate-300 disabled:opacity-40 transition-all inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>CSV
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={downloadJSON} disabled={filtered.length === 0}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:border-slate-300 disabled:opacity-40 transition-all inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>data_object</span>JSON
          </motion.button>
        </div>
      </motion.div>

      {/* Search + filter */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search observations..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSourceFilter("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${sourceFilter === "all" ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"}`}
          >
            All
          </button>
          {sources.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSourceFilter(sourceFilter === s.name ? "all" : s.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${sourceFilter === s.name ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"}`}
            >
              {s.name}
            </button>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            <span className="text-xs text-slate-400">to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            {(dateFrom || dateTo) && (
              <button type="button" onClick={() => { setDateFrom(""); setDateTo(""); }} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Observations */}
      {filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 32 }}>
              {observations.length === 0 ? "timeline" : "search_off"}
            </span>
          </div>
          <h3 className="font-bold text-slate-900 mt-5 text-lg">
            {observations.length === 0 ? "No observations yet" : "No results"}
          </h3>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
            {observations.length === 0 ? (
              <>Observations appear as data sources are monitored. <Link href={`/product/${slug}/sources`} className="text-blue-600 font-semibold hover:text-blue-700">Add a source</Link> to get started.</>
            ) : "Try a different search term or filter."}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={stagger(0.02, 0.04)} className="space-y-2">
          {visible.map((obs) => (
            <motion.div key={obs.id} variants={fadeUp} whileHover={{ y: -1, transition: { duration: 0.15 } }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 card-hover glow-emerald">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-none">
                  <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 20 }}>visibility</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900">{obs.data_source_name}</span>
                      {obs.fetch_duration_ms && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs">{obs.fetch_duration_ms}ms</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono flex-none">
                      {obs.observed_at.slice(0, 16).replace("T", " ")}
                    </span>
                  </div>
                  {Object.keys(obs.dimensions).filter((k) => !k.startsWith("_")).length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {Object.entries(obs.dimensions).filter(([k]) => !k.startsWith("_")).map(([k, v]) => (
                        <span key={k} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500">
                          {k}: <span className="font-mono text-slate-700">{v}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {Object.keys(obs.measures).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(obs.measures).map(([k, v]) => (
                        <span key={k} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-xs">
                          {k}: <span className="font-mono font-semibold text-blue-700">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {hasMore && (
            <button
              type="button"
              onClick={() => setShowCount((c) => c + 50)}
              className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Load more ({filtered.length - showCount} remaining)
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
