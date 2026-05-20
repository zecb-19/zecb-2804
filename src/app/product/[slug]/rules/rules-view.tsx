"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useState } from "react";

import {
  createRuleAction,
  toggleRuleAction,
  deleteRuleAction,
  updateRuleAction,
  testRuleAction,
  type RuleActionState,
} from "@/app/actions/tenant-rules";
import type { AlertRuleRow, DataSourceRow } from "@/lib/monitoring/queries";

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } };
const stagger = (d = 0.05, s = 0.06) => ({ hidden: {}, visible: { transition: { delayChildren: d, staggerChildren: s } } });

const inputCls = "w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors";
const labelCls = "text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block";

const CONDITION_TYPES = [
  { value: "threshold", label: "Threshold", icon: "straighten", color: "from-blue-500 to-indigo-600", desc: "Value exceeds a limit" },
  { value: "change_rate", label: "Change Rate", icon: "trending_up", color: "from-violet-500 to-purple-600", desc: "Value changes by %" },
  { value: "absence", label: "Absence", icon: "visibility_off", color: "from-amber-500 to-orange-600", desc: "No data received" },
  { value: "presence", label: "Presence", icon: "visibility", color: "from-emerald-500 to-teal-600", desc: "New data appears" },
  { value: "regex_match", label: "Regex", icon: "code", color: "from-cyan-500 to-blue-600", desc: "Pattern match in text" },
  { value: "statistical_anomaly", label: "Anomaly", icon: "query_stats", color: "from-rose-500 to-pink-600", desc: "Statistical outlier" },
  { value: "deadline_approaching", label: "Deadline", icon: "event", color: "from-orange-500 to-red-600", desc: "Date approaching" },
];

const OPERATORS = [
  { value: "gt", label: ">" }, { value: "lt", label: "<" }, { value: "gte", label: ">=" },
  { value: "lte", label: "<=" }, { value: "eq", label: "=" }, { value: "neq", label: "!=" },
];

type Props = { rules: AlertRuleRow[]; sources: DataSourceRow[]; slug: string };

