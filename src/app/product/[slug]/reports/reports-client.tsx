"use client";

import { useActionState } from "react";
import { saveReportConfigAction, type ReportActionState } from "@/app/actions/tenant-reports";

const inputCls = "w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 transition-colors";

const TIMEZONES = [
  "Europe/Berlin", "Europe/Vienna", "Europe/Zurich", "Europe/London",
  "Europe/Paris", "Europe/Amsterdam", "Europe/Madrid", "America/New_York",
  "America/Chicago", "America/Los_Angeles", "Asia/Tokyo", "UTC",
];

type Props = {
  slug: string;
  dailyEnabled: boolean;
  weeklyEnabled: boolean;
  deliveryTime: string;
  timezone: string;
};

export function ReportsClient({ slug, dailyEnabled, weeklyEnabled, deliveryTime, timezone }: Props) {
  const [state, action, pending] = useActionState(saveReportConfigAction, undefined as ReportActionState);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure scheduled email digests of your monitoring data.</p>
      </div>

      {state && (
        <div className={`px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${state.ok ? "bg-emerald-50 border border-emerald-100 text-emerald-700" : "bg-red-50 border border-red-100 text-red-700"}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{state.ok ? "check_circle" : "error"}</span>
          {"message" in state ? state.message : "Saved."}
        </div>
      )}

      <form action={action} className="space-y-4">
        {/* Daily Digest */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 20 }}>today</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Daily Digest</div>
                <div className="text-[11px] text-slate-400">Summary of yesterday&apos;s observations, alerts, and source health</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="daily_enabled" defaultChecked={dailyEnabled} className="sr-only peer" />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
          <div className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
            Includes: data point count, new alerts, source uptime %, top changing fields
          </div>
        </div>

        {/* Weekly Digest */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-violet-600" style={{ fontSize: 20 }}>date_range</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Weekly Digest</div>
                <div className="text-[11px] text-slate-400">Week-over-week trends, alert summary, and anomaly highlights</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="weekly_enabled" defaultChecked={weeklyEnabled} className="sr-only peer" />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
          <div className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
            Includes: weekly trends chart, alert breakdown by rule, coverage analysis, cost summary
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-600" style={{ fontSize: 20 }}>schedule</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Delivery Settings</div>
              <div className="text-[11px] text-slate-400">When and where to send your reports</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Delivery Time</label>
              <input type="time" name="delivery_time" defaultValue={deliveryTime} className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Timezone</label>
              <select name="timezone" defaultValue={timezone} className={inputCls}>
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={pending}
          className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2">
          {pending ? "Saving..." : "Save Preferences"}
        </button>
      </form>
    </div>
  );
}
