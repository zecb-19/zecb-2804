"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useActionState, useState } from "react";

import {
  upgradePlanAction,
  exportAllDataAction,
  deleteAccountAction,
  type AccountActionState,
} from "@/app/actions/tenant-account";

type PricingTier = { name: string; price_eur_monthly: number; limits: Record<string, number> };

type Props = {
  slug: string;
  email: string;
  name: string;
  plan: string;
  channels: string[];
  createdAt: string;
  pricingTiers: PricingTier[];
};

type SaveState = { ok: true } | { ok: false; message: string } | undefined;

const CHANNELS = [
  { value: "email", icon: "mail", label: "Email", desc: "Receive alerts in your inbox", color: "from-blue-500 to-indigo-600" },
  { value: "slack", icon: "chat", label: "Slack", desc: "Post to a Slack channel", color: "from-purple-500 to-violet-600" },
  { value: "webhook", icon: "webhook", label: "Webhook", desc: "POST to a custom URL", color: "from-cyan-500 to-blue-600" },
  { value: "sms", icon: "sms", label: "SMS", desc: "Text message alerts", color: "from-emerald-500 to-teal-600" },
  { value: "in_app", icon: "notifications", label: "In-App", desc: "Show in dashboard", color: "from-amber-500 to-orange-600" },
];

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
const stagger = { hidden: {}, visible: { transition: { delayChildren: 0.05, staggerChildren: 0.08 } } };

async function saveChannelsAction(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const channels = formData.getAll("channels") as string[];
  const res = await fetch("/api/tenant/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notify_channels: channels }),
  });
  if (!res.ok) return { ok: false, message: "Failed to save." };
  return { ok: true };
}

