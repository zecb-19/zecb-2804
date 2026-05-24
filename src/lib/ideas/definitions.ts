import { z } from "zod";

import {
  ALERT_PRIMITIVES,
  DATA_SOURCE_KINDS,
  NOTIFICATION_CHANNELS,
  SLUG_RE,
} from "@/lib/builds/definitions";

export const IDEA_REGIONS = ["DE", "AT", "CH", "DACH", "EU"] as const;

export const GenerationRequestSchema = z.object({
  verticals: z
    .string()
    .min(2, { error: "Describe at least one vertical or angle." })
    .max(800)
    .trim(),
  region: z.enum(IDEA_REGIONS).default("DACH"),
  capital_cap_eur: z
    .number()
    .int({ error: "Whole numbers only." })
    .min(0)
    .max(100_000)
    .default(500),
  notes: z.string().max(800).optional().default(""),
});
export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

const SuggestedDataSource = z.object({
  type: z.enum(DATA_SOURCE_KINDS),
  source_name: z.string().min(2).max(120),
  why_relevant: z.string().min(5).max(400),
});

const SuggestedPricingTier = z.object({
  name: z.string().min(1).max(40),
  price_eur_monthly: z.number().nonnegative().max(99_999),
  target_segment: z.string().max(400).default(""),
});

const Persona = z.object({
  name: z.string().min(2).max(80),
  role: z.string().min(2).max(80),
  company_size: z.string().min(1).max(40),
  country: z.string().min(2).max(40),
});

const UnitEconomics = z.object({
  estimated_cac_eur: z.number().nonnegative().max(10_000),
  estimated_ltv_eur: z.number().nonnegative().max(1_000_000),
  estimated_payback_months: z.number().nonnegative().max(120),
  confidence: z.enum(["low", "medium", "high"]),
});

export const ArchitectIdeaSchema = z.object({
  vertical: z.string().min(2).max(120),
  persona: Persona,
  opportunity: z.string().min(10).max(400),
  pain_statement: z.string().min(10).max(400),
  core_promise: z.string().min(10).max(400),
  mechanism: z.string().min(10).max(600),
  suggested_slug: z
    .string()
    .regex(SLUG_RE, { error: "Slug must be kebab-case." })
    .min(3)
    .max(60),
  suggested_data_sources: z.array(SuggestedDataSource).min(1).max(6),
  suggested_alert_primitives: z.array(z.enum(ALERT_PRIMITIVES)).min(1).max(8),
  suggested_notification_channels: z
    .array(z.enum(NOTIFICATION_CHANNELS))
    .min(1)
    .max(8),
  suggested_pricing_tiers: z.array(SuggestedPricingTier).min(1).max(4),
  unit_economics: UnitEconomics,
  tam_estimate: z.string().max(500).default(""),
  reasoning: z.string().max(1500).default(""),
});

export const ArchitectResponseSchema = z.object({
  ideas: z.array(ArchitectIdeaSchema).length(3, {
    error: "Architect Agent must return exactly 3 ideas.",
  }),
});

export type ArchitectIdea = z.infer<typeof ArchitectIdeaSchema>;
export type ArchitectResponse = z.infer<typeof ArchitectResponseSchema>;

export type IdeaStatus = "pending" | "approved" | "rejected" | "promoted";

export type IdeaRow = {
  id: string;
  owner_user_id: string;
  generation_request_id: string;
  vertical: string;
  persona: ArchitectIdea["persona"];
  opportunity: string;
  pain_statement: string;
  core_promise: string;
  mechanism: string | null;
  suggested_slug: string | null;
  suggested_data_sources: ArchitectIdea["suggested_data_sources"];
  suggested_alert_primitives: ArchitectIdea["suggested_alert_primitives"];
  suggested_notification_channels: ArchitectIdea["suggested_notification_channels"];
  suggested_pricing_tiers: ArchitectIdea["suggested_pricing_tiers"];
  unit_economics: ArchitectIdea["unit_economics"];
  tam_estimate: string | null;
  reasoning: string | null;
  llm_model: string | null;
  cost_eur: string;
  status: IdeaStatus;
  reviewer_note: string | null;
  reviewed_at: string | null;
  promoted_to_product_id: string | null;
  created_at: string;
};

export type GenerateIdeasErrors = {
  verticals?: string[];
  region?: string[];
  capital_cap_eur?: string[];
  notes?: string[];
  _form?: string[];
};

export type GenerateIdeasState =
  | { ok: true; generation_request_id: string; cost_eur: number }
  | { ok: false; message?: string; errors?: GenerateIdeasErrors }
  | undefined;

export type ReviewIdeaState =
  | { ok: true; id: string; status: IdeaStatus }
  | { ok: false; message: string }
  | undefined;
