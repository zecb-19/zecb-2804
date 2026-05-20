"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { signoutAction } from "@/app/actions/auth";

type NavItem = { label: string; href: string; icon: string };
type NavGroup = { title: string; items: NavItem[] };

const OPERATOR_NAV_GROUPS: NavGroup[] = [
  {
    title: "Build",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "space_dashboard" },
      { label: "Idea Inbox", href: "/dashboard/inbox", icon: "auto_awesome" },
      { label: "BuildSpec", href: "/dashboard/buildspec", icon: "edit_note" },
      { label: "Builds", href: "/dashboard/pipeline", icon: "rocket_launch" },
    ],
  },
  {
    title: "Operate",
    items: [
      { label: "Portfolio", href: "/dashboard/portfolio", icon: "monitoring" },
      { label: "AI Agents", href: "/dashboard/agents", icon: "smart_toy" },
      { label: "Outreach", href: "/dashboard/outreach", icon: "campaign" },
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
      { label: "Compliance", href: "/dashboard/compliance", icon: "verified_user" },
      { label: "Settings", href: "/dashboard/settings", icon: "settings" },
    ],
  },
];

const SUBSCRIBER_NAV_GROUPS: NavGroup[] = [
  {
    title: "My Products",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "space_dashboard" },
      { label: "My Builds", href: "/dashboard/pipeline", icon: "rocket_launch" },
      { label: "Submit Idea", href: "/dashboard/inbox", icon: "auto_awesome" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Billing", href: "/dashboard/settings", icon: "credit_card" },
      { label: "Settings", href: "/dashboard/settings", icon: "settings" },
    ],
  },
];

function getNavGroups(role: string): NavGroup[] {
  if (role === "subscriber") return SUBSCRIBER_NAV_GROUPS;
  const groups = [...OPERATOR_NAV_GROUPS];
  if (role === "admin") {
    groups.push({
      title: "Admin",
      items: [
        { label: "Admin", href: "/dashboard/admin", icon: "admin_panel_settings" },
      ],
    });
  }
  return groups;
}

const ACTIVE_PILL = "zecb-sidebar-active-pill";

type Props = {
  user: { name: string; email: string; role: string };
  onNavigate?: () => void;
};

export function Sidebar({ user, onNavigate }: Props) {
  const navGroups = getNavGroups(user.role);
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
    <aside className="h-full w-[260px] flex flex-col bg-slate-950">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 flex-none">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>bolt</span>
        </div>
        <Link href="/dashboard" className="font-bold text-white tracking-tight text-lg">
          ZECB
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-none px-3 pb-3" style={{ scrollbarWidth: "none" }}>
        {navGroups.map((group) => (
          <div key={group.title} className="mb-6 last:mb-0">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 px-3 mb-2">
              {group.title}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={
                        "relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all " +
                        (active
                          ? "text-white"
                          : "text-slate-400 hover:text-white hover:bg-white/5")
                      }
                    >
                      {active && (
                        <motion.span
                          layoutId={ACTIVE_PILL}
                          className="absolute inset-0 bg-white/10 rounded-xl border border-white/5"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          aria-hidden
                        />
                      )}
                      <span
                        className={`material-symbols-outlined flex-none relative z-10 ${active ? "text-blue-400" : ""}`}
                        style={{ fontSize: 20 }}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate relative z-10">{item.label}</span>
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-400" aria-hidden />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 p-3 flex-none">
        <div className="px-2 py-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold text-xs flex-none">
            {initials || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user.name || "Operator"}
            </div>
            <div className="text-xs text-slate-500 truncate">{user.email}</div>
          </div>
        </div>
        <button
          type="button"
          disabled={signingOut}
          onClick={() => startSignout(() => signoutAction())}
          className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
