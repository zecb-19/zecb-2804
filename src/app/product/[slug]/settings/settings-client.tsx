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

async function saveChannelsAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const channels = formData.getAll("channels") as string[];
  const tenantId = formData.get("tenant_id") as string;

  const res = await fetch("/api/tenant/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tenant_id: tenantId, notify_channels: channels }),
  });

  if (!res.ok) return { ok: false, message: "Failed to save." };
  return { ok: true };
}

export function SettingsClient({ slug, email, name, plan, channels, createdAt }: Props) {
  const [state, action, pending] = useActionState(saveChannelsAction, undefined as SaveState);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-h1 text-h1 text-primary">Settings</h1>
        <p className="text-on-surface-variant mt-1">
          Account and notification preferences for <span className="font-mono">{slug}</span>
        </p>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-xl border border-surface-variant p-5 space-y-3">
        <h2 className="font-h3 text-h3 text-on-surface">Account</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-label-sm text-on-surface-variant">Name</div>
            <div className="text-body-md text-on-surface font-medium">{name}</div>
          </div>
          <div>
            <div className="text-label-sm text-on-surface-variant">Email</div>
            <div className="text-body-md text-on-surface font-medium">{email}</div>
          </div>
          <div>
            <div className="text-label-sm text-on-surface-variant">Plan</div>
            <div className="text-body-md text-on-surface font-medium capitalize">{plan}</div>
          </div>
          <div>
            <div className="text-label-sm text-on-surface-variant">Member since</div>
            <div className="text-body-md text-on-surface font-medium">
              {new Date(createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Notification channels */}
      <form action={action} className="bg-white rounded-xl border border-surface-variant p-5 space-y-4">
        <h2 className="font-h3 text-h3 text-on-surface">Notification Channels</h2>
        <p className="text-on-surface-variant text-body-md">
          Choose how you want to be notified when alert rules trigger.
        </p>
        <div className="space-y-2">
          {["email", "slack", "webhook", "sms", "in_app"].map((ch) => (
            <label key={ch} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-container-low cursor-pointer">
              <div>
                <div className="text-body-md font-medium text-on-surface capitalize">{ch.replace("_", " ")}</div>
              </div>
              <input
                type="checkbox"
                name="channels"
                value={ch}
                defaultChecked={channels.includes(ch)}
                className="w-5 h-5 accent-primary"
              />
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90 disabled:opacity-60">
            {pending ? "Saving..." : "Save preferences"}
          </button>
          {state?.ok && <span className="text-emerald-600 text-body-md">Saved!</span>}
          {state && !state.ok && <span className="text-error text-label-sm">{state.message}</span>}
        </div>
      </form>
    </div>
  );
}
