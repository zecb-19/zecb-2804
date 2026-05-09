"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";

import { createBuildAction } from "@/app/actions/builds";
import {
  ALERT_PRIMITIVES,
  ALERT_PRIMITIVE_LABELS,
  CHANNEL_LABELS,
  DATA_SOURCE_KINDS,
  DATA_SOURCE_LABELS,
  DEFAULT_SPEC,
  INTEGRATION_LABELS,
  INTEGRATIONS,
  NOTIFICATION_CHANNELS,
  ONBOARDING_LABELS,
  ONBOARDING_MODES,
  type BuildSpec,
  type CreateBuildState,
  type DataSource,
  type PricingTier,
} from "@/lib/builds/definitions";
import { fadeUp, stagger } from "./motion";

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors";

const labelCls =
  "text-sm font-medium text-slate-700 mb-1.5 block";

const helpCls = "text-xs text-slate-400 mt-1";

const initialState: CreateBuildState = undefined;

type AlertKey = (typeof ALERT_PRIMITIVES)[number];
type ChannelKey = (typeof NOTIFICATION_CHANNELS)[number];
type IntegrationKey = (typeof INTEGRATIONS)[number];

export function BuildSpecForm({
  initialSpec,
  fromLabel,
}: {
  initialSpec?: BuildSpec;
  fromLabel?: string;
} = {}) {
  const router = useRouter();
  const [spec, setSpec] = useState<BuildSpec>(() =>
    structuredClone(initialSpec ?? DEFAULT_SPEC),
  );
  const [state, action, pending] = useActionState(createBuildAction, initialState);

  // Auto-derive brand name from product name on first edit.
  useEffect(() => {
    if (!spec.branding.name && spec.product_name) {
      setSpec((s) => ({ ...s, branding: { ...s.branding, name: s.product_name } }));
    }
  }, [spec.product_name, spec.branding.name]);

  useEffect(() => {
    if (state && state.ok) {
      router.push("/dashboard/pipeline");
    }
  }, [state, router]);

  const failure = state && !state.ok ? state : null;

  const payload = useMemo(() => JSON.stringify(spec), [spec]);

  const update = <K extends keyof BuildSpec>(key: K, value: BuildSpec[K]) =>
    setSpec((s) => ({ ...s, [key]: value }));

  const updateBranding = (
    patch: Partial<Omit<BuildSpec["branding"], "palette">>,
  ) =>
    setSpec((s) => ({
      ...s,
      branding: { ...s.branding, ...patch },
    }));

  const updatePalette = (
    patch: Partial<BuildSpec["branding"]["palette"]>,
  ) =>
    setSpec((s) => ({
      ...s,
      branding: {
        ...s.branding,
        palette: { ...s.branding.palette, ...patch },
      },
    }));

  const updateDataSource = (idx: number, patch: Partial<DataSource>) =>
    setSpec((s) => ({
      ...s,
      data_sources: s.data_sources.map((d, i) =>
        i === idx ? { ...d, ...patch } : d,
      ),
    }));

  const addDataSource = () =>
    setSpec((s) => ({
      ...s,
      data_sources: [
        ...s.data_sources,
        { type: "http_api", config: { url: "" }, rate_limit_per_hour: 60, auth_required: false },
      ],
    }));

  const removeDataSource = (idx: number) =>
    setSpec((s) => ({
      ...s,
      data_sources: s.data_sources.filter((_, i) => i !== idx),
    }));

  const updateTier = (idx: number, patch: Partial<PricingTier>) =>
    setSpec((s) => ({
      ...s,
      pricing_tiers: s.pricing_tiers.map((t, i) =>
        i === idx ? { ...t, ...patch } : t,
      ),
    }));

  const updateTierLimits = (
    idx: number,
    patch: Partial<PricingTier["limits"]>,
  ) =>
    setSpec((s) => ({
      ...s,
      pricing_tiers: s.pricing_tiers.map((t, i) =>
        i === idx ? { ...t, limits: { ...t.limits, ...patch } } : t,
      ),
    }));

  const addTier = () =>
    setSpec((s) =>
      s.pricing_tiers.length >= 4
        ? s
        : {
            ...s,
            pricing_tiers: [
              ...s.pricing_tiers,
              {
                name: "",
                price_eur_monthly: 0,
                annual_discount_pct: 17,
                limits: {
                  max_data_sources: 1,
                  max_alert_rules: 1,
                  check_frequency_minutes: 1440,
                  history_retention_days: 30,
                  team_members: 1,
                },
              },
            ],
          },
    );

  const removeTier = (idx: number) =>
    setSpec((s) =>
      s.pricing_tiers.length <= 1
        ? s
        : { ...s, pricing_tiers: s.pricing_tiers.filter((_, i) => i !== idx) },
    );

  const togglePrimitive = (key: AlertKey) =>
    setSpec((s) => ({
      ...s,
      alert_primitives: s.alert_primitives.includes(key)
        ? s.alert_primitives.filter((k) => k !== key)
        : [...s.alert_primitives, key],
    }));

  const toggleChannel = (key: ChannelKey) =>
    setSpec((s) => ({
      ...s,
      notification_channels: s.notification_channels.includes(key)
        ? s.notification_channels.filter((k) => k !== key)
        : [...s.notification_channels, key],
    }));

  const toggleIntegration = (key: IntegrationKey) =>
    setSpec((s) => ({
      ...s,
      integrations_requested: s.integrations_requested.includes(key)
        ? s.integrations_requested.filter((k) => k !== key)
        : [...s.integrations_requested, key],
    }));

  return (
    <motion.form
      action={action}
      initial="hidden"
      animate="visible"
      variants={stagger(0.05, 0.07)}
      className="space-y-6"
    >
      <input type="hidden" name="payload" value={payload} readOnly />

      {fromLabel ? (
        <motion.div
          variants={fadeUp}
          className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm flex items-center gap-2"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20 }}
          >
            auto_awesome
          </span>
          Pre-filled from idea: <span className="font-semibold">{fromLabel}</span>
        </motion.div>
      ) : null}

      {failure?.message ? (
        <motion.div
          variants={fadeUp}
          className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"
        >
          {failure.message}
        </motion.div>
      ) : null}

      {/* Identity */}
      <FormCard
        title="Product identity"
        description="Slug becomes the product key everywhere; the name shows on the dashboard, marketing site, and emails."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Product slug"
            help="Lowercase letters, digits, hyphens. Used as the product key."
            errors={failure?.errors?.product_slug}
          >
            <input
              type="text"
              name="product_slug_display"
              value={spec.product_slug}
              onChange={(e) =>
                update("product_slug", e.target.value.toLowerCase())
              }
              placeholder="einkaufspreis-monitor"
              className={`${inputCls} font-mono`}
              required
            />
          </Field>
          <Field label="Product name" errors={failure?.errors?.product_name}>
            <input
              type="text"
              value={spec.product_name}
              onChange={(e) => update("product_name", e.target.value)}
              placeholder="Einkaufspreis-Monitor"
              className={inputCls}
              required
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field
            label="Tagline"
            help="≤ 140 characters. Shown on the marketing site hero."
            errors={failure?.errors?.tagline}
          >
            <input
              type="text"
              maxLength={140}
              value={spec.tagline}
              onChange={(e) => update("tagline", e.target.value)}
              placeholder="Track wholesale prices across Metro & Transgourmet, alert on changes."
              className={inputCls}
            />
          </Field>
        </div>
      </FormCard>

      {/* Branding */}
      <FormCard
        title="Branding"
        description="Drives the palette of the instantiated product's UI and marketing site."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Brand display name">
            <input
              type="text"
              value={spec.branding.name}
              onChange={(e) => updateBranding({ name: e.target.value })}
              placeholder="Einkaufspreis-Monitor"
              className={inputCls}
              required
            />
          </Field>
          <Field
            label="Logo URL"
            help="https://… or leave blank for a placeholder."
          >
            <input
              type="url"
              value={spec.branding.logo_ref}
              onChange={(e) => updateBranding({ logo_ref: e.target.value })}
              placeholder="https://cdn.example.com/logo.svg"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <ColorField
            label="Primary"
            value={spec.branding.palette.primary}
            onChange={(v) => updatePalette({ primary: v })}
          />
          <ColorField
            label="Secondary"
            value={spec.branding.palette.secondary}
            onChange={(v) => updatePalette({ secondary: v })}
          />
          <ColorField
            label="Accent"
            value={spec.branding.palette.accent}
            onChange={(v) => updatePalette({ accent: v })}
          />
        </div>
      </FormCard>

      {/* Data sources */}
      <FormCard
        title="Data sources"
        description="What this product watches. Each source is configured per type — at least one is required."
      >
        <div className="space-y-3">
          {spec.data_sources.map((ds, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-xl p-4 bg-slate-50/50"
            >
              <div className="flex items-center justify-between mb-3 gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  Source {idx + 1}
                </span>
                {spec.data_sources.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDataSource(idx)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Type">
                  <select
                    value={ds.type}
                    onChange={(e) =>
                      updateDataSource(idx, {
                        type: e.target.value as DataSource["type"],
                      })
                    }
                    className={inputCls}
                  >
                    {DATA_SOURCE_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {DATA_SOURCE_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Rate limit (per hour)">
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    value={ds.rate_limit_per_hour}
                    onChange={(e) =>
                      updateDataSource(idx, {
                        rate_limit_per_hour: Number(e.target.value) || 1,
                      })
                    }
                    className={inputCls}
                  />
                </Field>
              </div>
              {(ds.type === "http_api" ||
                ds.type === "webscrape" ||
                ds.type === "rss" ||
                ds.type === "pdf_watch") && (
                <div className="mt-3">
                  <Field
                    label={
                      ds.type === "rss"
                        ? "Feed URL"
                        : ds.type === "pdf_watch"
                          ? "PDF URL"
                          : "Endpoint URL"
                    }
                  >
                    <input
                      type="url"
                      value={
                        typeof (ds.config as { url?: unknown }).url ===
                        "string"
                          ? (ds.config as { url: string }).url
                          : ""
                      }
                      onChange={(e) =>
                        updateDataSource(idx, {
                          config: {
                            ...(ds.config as Record<string, unknown>),
                            url: e.target.value,
                          },
                        })
                      }
                      placeholder="https://api.example.com/v1/prices"
                      className={inputCls}
                    />
                  </Field>
                </div>
              )}
              {(ds.type === "email_inbound" ||
                ds.type === "csv_upload" ||
                ds.type === "google_sheets") && (
                <p className={`${helpCls} mt-3`}>
                  Type-specific config is handled by the Build Orchestrator
                  during step 5 (smoke fetch). No URL needed here.
                </p>
              )}
              <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ds.auth_required}
                  onChange={(e) =>
                    updateDataSource(idx, { auth_required: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                />
                <span className="text-sm text-slate-500">
                  Authentication required (credentials configured later)
                </span>
              </label>
            </div>
          ))}
          <button
            type="button"
            onClick={addDataSource}
            className="w-full border border-dashed border-slate-300 rounded-xl py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50/50 hover:border-blue-300 transition-colors"
          >
            + Add another data source
          </button>
        </div>
        {failure?.errors?.data_sources?.map((e) => (
          <p key={e} className="text-red-500 text-xs mt-2">
            {e}
          </p>
        ))}
      </FormCard>

      {/* Alert primitives */}
      <FormCard
        title="Alert primitives"
        description="Operators in the rule-builder UI. Disabled here are hidden from end-customers."
      >
        <CheckboxGrid
          items={ALERT_PRIMITIVES.map((k) => ({
            key: k,
            label: ALERT_PRIMITIVE_LABELS[k],
          }))}
          selected={spec.alert_primitives}
          onToggle={(k) => togglePrimitive(k as AlertKey)}
        />
        {failure?.errors?.alert_primitives?.map((e) => (
          <p key={e} className="text-red-500 text-xs mt-2">
            {e}
          </p>
        ))}
      </FormCard>

      {/* Notification channels */}
      <FormCard
        title="Notification channels"
        description="Where alerts can be delivered. Foundation handles rendering per channel."
      >
        <CheckboxGrid
          items={NOTIFICATION_CHANNELS.map((k) => ({
            key: k,
            label: CHANNEL_LABELS[k],
          }))}
          selected={spec.notification_channels}
          onToggle={(k) => toggleChannel(k as ChannelKey)}
        />
        {failure?.errors?.notification_channels?.map((e) => (
          <p key={e} className="text-red-500 text-xs mt-2">
            {e}
          </p>
        ))}
      </FormCard>

      {/* Pricing tiers */}
      <FormCard
        title="Pricing tiers"
        description="1–4 tiers. These become Stripe products and gate the rule-builder limits."
      >
        <div className="space-y-3">
          {spec.pricing_tiers.map((t, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-xl p-4 bg-slate-50/50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">
                  Tier {idx + 1}
                </span>
                {spec.pricing_tiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTier(idx)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Name">
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => updateTier(idx, { name: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Monthly price (€)">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={t.price_eur_monthly}
                    onChange={(e) =>
                      updateTier(idx, {
                        price_eur_monthly: Number(e.target.value) || 0,
                      })
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Annual discount %">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={t.annual_discount_pct}
                    onChange={(e) =>
                      updateTier(idx, {
                        annual_discount_pct: Number(e.target.value) || 0,
                      })
                    }
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                <NumField
                  label="Sources"
                  value={t.limits.max_data_sources}
                  onChange={(v) => updateTierLimits(idx, { max_data_sources: v })}
                />
                <NumField
                  label="Rules"
                  value={t.limits.max_alert_rules}
                  onChange={(v) => updateTierLimits(idx, { max_alert_rules: v })}
                />
                <NumField
                  label="Check (min)"
                  value={t.limits.check_frequency_minutes}
                  onChange={(v) =>
                    updateTierLimits(idx, { check_frequency_minutes: v })
                  }
                />
                <NumField
                  label="History (days)"
                  value={t.limits.history_retention_days}
                  onChange={(v) =>
                    updateTierLimits(idx, { history_retention_days: v })
                  }
                />
                <NumField
                  label="Team"
                  value={t.limits.team_members}
                  onChange={(v) => updateTierLimits(idx, { team_members: v })}
                />
              </div>
            </div>
          ))}
          {spec.pricing_tiers.length < 4 && (
            <button
              type="button"
              onClick={addTier}
              className="w-full border border-dashed border-slate-300 rounded-xl py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50/50 hover:border-blue-300 transition-colors"
            >
              + Add pricing tier
            </button>
          )}
        </div>
      </FormCard>

      {/* Integrations + onboarding */}
      <FormCard
        title="Integrations & onboarding"
        description="Optional. Integrations route through Foundation; onboarding mode controls the end-user wizard."
      >
        <div>
          <span className={labelCls}>Foundation integrations requested</span>
          <CheckboxGrid
            items={INTEGRATIONS.map((k) => ({
              key: k,
              label: INTEGRATION_LABELS[k],
            }))}
            selected={spec.integrations_requested}
            onToggle={(k) => toggleIntegration(k as IntegrationKey)}
          />
        </div>
        <div className="mt-5">
          <span className={labelCls}>Onboarding mode</span>
          <div className="flex flex-col sm:flex-row gap-2">
            {ONBOARDING_MODES.map((m) => (
              <label
                key={m}
                className={
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer select-none transition-all " +
                  (spec.onboarding.mode === m
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700")
                }
              >
                <input
                  type="radio"
                  name="onboarding_mode"
                  value={m}
                  checked={spec.onboarding.mode === m}
                  onChange={() =>
                    setSpec((s) => ({
                      ...s,
                      onboarding: { mode: m },
                    }))
                  }
                  className="h-4 w-4 accent-slate-900"
                />
                <span className="text-sm">{ONBOARDING_LABELS[m]}</span>
              </label>
            ))}
          </div>
        </div>
      </FormCard>

      {/* Submit */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Dispatch to Build Orchestrator</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Step 1 (Schema validation) starts immediately. Steps 2–11 run
            autonomously. You'll be paged at step 11 (Launch approval) — no DNS
            cutover happens without your sign-off.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-none">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              {pending ? "hourglass_top" : "rocket_launch"}
            </span>
            {pending ? "Dispatching…" : "Dispatch build"}
          </button>
        </div>
      </motion.div>
    </motion.form>
  );
}

// --- Helpers --------------------------------------------------------------

function FormCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={fadeUp}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
    >
      <header className="mb-4">
        <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
        {description ? (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        ) : null}
      </header>
      {children}
    </motion.section>
  );
}

function Field({
  label,
  help,
  errors,
  children,
}: {
  label: string;
  help?: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
      {help ? <p className={helpCls}>{help}</p> : null}
      {errors?.length
        ? errors.map((e) => (
            <p key={e} className="text-red-500 text-xs mt-1">
              {e}
            </p>
          ))
        : null}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-9 rounded cursor-pointer bg-transparent border-0 p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm font-mono"
        />
      </div>
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500 mb-1 block">
        {label}
      </span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={inputCls}
      />
    </label>
  );
}

function CheckboxGrid<K extends string>({
  items,
  selected,
  onToggle,
}: {
  items: ReadonlyArray<{ key: K; label: string }>;
  selected: ReadonlyArray<string>;
  onToggle: (k: K) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {items.map((i) => {
        const on = selected.includes(i.key);
        return (
          <label
            key={i.key}
            className={
              "flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer select-none transition-all " +
              (on
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700")
            }
          >
            <input
              type="checkbox"
              checked={on}
              onChange={() => onToggle(i.key)}
              className="h-4 w-4 rounded border-slate-300 accent-slate-900"
            />
            <span className="text-sm">{i.label}</span>
          </label>
        );
      })}
    </div>
  );
}
