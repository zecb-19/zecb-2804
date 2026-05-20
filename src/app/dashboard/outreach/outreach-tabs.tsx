"use client";

import Link from "next/link";

type Props = { active: string };

const TABS = [
  { key: "queues", label: "Review Queue", icon: "checklist" },
  { key: "performance", label: "Performance", icon: "analytics" },
] as const;

export function OutreachTabs({ active }: Props) {
  return (
    <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/dashboard/outreach?tab=${tab.key}`}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            active === tab.key
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{tab.icon}</span>
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
