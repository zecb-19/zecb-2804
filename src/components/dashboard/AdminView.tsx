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
        <h1 className="font-h1 text-h1 text-primary">Admin Backoffice</h1>
        <p className="text-on-surface-variant mt-1.5 max-w-3xl">
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
      <motion.div variants={fadeUp} className="bg-white rounded-xl border border-surface-variant p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 22 }}>
              manage_accounts
            </span>
            <h2 className="font-h3 text-h3 text-on-surface">Users</h2>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-label-sm font-semibold">
              {users.length}
            </span>
          </div>
          <div className="relative max-w-xs">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              style={{ fontSize: 18 }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-variant text-body-md bg-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-variant">
                <th className="text-label-sm font-semibold text-on-surface-variant pb-2 pr-4">Name</th>
                <th className="text-label-sm font-semibold text-on-surface-variant pb-2 pr-4">Email</th>
                <th className="text-label-sm font-semibold text-on-surface-variant pb-2 pr-4">Company</th>
                <th className="text-label-sm font-semibold text-on-surface-variant pb-2 pr-4">Plan</th>
                <th className="text-label-sm font-semibold text-on-surface-variant pb-2 pr-4">Products</th>
                <th className="text-label-sm font-semibold text-on-surface-variant pb-2">Last login</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <motion.tr
                  key={u.id}
                  variants={fadeUpSm}
                  className="border-b border-surface-variant last:border-0"
                >
                  <td className="py-2.5 pr-4 text-body-md text-on-surface font-medium">{u.name}</td>
                  <td className="py-2.5 pr-4 text-body-md text-on-surface-variant">{u.email}</td>
                  <td className="py-2.5 pr-4 text-body-md text-on-surface-variant">{u.company ?? "—"}</td>
                  <td className="py-2.5 pr-4">
                    <span className={
                      "px-2 py-0.5 rounded-full text-label-sm font-semibold capitalize " +
                      (u.subscription_status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-surface-container text-on-surface-variant")
                    }>
                      {u.subscription_tier ?? u.subscription_status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-body-md text-on-surface tabular-nums">{u.products_count}</td>
                  <td className="py-2.5 text-label-sm text-on-surface-variant">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "Never"}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">
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
    <motion.div variants={scaleIn} className="bg-white rounded-xl border border-surface-variant p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>{icon}</span>
        <span className="text-label-sm text-on-surface-variant">{label}</span>
      </div>
      <div className="font-display text-xl font-bold text-primary leading-none">{value}</div>
    </motion.div>
  );
}

function fmtEur(n: number): string {
  if (n === 0) return "€0";
  if (n < 1) return `€${n.toFixed(4)}`;
  return `€${n.toFixed(2)}`;
}
