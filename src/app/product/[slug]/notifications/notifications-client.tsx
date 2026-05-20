"use client";

import { useActionState } from "react";
import { saveChannelConfigAction, testNotificationAction, type NotifActionState } from "@/app/actions/tenant-notifications";

const inputCls = "w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors";

const CHANNELS = [
  { key: "email", label: "Email", icon: "email", desc: "Receive alerts at your account email address", color: "blue", hasConfig: false },
  { key: "slack", label: "Slack", icon: "tag", desc: "Send alerts to a Slack channel via webhook", color: "purple", hasConfig: true, configField: "slack_webhook_url", configLabel: "Slack Webhook URL", configPlaceholder: "https://hooks.slack.com/services/T.../B.../..." },
  { key: "teams", label: "Microsoft Teams", icon: "groups", desc: "Send alerts to a Teams channel via webhook", color: "indigo", hasConfig: true, configField: "teams_webhook_url", configLabel: "Teams Webhook URL", configPlaceholder: "https://outlook.office.com/webhook/..." },
  { key: "telegram", label: "Telegram", icon: "send", desc: "Send alerts to a Telegram chat via bot", color: "cyan", hasConfig: true, configField: "telegram_chat_id", configLabel: "Telegram Chat ID", configPlaceholder: "-1001234567890" },
  { key: "webhook", label: "Custom Webhook", icon: "webhook", desc: "POST JSON payloads to your own endpoint", color: "emerald", hasConfig: false },
  { key: "in_app", label: "In-App", icon: "notifications", desc: "Show alerts in the notification center", color: "amber", hasConfig: false },
] as const;

const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", ring: "ring-blue-200" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", ring: "ring-purple-200" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", ring: "ring-indigo-200" },
  cyan: { bg: "bg-cyan-50", icon: "text-cyan-600", ring: "ring-cyan-200" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", ring: "ring-emerald-200" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", ring: "ring-amber-200" },
};

type Props = {
  slug: string;
  channels: string[];
  slackUrl: string;
  teamsUrl: string;
  telegramId: string;
};

export function NotificationsClient({ slug, channels, slackUrl, teamsUrl, telegramId }: Props) {
  const [saveState, saveAction, savePending] = useActionState(saveChannelConfigAction, undefined as NotifActionState);
  const [testState, testAction, testPending] = useActionState(testNotificationAction, undefined as NotifActionState);

  const configValues: Record<string, string> = {
    slack_webhook_url: slackUrl,
    teams_webhook_url: teamsUrl,
    telegram_chat_id: telegramId,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Notification Channels</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure how and where you receive alerts.</p>
      </div>

      {/* Status banners */}
      {saveState && (
        <div className={`px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${saveState.ok ? "bg-emerald-50 border border-emerald-100 text-emerald-700" : "bg-red-50 border border-red-100 text-red-700"}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{saveState.ok ? "check_circle" : "error"}</span>
          {"message" in saveState ? saveState.message : "Saved."}
        </div>
      )}
      {testState && (
        <div className={`px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${testState.ok ? "bg-blue-50 border border-blue-100 text-blue-700" : "bg-red-50 border border-red-100 text-red-700"}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{testState.ok ? "check_circle" : "error"}</span>
          {"message" in testState ? testState.message : "Done."}
        </div>
      )}

      {/* Test buttons — outside the save form to avoid nesting */}
      <div className="space-y-4">
        {CHANNELS.map((ch) => {
          const c = colorMap[ch.color];
          const isActive = channels.includes(ch.key);
          return (
            <div key={ch.key} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center flex-none`}>
                    <span className={`material-symbols-outlined ${c.icon}`} style={{ fontSize: 20 }}>{ch.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{ch.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{ch.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-none">
                  <form action={testAction}>
                    <input type="hidden" name="channel" value={ch.key} />
                    <button type="submit" disabled={testPending} className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-colors disabled:opacity-50">
                      Test
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save form — separate, not wrapping test buttons */}
      <form action={saveAction} className="space-y-4 mt-6">
        <h2 className="text-sm font-bold text-slate-900">Channel Configuration</h2>

        {/* Channel toggles */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="space-y-3">
            {CHANNELS.map((ch) => {
              const c = colorMap[ch.color];
              const isActive = channels.includes(ch.key);
              return (
                <div key={ch.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-md ${c.bg} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined ${c.icon}`} style={{ fontSize: 14 }}>{ch.icon}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{ch.label}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="channels" value={ch.key} defaultChecked={isActive} className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* URL configs */}
        {CHANNELS.filter((ch) => ch.hasConfig).map((ch) => (
          <div key={ch.key} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{ch.configLabel}</label>
            <input
              type="text"
              name={ch.configField}
              defaultValue={configValues[ch.configField!] ?? ""}
              placeholder={ch.configPlaceholder}
              className={`${inputCls} font-mono text-xs`}
            />
          </div>
        ))}

        <button type="submit" disabled={savePending}
          className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2">
          {savePending ? "Saving..." : "Save Configuration"}
        </button>
      </form>
    </div>
  );
}
