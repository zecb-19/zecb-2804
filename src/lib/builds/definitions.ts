import { z } from "zod";

// --- Enum vocabularies — verbatim from PRD Appendix B ---------------------

export const DATA_SOURCE_KINDS = [
  "http_api",
  "webscrape",
  "rss",
  "email_inbound",
  "csv_upload",
  "google_sheets",
  "pdf_watch",
] as const;

export const ALERT_PRIMITIVES = [
  "threshold",
  "change_rate",
  "absence",
  "presence",
  "regex_match",
  "semantic_match",
  "statistical_anomaly",
  "deadline_approaching",
] as const;

export const NOTIFICATION_CHANNELS = [
  "email",
  "slack",
  "webhook",
  "sms",
  "whatsapp",
  "in_app",
  "teams",
  "telegram",
] as const;

export const INTEGRATIONS = [
  "stripe",
  "sendgrid",
  "postmark",
  "slack",
  "zapier",
  "make",
  "n8n",
  "google_workspace",
] as const;

export const ONBOARDING_MODES = [
  "self_serve",
  "guided_wizard",
  "done_for_you",
] as const;

export const DATA_SOURCE_LABELS: Record<(typeof DATA_SOURCE_KINDS)[number], string> = {
  http_api: "HTTP API (REST polling)",
  webscrape: "Web scrape",
  rss: "RSS feed",
  email_inbound: "Email inbound",
  csv_upload: "CSV upload",
  google_sheets: "Google Sheets",
  pdf_watch: "PDF watch",
};

export const ALERT_PRIMITIVE_LABELS: Record<(typeof ALERT_PRIMITIVES)[number], string> = {
  threshold: "Threshold",
  change_rate: "Change rate",
  absence: "Absence",
  presence: "Presence",
  regex_match: "Regex match",
  semantic_match: "Semantic match (LLM)",
  statistical_anomaly: "Statistical anomaly",
  deadline_approaching: "Deadline approaching",
};

export const CHANNEL_LABELS: Record<(typeof NOTIFICATION_CHANNELS)[number], string> = {
  email: "Email",
  slack: "Slack",
  webhook: "Webhook",
  sms: "SMS",
  whatsapp: "WhatsApp",
  in_app: "In-app",
  teams: "Microsoft Teams",
  telegram: "Telegram",
};

export const INTEGRATION_LABELS: Record<(typeof INTEGRATIONS)[number], string> = {
  stripe: "Stripe",
  sendgrid: "SendGrid",
  postmark: "Postmark",
  slack: "Slack",
  zapier: "Zapier",
  make: "Make",
  n8n: "n8n",
  google_workspace: "Google Workspace",
};

export const ONBOARDING_LABELS: Record<(typeof ONBOARDING_MODES)[number], string> = {
  self_serve: "Self-serve",
  guided_wizard: "Guided wizard",
  done_for_you: "Done-for-you",
};

// --- Schemas -------------------------------------------------------------

export const SLUG_RE = /^[a-z0-9-]+$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export const DataSourceSchema = z.object({
  type: z.enum(DATA_SOURCE_KINDS),
  config: z.unknown().default({}),
  rate_limit_per_hour: z.number().int().min(1).max(100_000).default(60),
  auth_required: z.boolean().default(false),
});

export const PricingTierSchema = z.object({
  name: z.string().min(1, { error: "Tier name is required." }).max(40).trim(),
  price_eur_monthly: z.number().min(0).max(99_999),
  annual_discount_pct: z.number().min(0).max(100).default(17),
  limits: z.object({
    max_data_sources: z.number().int().min(0).default(1),
    max_alert_rules: z.number().int().min(0).default(5),
    check_frequency_minutes: z.number().int().min(1).default(1440),
    history_retention_days: z.number().int().min(0).default(30),
    team_members: z.number().int().min(0).default(1),
  }),
});