export function RulesView({ rules, sources, slug }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [condType, setCondType] = useState("threshold");
  const [createState, createAction, createPending] = useActionState(createRuleAction, undefined as RuleActionState);

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger()} className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Alert Rules</h1>
          <p className="text-sm text-slate-500 mt-0.5">{rules.length} rule{rules.length !== 1 ? "s" : ""} configured</p>
        </div>
        <button type="button" onClick={() => { setShowForm((v) => !v); setEditingId(null); }}
          className="px-3.5 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{showForm ? "close" : "add"}</span>
          {showForm ? "Cancel" : "New Rule"}
        </button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease }} className="overflow-hidden">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4">New Alert Rule</h2>

              {/* Condition type selector */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {CONDITION_TYPES.map((ct) => (
                  <button key={ct.value} type="button" onClick={() => setCondType(ct.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${condType === ct.value ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{ct.icon}</span>
                    {ct.label}
                  </button>
                ))}
              </div>

              <form action={createAction} className="space-y-4">
                <input type="hidden" name="condition_type" value={condType} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className={labelCls}>Rule Name</label><input name="name" required placeholder="e.g., Price spike alert" className={inputCls} /></div>
                  <div><label className={labelCls}>Data Source</label>
                    <select name="data_source_id" className={inputCls}>
                      <option value="">All sources</option>
                      {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Condition-specific fields */}
                <ConditionFields condType={condType} config={{}} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className={labelCls}>Throttle (minutes)</label><input name="throttle_minutes" type="number" defaultValue={60} className={inputCls} /></div>
                  <div>
                    <label className={labelCls}>Notify via</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {["email", "slack", "webhook", "in_app"].map((ch) => (
                        <label key={ch} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors text-xs">
                          <input type="checkbox" name="channels" value={ch} defaultChecked={ch === "email"} className="accent-slate-900 rounded" />
                          <span className="text-slate-700 capitalize">{ch.replace("_", "-")}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {createState?.ok && <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium flex items-center gap-1.5"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>Rule created.</div>}
                {createState && !createState.ok && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs">{createState.message}</div>}

                <button type="submit" disabled={createPending}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {createPending ? "Creating..." : "Create Rule"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {rules.length === 0 ? (
        <motion.div variants={fadeUp} className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 28 }}>tune</span>
          </div>
          <h3 className="font-bold text-slate-900 mt-4">No alert rules yet</h3>
          <p className="text-sm text-slate-500 mt-1">Create your first rule to start getting notified.</p>
          {!showForm && <button type="button" onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors inline-flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>Create Rule
          </button>}
        </motion.div>
      ) : (
        <motion.div variants={stagger(0.03, 0.06)} className="space-y-3">
          {rules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} sources={sources} isEditing={editingId === rule.id} onToggleEdit={() => setEditingId(editingId === rule.id ? null : rule.id)} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function ConditionFields({ condType, config }: { condType: string; config: Record<string, unknown> }) {
  if (condType === "threshold") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div><label className={labelCls}>Field</label><input name="field" required defaultValue={String(config.field ?? "")} placeholder="e.g., price_eur" className={`${inputCls} font-mono`} /></div>
        <div><label className={labelCls}>Operator</label>
          <select name="operator" defaultValue={String(config.operator ?? "gt")} className={inputCls}>{OPERATORS.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}</select>
        </div>
        <div><label className={labelCls}>Threshold Value</label><input name="value" defaultValue={String(config.value ?? "")} placeholder="e.g., 100" className={inputCls} /></div>
      </div>
    );
  }
  if (condType === "change_rate") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div><label className={labelCls}>Field</label><input name="field" required defaultValue={String(config.field ?? "")} placeholder="e.g., price_eur" className={`${inputCls} font-mono`} /></div>
        <div><label className={labelCls}>Change Threshold (%)</label><input name="value" type="number" defaultValue={String(config.value ?? "10")} placeholder="10" className={inputCls} /><p className="text-[10px] text-slate-400 mt-1">Alert when change exceeds this %</p></div>
        <div><label className={labelCls}>Direction</label>
          <select name="operator" defaultValue={String(config.operator ?? "gt")} className={inputCls}>
            <option value="gt">Increase above %</option>
            <option value="lt">Decrease below %</option>
            <option value="neq">Any change above %</option>
          </select>
        </div>
      </div>
    );
  }
  if (condType === "absence") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className={labelCls}>Field</label><input name="field" required defaultValue={String(config.field ?? "")} placeholder="e.g., price_eur" className={`${inputCls} font-mono`} /></div>
        <div><label className={labelCls}>Missing After (minutes)</label><input name="value" type="number" defaultValue={String(config.value ?? "60")} placeholder="60" className={inputCls} /><p className="text-[10px] text-slate-400 mt-1">Alert if no data for this long</p></div>
        <input type="hidden" name="operator" value="gt" />
      </div>
    );
  }
  if (condType === "presence") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className={labelCls}>Field</label><input name="field" required defaultValue={String(config.field ?? "")} placeholder="e.g., new_product" className={`${inputCls} font-mono`} /></div>
        <div><label className={labelCls}>Match Value (optional)</label><input name="value" defaultValue={String(config.value ?? "")} placeholder="Leave empty for any value" className={inputCls} /></div>
        <input type="hidden" name="operator" value="eq" />
      </div>
    );
  }
  if (condType === "regex_match") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className={labelCls}>Field</label><input name="field" required defaultValue={String(config.field ?? "")} placeholder="e.g., description" className={`${inputCls} font-mono`} /></div>
        <div><label className={labelCls}>Regex Pattern</label><input name="value" required defaultValue={String(config.value ?? "")} placeholder="e.g., (sold out|unavailable)" className={`${inputCls} font-mono`} /><p className="text-[10px] text-slate-400 mt-1">JavaScript-compatible regex</p></div>
        <input type="hidden" name="operator" value="eq" />
      </div>
    );
  }
  if (condType === "statistical_anomaly") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div><label className={labelCls}>Field</label><input name="field" required defaultValue={String(config.field ?? "")} placeholder="e.g., price_eur" className={`${inputCls} font-mono`} /></div>
        <div><label className={labelCls}>Sigma Threshold</label><input name="value" type="number" step="0.1" defaultValue={String(config.value ?? "2.0")} placeholder="2.0" className={inputCls} /><p className="text-[10px] text-slate-400 mt-1">Standard deviations from mean</p></div>
        <div><label className={labelCls}>Window Size</label><input name="operator" type="number" defaultValue={String(config.operator ?? "30")} placeholder="30" className={inputCls} /><p className="text-[10px] text-slate-400 mt-1">Number of observations to compare</p></div>
      </div>
    );
  }
  if (condType === "deadline_approaching") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className={labelCls}>Date Field</label><input name="field" required defaultValue={String(config.field ?? "")} placeholder="e.g., contract_end_date" className={`${inputCls} font-mono`} /></div>
        <div><label className={labelCls}>Days Before</label><input name="value" type="number" defaultValue={String(config.value ?? "14")} placeholder="14" className={inputCls} /><p className="text-[10px] text-slate-400 mt-1">Alert this many days before deadline</p></div>
        <input type="hidden" name="operator" value="lte" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div><label className={labelCls}>Field</label><input name="field" required defaultValue={String(config.field ?? "")} className={`${inputCls} font-mono`} /></div>
      <div><label className={labelCls}>Operator</label><select name="operator" className={inputCls}>{OPERATORS.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}</select></div>
      <div><label className={labelCls}>Value</label><input name="value" className={inputCls} /></div>
    </div>
  );
}

