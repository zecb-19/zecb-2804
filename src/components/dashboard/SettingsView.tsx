"use client";

import { motion } from "framer-motion";
import { useActionState, useState } from "react";

import {
  updateProfileAction,
  changePasswordAction,
  type ProfileState,
  type PasswordState,
} from "@/app/actions/settings";
import { COUNTRIES } from "@/lib/auth/definitions";
import type { UserProfile } from "@/lib/settings/queries";
import type { IntegrationStatus, AccountStats } from "@/lib/settings/queries";

import { fadeUp, fadeUpSm, scaleIn, stagger } from "./motion";

type Props = {
  profile: UserProfile;
  integrations: IntegrationStatus[];
  stats: AccountStats;
};

export function SettingsView({ profile, integrations, stats }: Props) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.08)}
      className="space-y-8 max-w-4xl"
    >
      <motion.div variants={fadeUp}>
        <h1 className="font-h1 text-h1 text-primary">Settings</h1>
        <p className="text-on-surface-variant mt-1.5">
          Account, holding preferences, and Foundation-layer integrations.
        </p>
      </motion.div>

      {/* Account overview */}
      <motion.div
        variants={stagger(0.05, 0.06)}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <StatCard label="Products" value={String(stats.products_total)} sub={`${stats.products_live} live`} icon="inventory_2" />
        <StatCard label="Total spend" value={formatCost(stats.total_build_cost_eur)} sub="all-time build cost" icon="payments" />
        <StatCard label="Agent runs" value={String(stats.agent_runs_count)} sub="all-time" icon="smart_toy" />
        <StatCard label="Member since" value={formatDate(profile.created_at)} sub={profile.role} icon="badge" />
      </motion.div>

      {/* Profile */}
      <motion.div variants={fadeUp}>
        <ProfileSection profile={profile} />
      </motion.div>

      {/* Password */}
      <motion.div variants={fadeUp}>
        <PasswordSection />
      </motion.div>

      {/* Integrations */}
      <motion.div variants={fadeUp}>
        <IntegrationsSection integrations={integrations} />
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={fadeUp}>
        <DangerSection email={profile.email} />
      </motion.div>
    </motion.div>
  );
}

/* --- Profile Section ------------------------------------------------------ */

function ProfileSection({ profile }: { profile: UserProfile }) {
  const [state, action, pending] = useActionState(
    updateProfileAction,
    undefined as ProfileState,
  );
  const [firstName, setFirstName] = useState(profile.first_name ?? "");
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [company, setCompany] = useState(profile.company ?? "");
  const [country, setCountry] = useState(profile.country ?? "DE");

  const errors = (state && !state.ok ? state.errors : undefined) ?? {};

  return (
    <section className="bg-white rounded-xl border border-surface-variant p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 22 }}>
          person
        </span>
        <h2 className="font-h3 text-h3 text-on-surface">Profile</h2>
      </div>

      <form action={action} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="First name"
            name="firstName"
            value={firstName}
            onChange={setFirstName}
            error={errors.firstName}
          />
          <Field
            label="Last name"
            name="lastName"
            value={lastName}
            onChange={setLastName}
            error={errors.lastName}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Company"
            name="company"
            value={company}
            onChange={setCompany}
            error={errors.company}
          />
          <div>
            <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
              Country
            </label>
            <select
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-lg border border-surface-variant px-3 py-2.5 text-body-md text-on-surface bg-white focus:outline-none focus:border-primary"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.country && <FieldError messages={errors.country} />}
          </div>
        </div>

        <div>
          <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full rounded-lg border border-surface-variant px-3 py-2.5 text-body-md text-on-surface-variant bg-surface-container-low cursor-not-allowed"
          />
          <p className="text-label-sm text-on-surface-variant mt-1">
            Email changes are not supported yet.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {pending ? "hourglass_top" : "save"}
            </span>
            {pending ? "Saving..." : "Save changes"}
          </button>
          {state?.ok === true && (
            <span className="text-emerald-600 text-body-md font-medium inline-flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
              Profile updated
            </span>
          )}
          {state && !state.ok && !state.errors && (
            <span className="text-error text-body-md">{state.message}</span>
          )}
        </div>
      </form>
    </section>
  );
}

/* --- Password Section ----------------------------------------------------- */

