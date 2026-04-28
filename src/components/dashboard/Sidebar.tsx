"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { signoutAction } from "@/app/actions/auth";
import { fadeIn, slideRight, stagger } from "./motion";

type NavItem = { label: string; href: string; icon: string };
type NavGroup = { title: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Build",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
      { label: "Idea Inbox", href: "/dashboard/inbox", icon: "inbox" },
      { label: "BuildSpec Authoring", href: "/dashboard/buildspec", icon: "edit_document" },
      { label: "Build Pipeline", href: "/dashboard/pipeline", icon: "rocket_launch" },
      { label: "Launch Approval", href: "/dashboard/launches", icon: "check_circle" },
    ],
  },
  {
    title: "Operate",
    items: [
      { label: "Portfolio Control", href: "/dashboard/portfolio", icon: "monitoring" },
      { label: "Outreach Queues", href: "/dashboard/outreach", icon: "campaign" },
      { label: "Audit Trail", href: "/dashboard/audit", icon: "fact_check" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Templates", href: "/dashboard/templates", icon: "dashboard_customize" },
      { label: "Patterns", href: "/dashboard/patterns", icon: "extension" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Compliance Gates", href: "/dashboard/compliance", icon: "verified_user" },
      { label: "Settings", href: "/dashboard/settings", icon: "settings" },
    ],
  },
];

const ACTIVE_PILL = "zecb-sidebar-active-pill";

type Props = {
  user: { name: string; email: string };
  onNavigate?: () => void;
};

export function Sidebar({ user, onNavigate }: Props) {
  const pathname = usePathname();
  const [signingOut, startSignout] = useTransition();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={stagger(0.04, 0.04)}
      className="h-full w-64 flex flex-col bg-white border-r border-surface-variant"
    >
      <motion.div
        variants={fadeIn}
        className="px-5 py-4 border-b border-surface-variant flex items-center gap-2.5 flex-none"
      >
        <motion.div
          whileHover={{ rotate: -6, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 320, damping: 16 }}
          className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center"
        >
          <span
            className="material-symbols-outlined text-on-primary"
            style={{ fontSize: 20 }}
          >
            bolt
          </span>
        </motion.div>
        <Link
          href="/dashboard"
          className="font-bold text-primary tracking-tight text-body-lg"
        >
          Zero-Employee
        </Link>
      </motion.div>

      <nav className="flex-1 overflow-y-auto p-3">
        {NAV_GROUPS.map((group) => (
          <motion.div
            key={group.title}
            variants={stagger(0, 0.03)}
            className="mb-5 last:mb-0"
          >
            <motion.div
              variants={fadeIn}
              className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant px-3 mb-2"
            >
              {group.title}
            </motion.div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <motion.li key={item.href} variants={slideRight}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={
                        "relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-md font-medium " +
                        (active
                          ? "text-on-primary"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors")
                      }
                    >
                      {active && (
                        <motion.span
                          layoutId={ACTIVE_PILL}
                          className="absolute inset-0 bg-primary rounded-lg"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                          aria-hidden
                        />
                      )}
                      <span
                        className="material-symbols-outlined flex-none relative z-10"
                        style={{ fontSize: 20 }}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate relative z-10">
                        {item.label}
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        ))}
      </nav>

      <motion.div
        variants={fadeIn}
        className="border-t border-surface-variant p-3 flex-none"
      >
        <div className="px-2 py-1.5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center font-semibold text-body-md flex-none">
            {initials || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-body-md font-semibold text-on-surface truncate">
              {user.name || "Operator"}
            </div>
            <div className="text-label-sm text-on-surface-variant truncate">
              {user.email}
            </div>
          </div>
        </div>
        <motion.button
          type="button"
          disabled={signingOut}
          onClick={() => startSignout(() => signoutAction())}
          whileHover={{ x: 2 }}
          transition={{ duration: 0.2 }}
          className="mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-error text-body-md font-medium transition-colors disabled:opacity-60"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            logout
          </span>
          {signingOut ? "Signing out…" : "Sign out"}
        </motion.button>
      </motion.div>
    </motion.aside>
  );
}