export function SettingsClient({ slug, email, name, plan, channels, createdAt, pricingTiers }: Props) {
  const [state, action, pending] = useActionState(saveChannelsAction, undefined as SaveState);
  const [upgradeState, upgradeAction, upgradePending] = useActionState(upgradePlanAction, undefined as AccountActionState);
  const [exportState, exportAction, exportPending] = useActionState(exportAllDataAction, undefined as AccountActionState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAccountAction, undefined as AccountActionState);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentTier = pricingTiers.find((t) => t.name.toLowerCase() === (upgradeState?.ok ? "upgraded" : plan).toLowerCase()) ?? pricingTiers.find((t) => t.name.toLowerCase() === plan.toLowerCase());
  const activePlan = upgradeState?.ok ? upgradeState.message.replace("Upgraded to ", "").replace("!", "").toLowerCase() : plan.toLowerCase();
  const initials = name.split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  function handleExportResult() {
    if (exportState?.ok && exportState.data) {
      const blob = new Blob([exportState.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-full-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-3xl mx-auto">
      {/* Profile banner */}
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.08),transparent_50%)]" />
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-blue-500/30">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{name}</h1>
            <p className="text-slate-400 mt-0.5">{email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold capitalize border border-white/10">{plan} Plan</span>
              <span className="text-xs text-slate-500">Member since {new Date(createdAt).toISOString().slice(0, 10)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plan & Pricing */}
      {pricingTiers.length > 0 && (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>workspace_premium</span>
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Your Plan</h2>
                <p className="text-sm text-slate-500">
                  Currently on <span className="font-semibold text-slate-900 capitalize">{plan}</span>
                  {currentTier && <> — €{currentTier.price_eur_monthly}/mo</>}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {pricingTiers.map((tier, i) => {
                const isCurrent = tier.name.toLowerCase() === activePlan;
                const isUpgrade = tier.price_eur_monthly > (currentTier?.price_eur_monthly ?? 0);
                const colors = [
                  { bg: "bg-slate-50", border: "border-slate-200", accent: "text-slate-600" },
                  { bg: "bg-blue-50/50", border: "border-blue-200", accent: "text-blue-600" },
                  { bg: "bg-violet-50/50", border: "border-violet-200", accent: "text-violet-600" },
                ][i] ?? { bg: "bg-slate-50", border: "border-slate-200", accent: "text-slate-600" };

                return (
                  <motion.div
                    key={tier.name}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className={`rounded-2xl border-2 p-5 transition-all relative ${
                      isCurrent
                        ? `${colors.border} ${colors.bg} ring-2 ring-blue-500/20`
                        : "border-slate-200 card-hover glow-violet"
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold shadow-lg shadow-blue-500/30">
                        CURRENT
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 text-lg">{tier.name}</h3>
                    <div className="mt-2 mb-4">
                      <span className="text-3xl font-bold text-slate-900">€{tier.price_eur_monthly}</span>
                      <span className="text-sm text-slate-400">/mo</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {tier.limits.max_data_sources !== undefined && (
                        <li className="flex items-center gap-2 text-slate-600">
                          <span className={`material-symbols-outlined ${colors.accent}`} style={{ fontSize: 16 }}>database</span>
                          <span><span className="font-semibold">{tier.limits.max_data_sources}</span> sources</span>
                        </li>
                      )}
                      {tier.limits.max_alert_rules !== undefined && (
                        <li className="flex items-center gap-2 text-slate-600">
                          <span className={`material-symbols-outlined ${colors.accent}`} style={{ fontSize: 16 }}>tune</span>
                          <span><span className="font-semibold">{tier.limits.max_alert_rules}</span> rules</span>
                        </li>
                      )}
                      {tier.limits.check_frequency_minutes !== undefined && (
                        <li className="flex items-center gap-2 text-slate-600">
                          <span className={`material-symbols-outlined ${colors.accent}`} style={{ fontSize: 16 }}>timer</span>
                          Every <span className="font-semibold">{tier.limits.check_frequency_minutes >= 60 ? `${tier.limits.check_frequency_minutes / 60}h` : `${tier.limits.check_frequency_minutes}min`}</span>
                        </li>
                      )}
                      {tier.limits.history_retention_days !== undefined && (
                        <li className="flex items-center gap-2 text-slate-600">
                          <span className={`material-symbols-outlined ${colors.accent}`} style={{ fontSize: 16 }}>history</span>
                          <span><span className="font-semibold">{tier.limits.history_retention_days}</span> days</span>
                        </li>
                      )}
                      {tier.limits.team_members !== undefined && (
                        <li className="flex items-center gap-2 text-slate-600">
                          <span className={`material-symbols-outlined ${colors.accent}`} style={{ fontSize: 16 }}>group</span>
                          <span><span className="font-semibold">{tier.limits.team_members}</span> members</span>
                        </li>
                      )}
                    </ul>
                    {!isCurrent && isUpgrade && (
                      <form action={upgradeAction}>
                        <input type="hidden" name="tier_name" value={tier.name} />
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={upgradePending}
                          className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/20 hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 transition-all">
                          {upgradePending ? "Upgrading..." : `Upgrade to ${tier.name}`}
                        </motion.button>
                      </form>
                    )}
                    {upgradeState?.ok && isCurrent && (
                      <div className="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>{upgradeState.message}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications */}
      <motion.div variants={fadeUp}>
        <form action={action} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>notifications</span>
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Notification Channels</h2>
                <p className="text-sm text-slate-500">Choose how alerts are delivered to you</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-2">
            {CHANNELS.map((ch) => {
              const isChecked = channels.includes(ch.value);
              return (
                <label key={ch.value} className={`flex items-center justify-between px-4 py-4 rounded-xl border-2 cursor-pointer transition-all group ${
                  isChecked ? "border-blue-200 bg-blue-50/30" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                      <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>{ch.icon}</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{ch.label}</div>
                      <div className="text-xs text-slate-500">{ch.desc}</div>
                    </div>
                  </div>
                  <div className="relative">
                    <input type="checkbox" name="channels" value={ch.value} defaultChecked={isChecked}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-blue-500 transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform" />
                  </div>
                </label>
              );
            })}
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={pending}
              className="px-6 py-3 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 text-white font-semibold text-sm shadow-lg shadow-slate-900/20 hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 transition-all inline-flex items-center gap-2">
              {pending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>Save preferences</>}
            </motion.button>
            <AnimatePresence>
              {state?.ok && (
                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-emerald-600 text-sm flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>Saved!
                </motion.span>
              )}
            </AnimatePresence>
            {state && !state.ok && <span className="text-red-500 text-xs">{state.message}</span>}
          </div>
        </form>
      </motion.div>

      {/* Data Management */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>storage</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Data Management</h2>
              <p className="text-sm text-slate-500">Export or manage your data</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <form action={(formData) => { exportAction(formData); setTimeout(handleExportResult, 500); }}>
              <motion.button whileHover={{ y: -2, transition: { duration: 0.15 } }} type="submit" disabled={exportPending}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left group disabled:opacity-50">
                <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  {exportPending
                    ? <span className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                    : <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 22 }}>download</span>}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{exportPending ? "Exporting..." : "Export All Data"}</div>
                  <div className="text-xs text-slate-500">Observations, alerts, and rules as CSV</div>
                </div>
              </motion.button>
            </form>
            <motion.button whileHover={{ y: -2, transition: { duration: 0.15 } }} type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-all text-left group">
              <div className="w-10 h-10 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-red-500" style={{ fontSize: 22 }}>delete_forever</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-red-600">Delete Account</div>
                <div className="text-xs text-red-400">Permanently remove all your data</div>
              </div>
            </motion.button>
          </div>

          {exportState?.ok && (
            <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>{exportState.message}
            </div>
          )}
          {exportState && !exportState.ok && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{exportState.message}</div>
          )}

          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
                  <p className="text-sm text-red-700 font-medium mb-3">This will permanently delete all your data sources, observations, alerts, rules, and your account. This cannot be undone.</p>
                  <form action={deleteAction} className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-red-600 mb-1 block">Type DELETE to confirm</label>
                      <input name="confirmation" type="text" required placeholder="DELETE" className="w-full px-3 py-2 rounded-lg border border-red-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white" />
                    </div>
                    <button type="submit" disabled={deletePending}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex-none">
                      {deletePending ? "Deleting..." : "Delete Forever"}
                    </button>
                    <button type="button" onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-colors flex-none">
                      Cancel
                    </button>
                  </form>
                  {deleteState && !deleteState.ok && (
                    <p className="text-red-600 text-xs mt-2">{deleteState.message}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
