"use client";

import { motion } from "framer-motion";
import { useActionState, useState } from "react";

import {
  updateProfileAction,
  changePasswordAction,
  type ProfileState,
  type PasswordState,
} from "@/app/actions/settings";
import {
  createCheckoutAction,
  openPortalAction,
  type CheckoutState,
} from "@/app/actions/billing";
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
      className="space-y-8 max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1.5">
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

      {/* Billing */}
      <motion.div variants={fadeUp}>
        <BillingSection profile={profile} />
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
    <section className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 22 }}>
          person
        </span>
        <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
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
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Country
            </label>
            <select
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:border-primary"
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
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm text-slate-500 bg-slate-50 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-1">
            Email changes are not supported yet.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {pending ? "hourglass_top" : "save"}
            </span>
            {pending ? "Saving..." : "Save changes"}
          </button>
          {state?.ok === true && (
            <span className="text-emerald-600 text-sm font-medium inline-flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
              Profile updated
            </span>
          )}
          {state && !state.ok && !state.errors && (
            <span className="text-red-500 text-sm">{state.message}</span>
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
    <section className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 22 }}>
          lock
        </span>
        <h2 className="text-lg font-semibold text-slate-900">Password</h2>
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
            className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {pending ? "hourglass_top" : "lock_reset"}
            </span>
            {pending ? "Changing..." : "Change password"}
          </button>
          {succeeded && (
            <span className="text-emerald-600 text-sm font-medium inline-flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
              Password changed
            </span>
          )}
          {state && !state.ok && !state.errors && (
            <span className="text-red-500 text-sm">{state.message}</span>
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

/* --- Billing Section ------------------------------------------------------ */

const PLAN_TIERS = [
  { id: "starter", name: "Starter", price: "€99/mo", features: ["1 project", "Build pipeline", "Email support"] },
  { id: "growth", name: "Growth", price: "€299/mo", features: ["5 projects", "Outreach engine", "Priority support"] },
  { id: "scale", name: "Scale", price: "€899/mo", features: ["Unlimited", "White-label", "Success manager"] },
];

function BillingSection({ profile }: { profile: UserProfile }) {
  const [checkoutState, checkoutAction, checkoutPending] = useActionState(
    createCheckoutAction, undefined as CheckoutState,
  );
  const hasSubscription = profile.subscription_status !== "none" && profile.subscription_id;
  const activeTier = profile.subscription_tier;

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 22 }}>
          credit_card
        </span>
        <h2 className="text-lg font-semibold text-slate-900">Billing</h2>
        {hasSubscription && (
          <span className={
            "px-2 py-0.5 rounded-full text-xs font-semibold " +
            (profile.subscription_status === "active"
              ? "bg-emerald-100 text-emerald-800"
              : profile.subscription_status === "past_due"
                ? "bg-red-50 text-red-700"
                : "bg-amber-100 text-amber-800")
          }>
            {profile.subscription_status}
          </span>
        )}
      </div>

      {hasSubscription ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-2xl px-3 py-2">
              <div className="text-xs text-slate-500">Plan</div>
              <div className="font-semibold text-base text-slate-900 capitalize">
                {activeTier ?? "Unknown"}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl px-3 py-2">
              <div className="text-xs text-slate-500">Status</div>
              <div className="font-semibold text-base text-slate-900 capitalize">
                {profile.subscription_status}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl px-3 py-2">
              <div className="text-xs text-slate-500">Renews</div>
              <div className="font-semibold text-base text-slate-900">
                {profile.subscription_current_period_end
                  ? new Date(profile.subscription_current_period_end).toLocaleDateString()
                  : "—"}
              </div>
            </div>
          </div>
          <form action={openPortalAction}>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 font-semibold text-sm hover:bg-slate-50 inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
              Manage subscription
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-slate-500 text-sm">
            Choose a platform plan. Pricing applies to the ZECB operator console —
            instantiated product pricing is configured separately per BuildSpec.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLAN_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={
                  "rounded-2xl border p-4 " +
                  (tier.id === "growth"
                    ? "border-primary bg-slate-900/5"
                    : "border-slate-200")
                }
              >
                <div className="font-semibold text-base text-slate-900">{tier.name}</div>
                <div className="font-display text-2xl font-bold text-slate-900 mt-1">{tier.price}</div>
                <ul className="mt-3 space-y-1">
                  {tier.features.map((f) => (
                    <li key={f} className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 14 }}>check</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <form action={checkoutAction} className="mt-3">
                  <input type="hidden" name="tier_id" value={tier.id} />
                  <button
                    type="submit"
                    disabled={checkoutPending}
                    className={
                      "w-full px-3 py-2 rounded-2xl font-semibold text-sm disabled:opacity-60 " +
                      (tier.id === "growth"
                        ? "bg-slate-900 text-white hover:opacity-90"
                        : "border border-slate-200 text-slate-900 hover:bg-slate-50")
                    }
                  >
                    {checkoutPending ? "Loading..." : "Subscribe"}
                  </button>
                </form>
              </div>
            ))}
          </div>
          {checkoutState && !checkoutState.ok && (
            <p className="text-red-500 text-xs">{checkoutState.message}</p>
          )}
        </div>
      )}
    </section>
  );
}

