"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { tenantSignoutAction } from "@/app/actions/tenant-auth";
import { ThemeToggle } from "@/lib/theme/ThemeContext";

const PILL_ID = "tenant-nav-pill";
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const NAV_MAIN = [
  { key: "dashboard", label: "Overview", icon: "grid_view" },
  { key: "sources", label: "Data Sources", icon: "sensors" },
  { key: "rules", label: "Alert Rules", icon: "tune" },
  { key: "timeline", label: "Timeline", icon: "stream" },
  { key: "alerts", label: "Alerts", icon: "notifications" },
  { key: "reports", label: "Reports", icon: "summarize" },
] as const;

const NAV_SYSTEM = [
  { key: "notifications", label: "Channels", icon: "campaign" },
  { key: "settings", label: "Settings", icon: "settings" },
] as const;

type Props = {
  slug: string;
  productName: string;
  session: { name: string; email: string };
  sourceHealth?: Array<{ name: string; status: string | null }>;
  alertCount?: number;
};

export function TenantSidebar({ slug, productName, session, sourceHealth = [], alertCount = 0 }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, startSignout] = useTransition();

  const isActive = (key: string) => {
    const href = `/product/${slug}/${key}`;
    return key === "dashboard" ? pathname === href : pathname.startsWith(href);
  };

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const healthyCount = sourceHealth.filter((s) => s.status === "ok").length;
  const totalSources = sourceHealth.length;

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const sidebar = (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Product brand */}
      <div className="px-5 pt-6 pb-4 flex-none">
        <Link href={`/product/${slug}/dashboard`} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>monitoring</span>
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-white truncate leading-tight">{productName}</div>
            <div className="text-[11px] text-slate-500 font-medium">Monitoring</div>
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600 px-3 mb-2">Monitor</div>
        <div className="space-y-0.5">
          {NAV_MAIN.map((item) => {
            const active = isActive(item.key);
            return (
              <Link
                key={item.key}
                href={`/product/${slug}/${item.key}`}
                onClick={() => setMobileOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  active ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={PILL_ID}
                    className="absolute inset-0 bg-white/[0.08] rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {active && (
                  <motion.span
                    layoutId={`${PILL_ID}-bar`}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full bg-blue-400"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`material-symbols-outlined relative z-10 flex-none ${active ? "text-blue-400" : ""}`} style={{ fontSize: 18 }}>{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
                {item.key === "alerts" && alertCount > 0 && (
                  <span className="relative z-10 ml-auto min-w-5 h-5 px-1.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                    {alertCount > 99 ? "99+" : alertCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 mb-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600 px-3 mb-2">System</div>
          <div className="space-y-0.5">
            {NAV_SYSTEM.map((item) => {
              const active = isActive(item.key);
              return (
                <Link
                  key={item.key}
                  href={`/product/${slug}/${item.key}`}
                  onClick={() => setMobileOpen(false)}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    active ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={PILL_ID}
                      className="absolute inset-0 bg-white/[0.08] rounded-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`material-symbols-outlined relative z-10 flex-none ${active ? "text-blue-400" : ""}`} style={{ fontSize: 18 }}>{item.icon}</span>
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Source health mini */}
      {totalSources > 0 && (
        <div className="px-4 pb-2 flex-none">
          <Link href={`/product/${slug}/sources`} className="block px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">Health</span>
              <span className="text-[11px] font-semibold text-slate-500">{healthyCount}/{totalSources}</span>
            </div>
            <div className="flex gap-1">
              {sourceHealth.map((s, i) => (
                <div
                  key={i}
                  title={s.name}
                  className={`h-1.5 flex-1 rounded-full ${
                    s.status === "ok" ? "bg-emerald-500" : s.status ? "bg-amber-500" : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </Link>
        </div>
      )}

      {/* User */}
      <div className="border-t border-white/[0.06] p-3 flex-none">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold flex-none ring-2 ring-white/10">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-slate-200 truncate">{session.name}</div>
            <div className="text-[11px] text-slate-600 truncate">{session.email}</div>
          </div>
          <ThemeToggle />
        </div>
        <button
          type="button"
          disabled={signingOut}
          onClick={() => startSignout(() => tenantSignoutAction(slug))}
          className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.04] text-[13px] font-medium transition-colors mt-0.5 disabled:opacity-50"
        >
          <span className="material-symbols-outlined flex-none" style={{ fontSize: 16 }}>logout</span>
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-[240px] h-screen sticky top-0 flex-none z-20 overflow-hidden">
        {sidebar}
      </aside>

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-30 w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-black/30 ring-1 ring-white/10"
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>menu</span>
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25, ease }}
              className="fixed inset-y-0 left-0 z-50 w-[240px] lg:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
