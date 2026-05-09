"use client";

import { useActionState, useState } from "react";

import {
  createRuleAction,
  toggleRuleAction,
  type RuleActionState,
} from "@/app/actions/tenant-rules";
import type { AlertRuleRow, DataSourceRow } from "@/lib/monitoring/queries";

const CONDITION_TYPES = [
  { value: "threshold", label: "Threshold", description: "Trigger when value crosses a limit" },
  { value: "change_rate", label: "Change Rate", description: "Trigger on percentage change" },
  { value: "absence", label: "Absence", description: "Trigger when no data arrives" },
  { value: "presence", label: "Presence", description: "Trigger when a field appears" },
  { value: "regex_match", label: "Regex Match", description: "Trigger on pattern match" },
  { value: "statistical_anomaly", label: "Statistical Anomaly", description: "Trigger on z-score deviation" },
  { value: "deadline_approaching", label: "Deadline Approaching", description: "Trigger before a date" },
];

const OPERATORS = [
  { value: "gt", label: ">" },
  { value: "lt", label: "<" },
  { value: "gte", label: ">=" },
  { value: "lte", label: "<=" },
  { value: "eq", label: "=" },
  { value: "neq", label: "!=" },
];

type Props = {
  rules: AlertRuleRow[];
  sources: DataSourceRow[];
  slug: string;
};

export function RulesView({ rules, sources, slug }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [createState, createAction, createPending] = useActionState(
    createRuleAction, undefined as RuleActionState,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alert Rules</h1>
          <p className="text-slate-500 mt-1">
            Define conditions that trigger notifications when your data changes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          New Rule
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-500/30 p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Alert Rule</h2>
          <form action={createAction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Rule Name</label>
                <input name="name" required className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g., Price spike alert" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Data Source</label>
                <select name="data_source_id" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                  <option value="">All sources</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.kind})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Condition Type</label>
                <select name="condition_type" required className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                  {CONDITION_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Field</label>
                <input name="field" required className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g., price_eur" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Operator</label>
                <select name="operator" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>{op.label} ({op.value})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Value</label>
                <input name="value" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g., 100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Throttle (minutes)</label>
                <input name="throttle_minutes" type="number" defaultValue={60} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Notify via</label>
              <div className="flex flex-wrap gap-3">
                {["email", "slack", "webhook", "in_app"].map((ch) => (
                  <label key={ch} className="flex items-center gap-1.5">
                    <input type="checkbox" name="channels" value={ch} defaultChecked={ch === "email"} className="accent-slate-900" />
                    <span className="text-sm text-slate-900 capitalize">{ch.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={createPending} className="px-4 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors disabled:opacity-60">
                {createPending ? "Creating..." : "Create Rule"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:underline text-sm">
                Cancel
              </button>
              {createState?.ok && <span className="text-emerald-600 text-sm">Rule created!</span>}
              {createState && !createState.ok && <span className="text-red-500 text-xs">{createState.message}</span>}
            </div>
          </form>
        </div>
      )}

      {/* Rules list */}
      {rules.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 40 }}>rule</span>
          <h3 className="text-lg font-semibold text-slate-900 mt-3">No alert rules yet</h3>
          <p className="text-slate-500 mt-1 text-sm">Create your first rule to start getting notified when your data changes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </div>
      )}
    </div>
  );
}

function RuleCard({ rule }: { rule: AlertRuleRow }) {
  const [, toggleAction, togglePending] = useActionState(toggleRuleAction, undefined as RuleActionState);

  return (
    <div className={"bg-white rounded-xl border p-4 " + (rule.enabled ? "border-slate-200" : "border-slate-200 opacity-60")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-slate-900">{rule.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs">
              {rule.condition_type.replace(/_/g, " ")}
            </span>
            {rule.data_source_name && (
              <span className="text-xs text-slate-500">on {rule.data_source_name}</span>
            )}
            <span className={
              "px-2 py-0.5 rounded-full text-xs font-semibold " +
              (rule.enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500")
            }>
              {rule.enabled ? "Active" : "Disabled"}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Field: <span className="font-mono">{(rule.condition_config as Record<string, unknown>).field as string}</span>
            {" · "}Throttle: {rule.throttle_minutes}min
            {" · "}Channels: {rule.notify_channels.join(", ")}
            {rule.last_triggered_at && (
              <> · Last triggered: {new Date(rule.last_triggered_at).toISOString().slice(0, 10)}</>
            )}
          </div>
        </div>
        <form action={toggleAction}>
          <input type="hidden" name="rule_id" value={rule.id} />
          <button type="submit" disabled={togglePending} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-60">
            {rule.enabled ? "Disable" : "Enable"}
          </button>
        </form>
      </div>
    </div>
  );
}