function RuleCard({ rule, sources, isEditing, onToggleEdit }: { rule: AlertRuleRow; sources: DataSourceRow[]; isEditing: boolean; onToggleEdit: () => void }) {
  const [, toggleAction, togglePending] = useActionState(toggleRuleAction, undefined as RuleActionState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteRuleAction, undefined as RuleActionState);
  const [updateState, updateAction, updatePending] = useActionState(updateRuleAction, undefined as RuleActionState);
  const [testState, testAction, testPending] = useActionState(testRuleAction, undefined as RuleActionState);
  const ct = CONDITION_TYPES.find((c) => c.value === rule.condition_type);
  const cfg = (rule.condition_config ?? {}) as Record<string, unknown>;

  return (
    <motion.div variants={fadeUp} className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${!rule.enabled ? "opacity-60" : ""}`}>
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${ct?.color ?? "from-slate-400 to-slate-500"} flex items-center justify-center flex-none shadow-sm`}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>{ct?.icon ?? "tune"}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-slate-900">{rule.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">{rule.condition_type.replace(/_/g, " ")}</span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rule.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${rule.enabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                {rule.enabled ? "Active" : "Off"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 flex-wrap">
              <span className="font-mono">{String(cfg.field ?? "—")}</span>
              <span>{rule.throttle_minutes}min throttle</span>
              <span>{rule.notify_channels.join(", ")}</span>
              {rule.data_source_name && <span>{rule.data_source_name}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-none">
          <form action={testAction}>
            <input type="hidden" name="rule_id" value={rule.id} />
            <button type="submit" disabled={testPending} title="Test rule" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>bug_report</span>
            </button>
          </form>
          <form action={toggleAction}>
            <input type="hidden" name="rule_id" value={rule.id} />
            <button type="submit" disabled={togglePending} title={rule.enabled ? "Disable" : "Enable"} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{rule.enabled ? "pause" : "play_arrow"}</span>
            </button>
          </form>
          <button type="button" onClick={onToggleEdit} title="Edit" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{isEditing ? "expand_less" : "edit"}</span>
          </button>
          <form action={deleteAction}>
            <input type="hidden" name="rule_id" value={rule.id} />
            <button type="submit" disabled={deletePending} title="Delete" className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
            </button>
          </form>
        </div>
      </div>

      {/* Test result */}
      {testState && (
        <div className={`mx-5 mb-3 px-3 py-2 rounded-lg text-xs font-medium ${testState.ok ? "bg-blue-50 border border-blue-100 text-blue-700" : "bg-red-50 border border-red-100 text-red-700"}`}>
          {"message" in testState ? testState.message : "Done."}
        </div>
      )}

      {/* Edit form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
              {updateState?.ok && <div className="mb-3 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium">Saved.</div>}
              {updateState && !updateState.ok && <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs">{updateState.message}</div>}
              <form action={updateAction} className="space-y-3">
                <input type="hidden" name="rule_id" value={rule.id} />
                <div><label className={labelCls}>Rule Name</label><input name="name" required defaultValue={rule.name} className={inputCls} /></div>
                <ConditionFields condType={rule.condition_type} config={cfg} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className={labelCls}>Throttle (min)</label><input name="throttle_minutes" type="number" defaultValue={rule.throttle_minutes} className={inputCls} /></div>
                  <div>
                    <label className={labelCls}>Channels</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {["email", "slack", "webhook", "in_app"].map((ch) => (
                        <label key={ch} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-white cursor-pointer transition-colors text-xs">
                          <input type="checkbox" name="channels" value={ch} defaultChecked={rule.notify_channels.includes(ch)} className="accent-slate-900 rounded" />
                          <span className="text-slate-700 capitalize">{ch.replace("_", "-")}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={updatePending} className="px-3.5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {updatePending ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={onToggleEdit} className="px-3.5 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-300 transition-colors">
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
}
