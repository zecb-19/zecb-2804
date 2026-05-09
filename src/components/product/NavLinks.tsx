"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PILL_ID = "tenant-nav-pill";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "space_dashboard" },
  { key: "sources", label: "Sources", icon: "database" },
  { key: "rules", label: "Rules", icon: "tune" },
  { key: "timeline", label: "Timeline", icon: "timeline" },
  { key: "alerts", label: "Alerts", icon: "notifications_active" },
  { key: "settings", label: "Settings", icon: "settings" },
] as const;

export function DesktopNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const isActive = (key: string) => {
    const href = `/product/${slug}/${key}`;
    return key === "dashboard" ? pathname === href : pathname.startsWith(href);
  };

  return (
    <nav className="hidden md:flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.key);
        return (
          <Link
            key={item.key}
            href={`/product/${slug}/${item.key}`}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              active ? "text-blue-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            {active && (
              <motion.span
                layoutId={PILL_ID}
                className="absolute inset-0 bg-blue-50 rounded-xl border border-blue-100/80"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="material-symbols-outlined relative z-10" style={{ fontSize: 18 }}>{item.icon}</span>
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const isActive = (key: string) => {
    const href = `/product/${slug}/${key}`;
    return key === "dashboard" ? pathname === href : pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden flex items-center gap-1 px-3 py-2 bg-white/60 backdrop-blur-lg border-b border-slate-100 overflow-x-auto sticky top-16 z-20">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.key);
        return (
          <Link
            key={item.key}
            href={`/product/${slug}/${item.key}`}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              active ? "bg-blue-50 text-blue-700 border border-blue-100" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