function PasswordSection() {
  const [state, action, pending] = useActionState(
    changePasswordAction,
    undefined as PasswordState,
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const errors = (state && !state.ok ? state.errors : undefined) ?? {};
  const succeeded = state?.ok === true;

  return (
    <section className="bg-white rounded-xl border border-surface-variant p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 22 }}>
          lock
        </span>
        <h2 className="font-h3 text-h3 text-on-surface">Password</h2>
      </div>

      <form action={action} className="space-y-4 max-w-md">
        <Field
          label="Current password"
          name="currentPassword"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
          error={errors.currentPassword}
        />
        <Field
          label="New password"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          error={errors.newPassword}
          hint="Min 10 chars, with uppercase, lowercase, number, and special character."
        />
        <Field
          label="Confirm new password"
          name="confirmNewPassword"
          type="password"
          value={confirmNewPassword}
          onChange={setConfirmNewPassword}
          error={errors.confirmNewPassword}
        />

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {pending ? "hourglass_top" : "lock_reset"}
            </span>
            {pending ? "Changing..." : "Change password"}
          </button>
          {succeeded && (
            <span className="text-emerald-600 text-body-md font-medium inline-flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
              Password changed
            </span>
          )}
          {state && !state.ok && !state.errors && (
            <span className="text-error text-body-md">{state.message}</span>
          )}
        </div>
      </form>
    </section>
  );
}

/* --- Integrations Section ------------------------------------------------- */

const CATEGORY_LABELS: Record<string, string> = {
  billing: "Billing",
  email: "Email Delivery",
  analytics: "Analytics & Attribution",
  storage: "Object Storage",
  observability: "Observability",
  support: "Support",
};

const CATEGORY_ICONS: Record<string, string> = {
  billing: "credit_card",
  email: "mail",
  analytics: "monitoring",
  storage: "cloud",
  observability: "bug_report",
  support: "support_agent",
};

function IntegrationsSection({ integrations }: { integrations: IntegrationStatus[] }) {
  const connected = integrations.filter((i) => i.connected).length;
  const required = integrations.filter((i) => i.required).length;
  const requiredConnected = integrations.filter((i) => i.required && i.connected).length;

  const grouped: Record<string, IntegrationStatus[]> = {};
  for (const i of integrations) {
    (grouped[i.category] ??= []).push(i);
  }

  return (
    <section className="bg-white rounded-xl border border-surface-variant p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 22 }}>
            extension
          </span>
          <h2 className="font-h3 text-h3 text-on-surface">Foundation Integrations</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={
            "px-2 py-0.5 rounded-full text-label-sm font-semibold " +
            (requiredConnected === required
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800")
          }>
            {connected} / {integrations.length} connected
          </span>
          {requiredConnected < required && (
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-label-sm font-semibold">
              {required - requiredConnected} required missing
            </span>
          )}
        </div>
      </div>

      <p className="text-on-surface-variant text-body-md mb-5">
        These Foundation-layer services must be connected before any product can
        launch. Configure keys in <code className="px-1 py-0.5 bg-surface-container-low rounded text-label-sm font-mono">.env.local</code> and
        restart the server.
      </p>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger(0.03, 0.04)}
        className="space-y-5"
      >
        {Object.entries(grouped).map(([category, items]) => (
          <motion.div key={category} variants={fadeUpSm}>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
                {CATEGORY_ICONS[category] ?? "settings"}
              </span>
              <span className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">
                {CATEGORY_LABELS[category] ?? category}
              </span>
            </div>
            <div className="space-y-1.5">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-container-low"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={
                        "material-symbols-outlined " +
                        (item.connected ? "text-emerald-500" : "text-on-surface-variant")
                      }
                      style={{ fontSize: 18 }}
                    >
                      {item.connected ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span className="text-body-md text-on-surface truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    {item.required && (
                      <span className="text-label-sm text-on-surface-variant">required</span>
                    )}
                    <span className={
                      "px-2 py-0.5 rounded-full text-label-sm font-semibold " +
                      (item.connected
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-surface-container text-on-surface-variant")
                    }>
                      {item.connected ? "Connected" : "Not connected"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* --- Danger Zone ---------------------------------------------------------- */

function DangerSection({ email }: { email: string }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <section className="bg-white rounded-xl border border-error/30 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-error" style={{ fontSize: 22 }}>
          warning
        </span>
        <h2 className="font-h3 text-h3 text-error">Danger Zone</h2>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-body-md font-semibold text-on-surface">Delete account</div>
          <div className="text-label-sm text-on-surface-variant">
            Permanently delete your operator account and all associated data.
            This cannot be undone.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowDelete((v) => !v)}
          className="px-4 py-2 rounded-lg border border-error text-error font-semibold text-body-md hover:bg-error/5 flex-none"
        >
          Delete account
        </button>
      </div>

      {showDelete && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-error-container/30 rounded-lg border border-error/20"
        >
          <p className="text-body-md text-on-surface mb-3">
            Account deletion is not yet implemented. To delete your account
            ({email}), contact support. Per PRD §11.7, all platform data is
            retained for 3 years for compliance.
          </p>
          <button
            type="button"
            onClick={() => setShowDelete(false)}
            className="text-on-surface-variant text-body-md hover:underline"
          >
            Close
          </button>
        </motion.div>
      )}
    </section>
  );
}

/* --- Shared Components ---------------------------------------------------- */

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string[];
  type?: "text" | "password" | "email";
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          "w-full rounded-lg border px-3 py-2.5 text-body-md text-on-surface bg-white focus:outline-none focus:border-primary " +
          (error ? "border-error" : "border-surface-variant")
        }
      />
      {hint && !error && (
        <p className="text-label-sm text-on-surface-variant mt-1">{hint}</p>
      )}
      {error && <FieldError messages={error} />}
    </div>
  );
}

function FieldError({ messages }: { messages: string[] }) {
  return (
    <div className="mt-1 space-y-0.5">
      {messages.map((m) => (
        <p key={m} className="text-label-sm text-error">{m}</p>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: string;
}) {
  return (
    <motion.div
      variants={scaleIn}
      className="bg-white rounded-xl border border-surface-variant p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
          {icon}
        </span>
        <span className="text-label-sm text-on-surface-variant">{label}</span>
      </div>
      <div className="font-display text-2xl font-bold text-primary leading-none">
        {value}
      </div>
      <div className="text-label-sm text-on-surface-variant mt-1">{sub}</div>
    </motion.div>
  );
}

function formatCost(eur: number): string {
  if (eur < 1) return `€${eur.toFixed(4)}`;
  return `€${eur.toFixed(2)}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleDateString("en", { month: "short", year: "numeric" });
}
