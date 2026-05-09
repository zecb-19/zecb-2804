"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import type { SystemStats, UserListRow } from "@/lib/admin/queries";

import { fadeUp, fadeUpSm, scaleIn, stagger } from "./motion";

type Props = {
  stats: SystemStats;
  users: UserListRow[];
};

export function AdminView({ stats, users }: Props) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.company ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.08)}
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-slate-900">Admin Backoffice</h1>
        <p className="text-slate-500 mt-1.5 max-w-3xl">
          Platform-level system overview. User management, DB health, and
          cross-operator metrics.
        </p>
      </motion.div>

      {/* System stats */}
      <motion.div
        variants={stagger(0.04, 0.05)}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        <StatCard label="Users" value={String(stats.total_users)} icon="group" />
        <StatCard label="Products" value={`${stats.live_products} / ${stats.total_products}`} icon="inventory_2" />
        <StatCard label="Agent runs" value={String(stats.total_agent_runs)} icon="smart_toy" />
        <StatCard label="Total cost" value={fmtEur(stats.total_cost_eur)} icon="payments" />
        <StatCard label="Templates" value={String(stats.total_templates)} icon="dashboard_customize" />
        <StatCard label="Patterns" value={String(stats.total_patterns)} icon="extension" />
        <StatCard label="Ideas" value={String(stats.total_ideas)} icon="lightbulb" />
        <StatCard label="Unsubscribes" value={String(stats.total_unsubscribes)} icon="unsubscribe" />
        <StatCard label="Consent log" value={String(stats.total_consent_entries)} icon="cookie" />
        <StatCard label="DB tables" value="15" icon="database" />
      </motion.div>

      {/* User list */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 22 }}>
              manage_accounts
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Users</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
              {users.length}
            </span>
          </div>
          <div className="relative max-w-xs">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              style={{ fontSize: 18 }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-xs font-semibold text-slate-500 pb-2 pr-4">Name</th>
                <th className="text-xs font-semibold text-slate-500 pb-2 pr-4">Email</th>
                <th className="text-xs font-semibold text-slate-500 pb-2 pr-4">Company</th>
                <th className="text-xs font-semibold text-slate-500 pb-2 pr-4">Plan</th>
                <th className="text-xs font-semibold text-slate-500 pb-2 pr-4">Products</th>
                <th className="text-xs font-semibold text-slate-500 pb-2">Last login</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <motion.tr
                  key={u.id}
                  variants={fadeUpSm}
                  className="border-b border-slate-200 last:border-0"
                >
                  <td className="py-2.5 pr-4 text-sm text-slate-900 font-medium">{u.name}</td>
                  <td className="py-2.5 pr-4 text-sm text-slate-500">{u.email}</td>
                  <td className="py-2.5 pr-4 text-sm text-slate-500">{u.company ?? "—"}</td>
                  <td className="py-2.5 pr-4">
                    <span className={
                      "px-2 py-0.5 rounded-full text-xs font-semibold capitalize " +
                      (u.subscription_status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-500")
                    }>
                      {u.subscription_tier ?? u.subscription_status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-sm text-slate-900 tabular-nums">{u.products_count}</td>
                  <td className="py-2.5 text-xs text-slate-500">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "Never"}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <motion.div variants={scaleIn} className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>{icon}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className="font-display text-xl font-bold text-slate-900 leading-none">{value}</div>
    </motion.div>
  );
}

function fmtEur(n: number): string {
  if (n === 0) return "€0";
  if (n < 1) return `€${n.toFixed(4)}`;
  return `€${n.toFixed(2)}`;
}
