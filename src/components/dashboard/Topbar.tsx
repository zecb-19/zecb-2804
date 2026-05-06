"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LanguageSwitcher } from "@/lib/i18n/context";
import { easeOut } from "./motion";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/inbox": "Idea Inbox",
  "/dashboard/buildspec": "BuildSpec Authoring",
  "/dashboard/pipeline": "Build Pipeline",
  "/dashboard/launches": "Launch Approval",
  "/dashboard/portfolio": "Portfolio Control",
  "/dashboard/outreach": "Outreach Queues",
  "/dashboard/audit": "Audit Trail",
  "/dashboard/templates": "Template Catalog",
  "/dashboard/patterns": "Pattern Library",
  "/dashboard/compliance": "Compliance Gates",
  "/dashboard/settings": "Settings",
};

const buttonHover = {
  whileHover: { scale: 1.04, transition: { duration: 0.18, ease: easeOut } },
  whileTap: { scale: 0.96 },
};

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Operator Console";

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: easeOut }}
      className="bg-white border-b border-surface-variant px-4 md:px-6 h-16 flex items-center justify-between flex-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        <motion.button
          {...buttonHover}
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant"
        >
          <span className="material-symbols-outlined">menu</span>
        </motion.button>
        <motion.h1
          key={title}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.32, ease: easeOut }}
          className="font-h2 text-h2 text-primary truncate"
        >
          {title}
        </motion.h1>
      </div>
      <div className="flex items-center gap-2 md:gap-3 flex-none">
        <motion.button
          {...buttonHover}
          type="button"
          aria-label="Search"
          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors hidden sm:inline-flex"
        >
          <span className="material-symbols-outlined">search</span>
        </motion.button>
        <motion.button
          {...buttonHover}
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors hidden sm:inline-flex"
        >
          <span className="material-symbols-outlined">notifications</span>
          <motion.span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error"
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.55, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.button>
        <LanguageSwitcher />
        <motion.div {...buttonHover}>
          <Link
            href="/dashboard/buildspec"
            className="bg-primary text-on-primary px-3 md:px-4 py-2 rounded-lg font-semibold text-body-md hover:opacity-90 flex items-center gap-1.5"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              add
            </span>
            <span className="hidden sm:inline">New Build</span>
          </Link>
        </motion.div>
      </div>
    </motion.header>
  );
}
