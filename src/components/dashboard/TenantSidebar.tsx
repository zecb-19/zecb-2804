"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { tenantSignoutAction } from "@/app/actions/tenant-auth";

const PILL_ID = "tenant-sidebar-pill";
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "space_dashboard" },
  { key: "sources", label: "Sources", icon: "database" },
  { key: "rules", label: "Rules", icon: "tune" },
  { key: "timeline", label: "Timeline", icon: "timeline" },
  { key: "alerts", label: "Alerts", icon: "notifications_active" },
  { key: "settings", label: "Settings", icon: "settings" },
] as const;

type Props = {
  slug: string;
  session: { name: string; email: string };
};

export function TenantSidebar({ slug, session }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
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

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Logo + collapse toggle */}
      <div className="p-4 flex-none">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
          <Link href={`/product/${slug}/dashboard`} className="flex-none">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20"
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>monitoring</span>
            </motion.div>
          </Link>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease }}
                className="flex items-center justify-between flex-1 min-w-0 overflow-hidden"
              >
                <Link href={`/product/${slug}/dashboard`} className="font-bold text-slate-900 text-lg tracking-tight truncate">
                  {slug}
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCollapsed((v) => !v)}
                  className="hidden lg:flex w-7 h-7 rounded-lg hover:bg-slate-200/60 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors flex-none ml-1"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {collapsed && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed((v) => !v)}
            className="hidden lg:flex w-full mt-2 h-7 rounded-lg hover:bg-slate-200/60 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <motion.span
              animate={{ rotate: 180 }}
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              chevron_left
            </motion.span>
          </motion.button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.key);
          return (
            <motion.div key={item.key} whileHover={active ? {} : { x: 2 }} transition={{ duration: 0.15 }}>
              <Link
                href={`/product/${slug}/${item.key}`}
                onClick={() => setMobileOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "text-blue-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                {active && (
                  <motion.span
                    layoutId={PILL_ID}
                    className="absolute inset-0 bg-blue-50/80 rounded-xl border border-blue-100/60 backdrop-blur-sm shadow-sm shadow-blue-500/5"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                {active && (
                  <motion.span
                    layoutId={`${PILL_ID}-indicator`}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-500"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className={`material-symbols-outlined relative z-10 flex-none ${active ? "text-blue-600" : ""}`} style={{ fontSize: 20 }}>{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease }}
                      className="relative z-10 truncate overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 flex-none border-t border-slate-200/60">
        <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold flex-none shadow-sm">
            {initials}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <div className="text-sm font-medium text-slate-900 truncate">{session.name}</div>
                <div className="text-xs text-slate-500 truncate">{session.email}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div>
          <button
            type="button"
            disabled={signingOut}
            onClick={() => startSignout(() => tenantSignoutAction(slug))}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50/50 text-sm font-medium transition-colors mt-1 disabled:opacity-50 ${collapsed ? "justify-center" : ""}`}
          >
            <span className="material-symbols-outlined flex-none" style={{ fontSize: 18 }}>logout</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease }}
                  className="overflow-hidden"
                >
                  {signingOut ? "Signing out..." : "Sign out"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease }}
        className="hidden lg:block h-screen sticky top-0 flex-none bg-white/60 backdrop-blur-2xl border-r border-slate-200/60 z-20 overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-30 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/30"
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>menu</span>
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
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] bg-white/80 backdrop-blur-2xl border-r border-slate-200/60 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
