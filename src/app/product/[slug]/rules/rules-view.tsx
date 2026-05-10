"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useState } from "react";

import {
  createRuleAction,
  toggleRuleAction,
  type RuleActionState,
} from "@/app/actions/tenant-rules";
import type { AlertRuleRow, DataSourceRow } from "@/lib/monitoring/queries";

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } };
const stagger = (d = 0.05, s = 0.06) => ({ hidden: {}, visible: { transition: { delayChildren: d, staggerChildren: s } } });
const cardSpring = { type: "spring" as const, stiffness: 300, damping: 20 };

const inputCls = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors";
const labelCls = "text-sm font-medium text-slate-700 mb-1.5 block";

const CONDITION_TYPES = [
  { value: "threshold", label: "Threshold", icon: "straighten", color: "from-blue-500 to-indigo-600" },
  { value: "change_rate", label: "Change Rate", icon: "trending_up", color: "from-violet-500 to-purple-600" },
  { value: "absence", label: "Absence", icon: "visibility_off", color: "from-amber-500 to-orange-600" },
  { value: "presence", label: "Presence", icon: "visibility", color: "from-emerald-500 to-teal-600" },
  { value: "regex_match", label: "Regex", icon: "code", color: "from-cyan-500 to-blue-600" },
  { value: "statistical_anomaly", label: "Anomaly", icon: "query_stats", color: "from-rose-500 to-pink-600" },
  { value: "deadline_approaching", label: "Deadline", icon: "event", color: "from-orange-500 to-red-600" },
];

const OPERATORS = [
  { value: "gt", label: ">" }, { value: "lt", label: "<" }, { value: "gte", label: ">=" },
  { value: "lte", label: "<=" }, { value: "eq", label: "=" }, { value: "neq", label: "!=" },
];

type Props = { rules: AlertRuleRow[]; sources: DataSourceRow[]; slug: string };

export function RulesView({ rules, sources, slug }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [condType, setCondType] = useState("threshold");
  const [createState, createAction, createPending] = useActionState(createRuleAction, undefined as RuleActionState);

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger()} className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alert Rules</h1>
          <p className="text-slate-500 mt-1">Define conditions that trigger notifications.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors inline-flex items-center gap-2">
          <motion.span animate={{ rotate: showForm ? 45 : 0 }} transition={{ duration: 0.2 }} className="material-symbols-outlined" style={{ fontSize: 18 }}>add</motion.span>
          {showForm ? "Cancel" : "New Rule"}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0, scale: 0.98 }} animate={{ opacity: 1, height: "auto", scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.98 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>tune</span>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Create Alert Rule</h2>
                  <p className="text-sm text-slate-500">Choose a condition type and configure the trigger</p>
                </div>
              </div>

              {/* Condition type selector */}
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mb-5">
                {CONDITION_TYPES.map((ct) => (
                  <button key={ct.value} type="button" onClick={() => setCondType(ct.value)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all text-center ${
                      condType === ct.value ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}>
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${ct.color} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-white" style={{ fontSize: 14 }}>{ct.icon}</span>
                    </div>
                    <span className={`text-[10px] font-medium leading-tight ${condType === ct.value ? "text-blue-700" : "text-slate-500"}`}>{ct.label}</span>
                  </button>
                ))}
              </div>

              <form action={createAction} className="space-y-4">
                <input type="hidden" name="condition_type" value={condType} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Rule Name</label><input name="name" required placeholder="e.g., Price spike alert" className={inputCls} /></div>
                  <div><label className={labelCls}>Data Source</label>
                    <select name="data_source_id" className={inputCls}>
                      <option value="">All sources</option>
                      {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className={labelCls}>Field</label><input name="field" required placeholder="e.g., price_eur" className={`${inputCls} font-mono`} /></div>
                  <div><label className={labelCls}>Operator</label>
                    <select name="operator" className={inputCls}>{OPERATORS.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}</select>
                  </div>
                  <div><label className={labelCls}>Value</label><input name="value" placeholder="e.g., 100" className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Throttle (minutes)</label><input name="throttle_minutes" type="number" defaultValue={60} className={inputCls} /><p className="text-xs text-slate-400 mt-1">Min. time between alerts</p></div>
                  <div>
                    <label className={labelCls}>Notify via</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {["email", "slack", "webhook", "in_app"].map((ch) => (
                        <label key={ch} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                          <input type="checkbox" name="channels" value={ch} defaultChecked={ch === "email"} className="accent-slate-900 rounded" />
                          <span className="text-sm text-slate-700 capitalize">{ch.replace("_", " ")}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {createState?.ok && <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-2"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>Rule created!</div>}
                {createState && !createState.ok && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{createState.message}</div>}

                <button type="submit" disabled={createPending}
                  className="px-5 py-3 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 text-white font-semibold text-sm shadow-lg shadow-slate-900/20 hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 transition-all inline-flex items-center gap-2">
                  {createPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>Create Rule</>}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {rules.length === 0 ? (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 32 }}>tune</span>
          </div>
          <h3 className="font-bold text-slate-900 mt-5 text-lg">No alert rules yet</h3>
          <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">Create your first rule to start getting notified when your data changes.</p>
          {!showForm && <button type="button" onClick={() => setShowForm(true)} className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors inline-flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>Create your first rule
          </button>}
        </motion.div>
      ) : (
        <motion.div variants={stagger(0.05, 0.08)} className="space-y-3">
          {rules.map((rule) => (
            <motion.div key={rule.id} variants={fadeUp} whileHover={{ y: -2, transition: { duration: 0.2 } }}><RuleCard rule={rule} /></motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function RuleCard({ rule }: { rule: AlertRuleRow }) {
  const [, toggleAction, togglePending] = useActionState(toggleRuleAction, undefined as RuleActionState);
  const ct = CONDITION_TYPES.find((c) => c.value === rule.condition_type);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-slate-300 transition-all ${!rule.enabled ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ct?.color ?? "from-slate-400 to-slate-500"} flex items-center justify-center flex-none shadow-sm`}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>{ct?.icon ?? "tune"}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900">{rule.name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{rule.condition_type.replace(/_/g, " ")}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${rule.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${rule.enabled ? "bg-emerald-400" : "bg-slate-400"}`} />
                {rule.enabled ? "Active" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
              <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>data_object</span><span className="font-mono">{(rule.condition_config as Record<string, unknown>).field as string}</span></span>
              <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>timer</span>{rule.throttle_minutes}min throttle</span>
              <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>notifications</span>{rule.notify_channels.join(", ")}</span>
              {rule.data_source_name && <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>database</span>{rule.data_source_name}</span>}
              {rule.last_triggered_at && <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>Last: {new Date(rule.last_triggered_at).toISOString().slice(0, 10)}</span>}
            </div>
          </div>
        </div>
        <form action={toggleAction}>
          <input type="hidden" name="rule_id" value={rule.id} />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={togglePending}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ${rule.enabled ? "border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"}`}>
            {rule.enabled ? "Disable" : "Enable"}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