function IntegrationsSection({ integrations }: { integrations: IntegrationStatus[] }) {
  const connected = integrations.filter((i) => i.connected).length;
  const required = integrations.filter((i) => i.required).length;
  const requiredConnected = integrations.filter((i) => i.required && i.connected).length;

  const grouped: Record<string, IntegrationStatus[]> = {};
  for (const i of integrations) {
    (grouped[i.category] ??= []).push(i);
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 22 }}>
            extension
          </span>
          <h2 className="text-lg font-semibold text-slate-900">Foundation Integrations</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={
            "px-2 py-0.5 rounded-full text-xs font-semibold " +
            (requiredConnected === required
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800")
          }>
            {connected} / {integrations.length} connected
          </span>
          {requiredConnected < required && (
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
              {required - requiredConnected} required missing
            </span>
          )}
        </div>
      </div>

      <p className="text-slate-500 text-sm mb-5">
        These Foundation-layer services must be connected before any product can
        launch. Configure keys in <code className="px-1 py-0.5 bg-slate-50 rounded text-xs font-mono">.env.local</code> and
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
              <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 18 }}>
                {CATEGORY_ICONS[category] ?? "settings"}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {CATEGORY_LABELS[category] ?? category}
              </span>
            </div>
            <div className="space-y-1.5">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-slate-50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={
                        "material-symbols-outlined " +
                        (item.connected ? "text-emerald-500" : "text-slate-500")
                      }
                      style={{ fontSize: 18 }}
                    >
                      {item.connected ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span className="text-sm text-slate-900 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    {item.required && (
                      <span className="text-xs text-slate-500">required</span>
                    )}
                    <span className={
                      "px-2 py-0.5 rounded-full text-xs font-semibold " +
                      (item.connected
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-500")
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
    <section className="bg-white rounded-2xl border border-error/30 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-red-500" style={{ fontSize: 22 }}>
          warning
        </span>
        <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">Delete account</div>
          <div className="text-xs text-slate-500">
            Permanently delete your operator account and all associated data.
            This cannot be undone.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowDelete((v) => !v)}
          className="px-4 py-2 rounded-2xl border border-error text-red-500 font-semibold text-sm hover:bg-red-500/5 flex-none"
        >
          Delete account
        </button>
      </div>

      {showDelete && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50/30 rounded-2xl border border-error/20"
        >
          <p className="text-sm text-slate-900 mb-3">
            Account deletion is not yet implemented. To delete your account
            ({email}), contact support. Per PRD §11.7, all platform data is
            retained for 3 years for compliance.
          </p>
          <button
            type="button"
            onClick={() => setShowDelete(false)}
            className="text-slate-500 text-sm hover:underline"
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
      <label className="block text-xs font-semibold text-slate-500 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          "w-full rounded-2xl border px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:border-primary " +
          (error ? "border-error" : "border-slate-200")
        }
      />
      {hint && !error && (
        <p className="text-xs text-slate-500 mt-1">{hint}</p>
      )}
      {error && <FieldError messages={error} />}
    </div>
  );
}

function FieldError({ messages }: { messages: string[] }) {
  return (
    <div className="mt-1 space-y-0.5">
      {messages.map((m) => (
        <p key={m} className="text-xs text-red-500">{m}</p>
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
      className="bg-white rounded-2xl border border-slate-200 p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-blue-600" style={{ fontSize: 18 }}>
          {icon}
        </span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className="font-display text-2xl font-bold text-slate-900 leading-none">
        {value}
      </div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
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
