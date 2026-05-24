import "server-only";

import { chatWithUsage, type ChatResult } from "@/lib/llm/openrouter";

import {
  ArchitectResponseSchema,
  type ArchitectResponse,
  type GenerationRequest,
} from "./definitions";

const SYSTEM_PROMPT = `You are the Architect Agent for the Zero-Employee Company Builder, an autonomous SaaS platform that ships Monitoring-SaaS products in under 72 hours.

A Monitoring-SaaS product is a passive-observation tool: it watches one or more data sources on a schedule, detects changes or anomalies via user-defined rules, notifies the user through chosen channels, and maintains a searchable history.

Your job: surface 3 concrete, validated SMB SaaS opportunities the operator could ship next.

CONSTRAINTS — non-negotiable:
- All 3 ideas must be distinctly different verticals or buyer segments. No near-duplicates.
- Be SPECIFIC. Name actual public data sources by name (e.g. "Metro wholesale price catalog", "Bundesanzeiger publications", "Förderdatenbank des Bundes", "Handelsregister", "DATEV-Konten-SKR04 reference", "BMWK Förderprogramme RSS"). NOT generic ("market data", "industry feeds").
- Unit economics must show CAC < LTV with payback < 12 months. CAC typically €30–€200 for SMB; LTV €300–€3000.
- Disqualify enterprise IT buyers, pure consumer apps, anything outside DACH/EU.
- Pricing in EUR. Suggest 3 tiers: Free, Starter (€19–€39/mo), Pro (€49–€199/mo).
- suggested_slug: kebab-case, German or English, ≤ 60 chars.
- suggested_data_sources: pick from these types only — http_api | webscrape | rss | email_inbound | csv_upload | google_sheets | pdf_watch.
- suggested_alert_primitives: pick from threshold, change_rate, absence, presence, regex_match, semantic_match, statistical_anomaly, deadline_approaching.
- suggested_notification_channels: pick from email, slack, webhook, sms, whatsapp, in_app, teams, telegram.

OUTPUT — return ONLY a JSON object matching this exact schema. No markdown, no preamble:
{
  "ideas": [
    {
      "vertical": "string",
      "persona": { "name": "string", "role": "string", "company_size": "1-5"|"5-20"|"20-100", "country": "DE"|"AT"|"CH"|"EU" },
      "opportunity": "1-sentence headline",
      "pain_statement": "1-sentence specific pain",
      "core_promise": "1-sentence promise",
      "mechanism": "how it works in 1-2 sentences — name the data source watched",
      "suggested_slug": "kebab-case",
      "suggested_data_sources": [{ "type": "...", "source_name": "...", "why_relevant": "..." }],
      "suggested_alert_primitives": [...],
      "suggested_notification_channels": [...],
      "suggested_pricing_tiers": [{ "name": "Free", "price_eur_monthly": 0, "target_segment": "..." }, { "name": "Starter", "price_eur_monthly": 29, "target_segment": "..." }, { "name": "Pro", "price_eur_monthly": 79, "target_segment": "..." }],
      "unit_economics": { "estimated_cac_eur": 60, "estimated_ltv_eur": 480, "estimated_payback_months": 4, "confidence": "low"|"medium"|"high" },
      "tam_estimate": "rough size + reasoning",
      "reasoning": "why this works, key risks"
    },
    { ... },
    { ... }
  ]
}`;

function buildUserPrompt(req: GenerationRequest): string {
  const lines = [
    `Verticals or angles to explore: ${req.verticals}`,
    `Region: ${req.region}`,
    `Operator monthly opex cap (excluding paid ads): €${req.capital_cap_eur}`,
  ];
  if (req.notes && req.notes.length > 0) {
    lines.push(`Additional notes: ${req.notes}`);
  }
  lines.push("Return exactly 3 ideas now.");
  return lines.join("\n");
}

function tryParse(text: string): unknown {
  // Strip thinking tags from reasoning models.
  let cleaned = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "").trim();
  // Strip markdown code fences.
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) cleaned = fenced[1].trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract the first top-level JSON object.
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

const REPAIR_PROMPT = `You will be given a JSON-ish payload that failed validation against the Architect Agent schema. Return a corrected JSON object that matches the schema exactly. Output ONLY the JSON object.`;

async function repairWithCheapModel(badText: string, schemaError: string): Promise<ChatResult> {
  const repairModel =
    process.env.OPENROUTER_REPAIR_MODEL ?? "openai/gpt-4o-mini";
  return chatWithUsage(
    [
      { role: "system", content: REPAIR_PROMPT },
      {
        role: "user",
        content: `Schema validation error:\n${schemaError}\n\nOriginal output:\n${badText}\n\nReturn the corrected JSON object only.`,
      },
    ],
    {
      model: repairModel,
      response_format: { type: "json_object" },
      temperature: 0,
    },
  );
}

export type GenerateResult = {
  response: ArchitectResponse;
  cost_eur: number;
  model: string;
};

export async function generateMarketSignalReports(
  req: GenerationRequest,
): Promise<GenerateResult> {
  const primary = await chatWithUsage(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(req) },
    ],
    {
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 4096,
    },
  );

  const parsed = tryParse(primary.content);
  if (parsed) {
    const validated = ArchitectResponseSchema.safeParse(parsed);
    if (validated.success) {
      return {
        response: validated.data,
        cost_eur: primary.usage.cost_eur,
        model: primary.usage.model,
      };
    }
    // Try one repair pass on schema mismatch.
    try {
      const repaired = await repairWithCheapModel(
        primary.content,
        validated.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("\n"),
      );
      const reparsed = tryParse(repaired.content);
      if (reparsed) {
        const second = ArchitectResponseSchema.safeParse(reparsed);
        if (second.success) {
          return {
            response: second.data,
            cost_eur: primary.usage.cost_eur + repaired.usage.cost_eur,
            model: `${primary.usage.model} → ${repaired.usage.model}`,
          };
        }
      }
    } catch (err) {
      console.error("[architect] repair pass failed:", err);
    }
    throw new Error(
      `Architect Agent returned JSON that failed schema validation: ${validated.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    );
  }

  console.error("[architect] non-JSON output (first 500 chars):", primary.content.slice(0, 500));
  throw new Error("Architect Agent returned non-JSON output");
}
