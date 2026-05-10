"use client";

import { useActionState } from "react";

type Props = {
  slug: string;
  email: string;
  name: string;
  plan: string;
  channels: string[];
  createdAt: string;
};

type SaveState = { ok: true } | { ok: false; message: string } | undefined;

const CHANNELS = [
  { value: "email", icon: "mail", label: "Email", desc: "Receive alerts in your inbox" },
  { value: "slack", icon: "chat", label: "Slack", desc: "Post to a Slack channel" },
  { value: "webhook", icon: "webhook", label: "Webhook", desc: "POST to a custom URL" },
  { value: "sms", icon: "sms", label: "SMS", desc: "Text message alerts" },
  { value: "in_app", icon: "notifications", label: "In-App", desc: "Show in dashboard" },
];

async function saveChannelsAction(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const channels = formData.getAll("channels") as string[];
  const res = await fetch("/api/tenant/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notify_channels: channels }),
  });
  if (!res.ok) return { ok: false, message: "Failed to save." };
  return { ok: true };
}

export function SettingsClient({ slug, email, name, plan, channels, createdAt }: Props) {
  const [state, action, pending] = useActionState(saveChannelsAction, undefined as SaveState);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">
          Manage your account and notification preferences.
        </p>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600" style={{ fontSize: 22 }}>person</span>
          </div>
          <h2 className="font-bold text-slate-900">Account</h2>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[
            { label: "Name", value: name, icon: "badge" },
            { label: "Email", value: email, icon: "mail" },
            { label: "Plan", value: plan, icon: "workspace_premium" },
            { label: "Member since", value: new Date(createdAt).toISOString().slice(0, 10), icon: "calendar_today" },
          ].map((field) => (
            <div key={field.label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="material-symbols-outlined text-slate-400 mt-0.5" style={{ fontSize: 16 }}>{field.icon}</span>
              <div>
                <div className="text-xs text-slate-500">{field.label}</div>
                <div className="text-sm text-slate-900 font-medium capitalize">{field.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification channels */}
      <form action={action} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 22 }}>notifications</span>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Notification Channels</h2>
            <p className="text-sm text-slate-500">Choose how alerts are delivered to you</p>
          </div>
        </div>
        <div className="space-y-2">
          {CHANNELS.map((ch) => (
            <label key={ch.value} className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 18 }}>{ch.icon}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{ch.label}</div>
                  <div className="text-xs text-slate-400">{ch.desc}</div>
                </div>
              </div>
              <input
                type="checkbox"
                name="channels"
                value={ch.value}
                defaultChecked={channels.includes(ch.value)}
                className="w-5 h-5 accent-slate-900 rounded"
              />
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-100">
          <button type="submit" disabled={pending}
            className="px-5 py-3 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 text-white font-semibold text-sm shadow-lg shadow-slate-900/20 hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 transition-all inline-flex items-center gap-2">
            {pending ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
            ) : (
              <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>Save preferences</>
            )}
          </button>
          {state?.ok && <span className="text-emerald-600 text-sm flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>Saved!</span>}
          {state && !state.ok && <span className="text-red-500 text-xs">{state.message}</span>}
        </div>
      </form>
    </div>
  );
}
