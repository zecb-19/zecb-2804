"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  dashboard: "Overview",
  sources: "Data Sources",
  rules: "Alert Rules",
  timeline: "Timeline",
  alerts: "Alerts",
  notifications: "Channels",
  reports: "Reports",
  settings: "Settings",
  onboarding: "Get Started",
};

type Props = {
  slug: string;
  healthStatus: "healthy" | "degraded" | "unknown";
  sourcesCount: number;
};

export function TenantTopbar({ slug, healthStatus, sourcesCount }: Props) {
  const pathname = usePathname();
  const segment = pathname.split("/").pop() ?? "dashboard";
  const title = TITLES[segment] ?? "Overview";

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-10 flex-none">
      <div className="flex items-center gap-4">
        <h1 className="text-[15px] font-bold text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* System status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold ${
          healthStatus === "healthy"
            ? "bg-emerald-50 text-emerald-700"
            : healthStatus === "degraded"
            ? "bg-amber-50 text-amber-700"
            : "bg-slate-100 text-slate-500"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            healthStatus === "healthy" ? "bg-emerald-500" : healthStatus === "degraded" ? "bg-amber-500" : "bg-slate-400"
          }`} />
          {healthStatus === "healthy" ? `${sourcesCount} source${sourcesCount !== 1 ? "s" : ""} healthy` : healthStatus === "degraded" ? "Attention needed" : "No sources"}
        </div>

        {/* Keyboard shortcut hint */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/80 text-[11px] text-slate-400 cursor-default">
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>search</span>
          <span>Search</span>
          <kbd className="ml-1 px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-500 shadow-sm border border-slate-200">/</kbd>
        </div>
      </div>
    </header>
  );
}
