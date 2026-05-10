"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease } } };
const stagger = { hidden: {}, visible: { transition: { delayChildren: 0.05, staggerChildren: 0.08 } } };

type AgentStats = {
  agent: string;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  total_cost_eur: number;
  last_run_at: string | null;
  last_task: string | null;
};

type RecentRun = {
  id: string;
  agent: string;
  task_name: string;
  status: string;
  cost_eur: number;
  product_slug: string | null;
  created_at: string;
};

const BUILD_PIPELINE = [
  { key: "Architect", label: "Architect", icon: "auto_awesome", color: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/30", role: "Idea generation & validation" },
  { key: "Build Orchestrator", label: "Orchestrator", icon: "rocket_launch", color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/30", role: "11-step build pipeline" },
  { key: "Implementer", label: "Implementer", icon: "code", color: "from-cyan-500 to-blue-600", shadow: "shadow-cyan-500/30", role: "Template extension code" },
  { key: "Reviewer", label: "Reviewer", icon: "rate_review", color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/30", role: "Quality & pattern flagging" },
  { key: "QA Agent", label: "QA", icon: "bug_report", color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/30", role: "Integration test suite" },
  { key: "Operations Agent", label: "Operations", icon: "support_agent", color: "from-slate-500 to-slate-600", shadow: "shadow-slate-500/30", role: "Knowledge base & support" },
  { key: "Release Agent", label: "Release", icon: "publish", color: "from-green-500 to-emerald-600", shadow: "shadow-green-500/30", role: "DNS cutover & go-live" },
];

const OUTREACH_PIPELINE = [
  { key: "Core Message Agent", label: "Core Message", icon: "message", color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/30", role: "Canonical messaging payload" },
  { key: "Meta Ads Agent", label: "Meta Ads", icon: "campaign", color: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/30", role: "Campaign & creative automation" },
  { key: "Content Agent", label: "Content", icon: "article", color: "from-teal-500 to-cyan-600", shadow: "shadow-teal-500/30", role: "SEO articles & keyword research" },
  { key: "Social Agent", label: "Social", icon: "share", color: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/30", role: "LinkedIn/X posts & scheduling" },
  { key: "Lead Sourcing Agent", label: "Lead Sourcing", icon: "person_search", color: "from-lime-500 to-green-600", shadow: "shadow-lime-500/30", role: "Lead consolidation & enrichment" },
  { key: "Personalization Agent", label: "Personalization", icon: "psychology", color: "from-fuchsia-500 to-pink-600", shadow: "shadow-fuchsia-500/30", role: "Per-recipient email personalization" },
  { key: "Community Agent", label: "Community", icon: "forum", color: "from-orange-500 to-amber-600", shadow: "shadow-orange-500/30", role: "Forum & community participation" },
  { key: "Outreach Engine", label: "Approval Queue", icon: "outbound", color: "from-rose-500 to-red-600", shadow: "shadow-rose-500/30", role: "Content review & approval" },
];

function getStats(agentStats: AgentStats[], key: string): AgentStats | null {
  return agentStats.find((a) => a.agent.toLowerCase().includes(key.toLowerCase())) ?? null;
}

type Props = {
  agentStats: AgentStats[];
  recentRuns: RecentRun[];
};

export function AgentsView({ agentStats, recentRuns }: Props) {
  const totalRuns = agentStats.reduce((sum, a) => sum + a.total_runs, 0);
  const totalCost = agentStats.reduce((sum, a) => sum + a.total_cost_eur, 0);
  const activeAgents = agentStats.filter((a) => {
    if (!a.last_run_at) return false;
    return (Date.now() - new Date(a.last_run_at).getTime()) < 86400000;
  }).length;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(139,92,246,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">AI Agents</h1>
          <p className="text-slate-400 mt-1">Your autonomous team — 15 agents connected in two parallel pipelines.</p>
          <div className="flex gap-8 mt-5">
            {[
              { val: `${agentStats.length}`, label: "Deployed", color: "text-white" },
              { val: totalRuns.toLocaleString(), label: "Total runs", color: "text-white" },
              { val: `€${totalCost.toFixed(2)}`, label: "Total cost", color: "text-white" },
              { val: `${activeAgents}`, label: "Active (24h)", color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Build Pipeline */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>rocket_launch</span>
          </div>
          <h2 className="font-bold text-slate-900 text-lg">Build Pipeline</h2>
          <span className="text-xs text-slate-400 ml-1">Idea → Product → Launch</span>
        </div>
        <PipelineRow agents={BUILD_PIPELINE} stats={agentStats} />
      </motion.div>

      {/* Outreach Pipeline */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-violet-600" style={{ fontSize: 18 }}>campaign</span>
          </div>
          <h2 className="font-bold text-slate-900 text-lg">Outreach Pipeline</h2>
          <span className="text-xs text-slate-400 ml-1">Message → Channels → Users</span>
        </div>
        <PipelineRow agents={OUTREACH_PIPELINE} stats={agentStats} />
      </motion.div>

      {/* Recent Activity — collapsible */}
      <LiveActivity recentRuns={recentRuns} />
    </motion.div>
  );
}

function PipelineRow({ agents, stats }: { agents: typeof BUILD_PIPELINE; stats: AgentStats[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
      <div className="flex items-center gap-0 min-w-max">
        {agents.map((agent, i) => {
          const data = getStats(stats, agent.key);
          const isActive = data?.last_run_at && (Date.now() - new Date(data.last_run_at).getTime()) < 86400000;
          const hasRuns = data && data.total_runs > 0;
          const successRate = data && data.total_runs > 0 ? Math.round((data.successful_runs / data.total_runs) * 100) : 0;

          return (
            <div key={agent.key} className="flex items-center">
              {/* Agent card */}
              <motion.div
                variants={scaleIn}
                whileHover={{ y: -6, scale: 1.03, transition: { duration: 0.2 } }}
                className={`w-40 rounded-2xl border-2 p-4 transition-all cursor-default ${
                  isActive
                    ? "border-blue-200 bg-blue-50/30 shadow-md"
                    : hasRuns
                      ? "border-slate-200 bg-white shadow-sm hover:shadow-lg hover:border-slate-300"
                      : "border-dashed border-slate-200 bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    whileHover={{ rotate: -8, scale: 1.12 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-lg ${agent.shadow} ${!hasRuns ? "opacity-40" : ""}`}
                  >
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>{agent.icon}</span>
                  </motion.div>
                  {isActive && (
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2.5 h-2.5 rounded-full bg-emerald-400"
                    />
                  )}
                </div>
                <h3 className={`font-bold text-sm ${hasRuns ? "text-slate-900" : "text-slate-400"}`}>{agent.label}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{agent.role}</p>
                {hasRuns ? (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">{data.total_runs} runs</span>
                      <span className="text-slate-400">€{data.total_cost_eur.toFixed(2)}</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${successRate === 100 ? "bg-emerald-400" : successRate > 80 ? "bg-blue-400" : "bg-amber-400"}`} style={{ width: `${successRate}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-300">{successRate}% success</div>
                  </div>
                ) : (
                  <div className="mt-3 text-[10px] text-slate-300 italic">Not yet active</div>
                )}
              </motion.div>

              {/* Connector arrow */}
              {i < agents.length - 1 && (
                <div className="flex items-center px-1 flex-none">
                  <motion.div
                    animate={{ x: [0, 4, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                    className="flex items-center"
                  >
                    <div className="w-4 h-[2px] bg-slate-300 rounded-full" />
                    <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 16 }}>chevron_right</span>
                  </motion.div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveActivity({ recentRuns }: { recentRuns: RecentRun[] }) {
  const [open, setOpen] = useState(true);

  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <motion.span
              animate={recentRuns.length > 0 ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="material-symbols-outlined text-emerald-600"
              style={{ fontSize: 18 }}
            >
              radio_button_checked
            </motion.span>
          </div>
          <div className="text-left">
            <h2 className="font-bold text-slate-900">Live Activity</h2>
            <p className="text-xs text-slate-400">{recentRuns.length} recent agent runs</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/audit"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 text-xs font-semibold hover:text-blue-700 hidden sm:block"
          >
            Full audit trail
          </Link>
          <motion.span
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="material-symbols-outlined text-slate-400"
            style={{ fontSize: 20 }}
          >
            chevron_right
          </motion.span>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 divide-y divide-slate-50">
              {recentRuns.slice(0, 15).map((run, i) => {
                const agent = [...BUILD_PIPELINE, ...OUTREACH_PIPELINE].find((a) =>
                  run.agent.toLowerCase().includes(a.key.toLowerCase())
                );
                const isOk = run.status === "ok" || run.status === "success";
                return (
                  <motion.div
                    key={run.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="px-6 py-3 flex items-center gap-4 hover:bg-blue-50/30 hover:translate-x-1 transition-all duration-200"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agent?.color ?? "from-slate-400 to-slate-500"} flex items-center justify-center flex-none shadow-sm`}>
                      <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>{agent?.icon ?? "smart_toy"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-slate-900">{run.agent}</span>
                      <span className="text-xs text-slate-400 font-mono ml-2">{run.task_name.replace(/_/g, " ")}</span>
                      {run.product_slug && <span className="text-xs text-slate-400 font-mono ml-2">· {run.product_slug}</span>}
                    </div>
                    <span className={`w-1.5 h-1.5 rounded-full flex-none ${isOk ? "bg-emerald-400" : "bg-red-400"}`} />
                    <span className="text-xs text-slate-400 font-mono flex-none">€{run.cost_eur.toFixed(4)}</span>
                    <span className="text-xs text-slate-300 flex-none">{run.created_at.slice(11, 16)}</span>
                  </motion.div>
                );
              })}
              {recentRuns.length === 0 && (
                <div className="px-6 py-10 text-center text-slate-400 text-sm">No activity yet. Generate ideas or dispatch a build to see agents in action.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
