"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { easeOut } from "./motion";
import { NotificationBell } from "./NotificationBell";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/inbox": "Idea Inbox",
  "/dashboard/buildspec": "BuildSpec",
  "/dashboard/pipeline": "Builds",
  "/dashboard/launches": "Launch Approval",
  "/dashboard/agents": "AI Agents",
  "/dashboard/portfolio": "Portfolio",
  "/dashboard/outreach": "Outreach",
  "/dashboard/audit": "Audit Trail",
  "/dashboard/templates": "Templates",
  "/dashboard/patterns": "Patterns",
  "/dashboard/compliance": "Compliance",
  "/dashboard/admin": "Admin",
  "/dashboard/settings": "Settings",
};

export function Topbar({ onMenuClick, role = "operator" }: { onMenuClick: () => void; role?: string }) {
  const isSubscriberRole = role === "subscriber";
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Dashboard";

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: easeOut }}
      className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 h-16 flex items-center justify-between flex-none sticky top-0 z-20"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <motion.h1
          key={title}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.32, ease: easeOut }}
          className="text-lg font-bold text-slate-900 truncate"
        >
          {title}
        </motion.h1>
      </div>
      <div className="flex items-center gap-2 flex-none">
        <button
          type="button"
          aria-label="Search"
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors hidden sm:inline-flex"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>search</span>
        </button>
        <NotificationBell />
        <Link
          href={isSubscriberRole ? "/dashboard/inbox" : "/dashboard/buildspec"}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center gap-1.5 ml-1"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {isSubscriberRole ? "auto_awesome" : "add"}
          </span>
          <span className="hidden sm:inline">{isSubscriberRole ? "Submit Idea" : "New Build"}</span>
        </Link>
      </div>
    </motion.header>
  );
}