export const BuildSpecSchema = z.object({
  product_slug: z
    .string()
    .regex(SLUG_RE, {
      error: "Lowercase letters, digits, and hyphens only.",
    })
    .min(3, { error: "Slug must be at least 3 characters." })
    .max(60, { error: "Slug is too long." }),
  product_name: z
    .string()
    .min(2, { error: "Product name is required." })
    .max(80)
    .trim(),
  tagline: z.string().max(140).default(""),
  data_sources: z
    .array(DataSourceSchema)
    .min(1, { error: "At least one data source is required." })
    .max(20),
  alert_primitives: z
    .array(z.enum(ALERT_PRIMITIVES))
    .min(1, { error: "Pick at least one alert primitive." }),
  notification_channels: z
    .array(z.enum(NOTIFICATION_CHANNELS))
    .min(1, { error: "Pick at least one notification channel." }),
  pricing_tiers: z
    .array(PricingTierSchema)
    .min(1, { error: "At least one pricing tier is required." })
    .max(4, { error: "Maximum four pricing tiers." }),
  branding: z.object({
    name: z.string().min(2, { error: "Brand name is required." }).max(80).trim(),
    logo_ref: z
      .url({ error: "Must be a valid URL or empty." })
      .or(z.literal(""))
      .default(""),
    palette: z.object({
      primary: z
        .string()
        .regex(HEX_RE, { error: "Use #rrggbb hex." })
        .default("#000000"),
      secondary: z
        .string()
        .regex(HEX_RE, { error: "Use #rrggbb hex." })
        .default("#2563eb"),
      accent: z
        .string()
        .regex(HEX_RE, { error: "Use #rrggbb hex." })
        .default("#fbbf24"),
    }),
  }),
  onboarding: z.object({
    mode: z.enum(ONBOARDING_MODES).default("self_serve"),
  }),
  integrations_requested: z.array(z.enum(INTEGRATIONS)).default([]),
});

export type BuildSpec = z.infer<typeof BuildSpecSchema>;
export type DataSource = z.infer<typeof DataSourceSchema>;
export type PricingTier = z.infer<typeof PricingTierSchema>;

// --- Defaults the form starts with ---------------------------------------

export const DEFAULT_SPEC: BuildSpec = {
  product_slug: "",
  product_name: "",
  tagline: "",
  data_sources: [
    {
      type: "http_api",
      config: { url: "" },
      rate_limit_per_hour: 60,
      auth_required: false,
    },
  ],
  alert_primitives: [
    "threshold",
    "change_rate",
    "absence",
    "presence",
    "regex_match",
  ],
  notification_channels: ["email"],
  pricing_tiers: [
    {
      name: "Free",
      price_eur_monthly: 0,
      annual_discount_pct: 17,
      limits: {
        max_data_sources: 1,
        max_alert_rules: 3,
        check_frequency_minutes: 1440,
        history_retention_days: 7,
        team_members: 1,
      },
    },
    {
      name: "Starter",
      price_eur_monthly: 19,
      annual_discount_pct: 17,
      limits: {
        max_data_sources: 5,
        max_alert_rules: 25,
        check_frequency_minutes: 60,
        history_retention_days: 90,
        team_members: 3,
      },
    },
    {
      name: "Pro",
      price_eur_monthly: 49,
      annual_discount_pct: 17,
      limits: {
        max_data_sources: 25,
        max_alert_rules: 100,
        check_frequency_minutes: 5,
        history_retention_days: 365,
        team_members: 10,
      },
    },
  ],
  branding: {
    name: "",
    logo_ref: "",
    palette: {
      primary: "#000000",
      secondary: "#2563eb",
      accent: "#fbbf24",
    },
  },
  onboarding: { mode: "self_serve" },
  integrations_requested: ["stripe", "postmark"],
};

// --- Pipeline step labels — verbatim from PRD §7.2 -----------------------

export const PIPELINE_STEPS = [
  "Schema validation",
  "Product registry creation",
  "Infrastructure provisioning",
  "Product repo init",
  "Data source config + smoke fetch",
  "Alert primitive wiring",
  "Onboarding flow generation",
  "Marketing site generation",
  "Knowledge base init",
  "Integration test suite",
  "Launch approval (HITL)",
] as const;

export const PIPELINE_TOTAL = PIPELINE_STEPS.length;

// --- Action state shapes -------------------------------------------------

export type CreateBuildErrors = {
  _form?: string[];
  product_slug?: string[];
  product_name?: string[];
  tagline?: string[];
  data_sources?: string[];
  alert_primitives?: string[];
  notification_channels?: string[];
  pricing_tiers?: string[];
  branding?: string[];
  integrations_requested?: string[];
  payload?: string[];
};

export type CreateBuildSuccess = {
  ok: true;
  product: { id: string; slug: string };
};

export type CreateBuildFailure = {
  ok: false;
  message?: string;
  errors?: CreateBuildErrors;
};

export type CreateBuildState =
  | CreateBuildSuccess
  | CreateBuildFailure
  | undefined;
