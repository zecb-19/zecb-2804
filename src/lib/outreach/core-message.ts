import "server-only";

import { pool } from "@/lib/db";
import { log } from "@/lib/log";
import { chatWithUsage } from "@/lib/llm/openrouter";

export type CoreMessagePayload = {
  product_id: string;
  version: number;
  target_audience: {
    primary_persona: { name: string; role: string; company_size: string; pains: string[] };
    disqualifiers: string[];
  };
  pain_statements: {
    calm: string;
    pointed: string;
    provocative: string;
  };
  core_promise: {
    tweet: string;
    sentence: string;
    paragraph: string;
  };
  proof_elements: Array<{ type: string; content: string }>;
  objection_rebuttals: Array<{ objection: string; rebuttal: string }>;
  calls_to_action: Array<{ commitment: string; text: string; target_action: string }>;
  brand_voice: {
    tone: string[];
    avoid: string[];
  };
  forbidden_claims: string[];
};

export async function generateCoreMessage(
  productId: string,
): Promise<{ message: CoreMessagePayload; cost_eur: number }> {
  const { rows } = await pool.query<{
    slug: string;
    name: string;
    spec_json: string;
    opportunity: string | null;
    pain_statement: string | null;
    core_promise: string | null;
    persona: string | null;
  }>(
    `SELECT p.slug, p.name,
            bs.spec_json::text AS spec_json,
            msr.opportunity, msr.pain_statement, msr.core_promise,
            msr.persona::text AS persona
       FROM products p
       LEFT JOIN build_specs bs ON bs.product_id = p.id
       LEFT JOIN market_signal_reports msr ON msr.promoted_to_product_id = p.id
      WHERE p.id = $1::uuid
      ORDER BY bs.version DESC
      LIMIT 1`,
    [productId],
  );

  const product = rows[0];
  if (!product) throw new Error("Product not found");

  let spec: Record<string, unknown> = {};
  try { spec = JSON.parse(product.spec_json ?? "{}"); } catch { /* */ }

  let persona: Record<string, unknown> = {};
  try { persona = JSON.parse(product.persona ?? "{}"); } catch { /* */ }

  const systemPrompt = `You are the Core Message Agent for the Zero-Employee Company Builder.
Your job: generate a single canonical messaging payload for a SaaS product.
This payload is the single source of truth for ALL marketing channels.

Output MUST be a valid JSON object matching the CoreMessage schema.
Be specific, concrete, measurable. No generic marketing speak.
Forbidden phrases: "delve", "navigate the complexities", "in today's fast-paced world", "leverage".
All claims must be substantiable. No "100% accuracy", "GDPR certified", or unsubstantiated "AI-powered".`;

  const userPrompt = `Generate the Core Message for this product:

Product: ${product.name} (${product.slug})
${product.opportunity ? `Opportunity: ${product.opportunity}` : ""}
${product.pain_statement ? `Pain statement: ${product.pain_statement}` : ""}
${product.core_promise ? `Core promise: ${product.core_promise}` : ""}
Persona: ${JSON.stringify(persona)}
Data sources: ${JSON.stringify((spec.data_sources as unknown[])?.map((d: unknown) => (d as Record<string, unknown>).type) ?? [])}
Alert primitives: ${JSON.stringify(spec.alert_primitives ?? [])}
Pricing tiers: ${JSON.stringify((spec.pricing_tiers as unknown[])?.map((t: unknown) => ({ name: (t as Record<string, unknown>).name, price: (t as Record<string, unknown>).price_eur_monthly })) ?? [])}

Return a JSON object with these exact keys:
- target_audience: { primary_persona: { name, role, company_size, pains[] }, disqualifiers[] }
- pain_statements: { calm, pointed, provocative }
- core_promise: { tweet (≤240 chars), sentence (≤80 words), paragraph (≤200 words) }
- proof_elements: [{ type: "mechanism"|"number"|"comparison", content }]
- objection_rebuttals: [{ objection, rebuttal }]
- calls_to_action: [{ commitment: "low"|"medium"|"high", text, target_action }]
- brand_voice: { tone: string[], avoid: string[] }
- forbidden_claims: string[]`;

  const result = await chatWithUsage(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.5, response_format: { type: "json_object" } },
  );

  let parsed: Record<string, unknown>;
  try {
    const cleaned = result.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    log.error({ productId }, "Failed to parse Core Message LLM response");
    throw new Error("Core Message generation failed — invalid JSON response");
  }

  const { rows: versionRows } = await pool.query<{ max_version: string }>(
    "SELECT COALESCE(MAX(version), 0)::text AS max_version FROM core_messages WHERE product_id = $1::uuid",
    [productId],
  );
  const nextVersion = Number(versionRows[0]?.max_version ?? 0) + 1;

  const payload: CoreMessagePayload = {
    product_id: productId,
    version: nextVersion,
    target_audience: (parsed.target_audience ?? { primary_persona: { name: "", role: "", company_size: "", pains: [] }, disqualifiers: [] }) as CoreMessagePayload["target_audience"],
    pain_statements: (parsed.pain_statements ?? { calm: "", pointed: "", provocative: "" }) as CoreMessagePayload["pain_statements"],
    core_promise: (parsed.core_promise ?? { tweet: "", sentence: "", paragraph: "" }) as CoreMessagePayload["core_promise"],
    proof_elements: (parsed.proof_elements ?? []) as CoreMessagePayload["proof_elements"],
    objection_rebuttals: (parsed.objection_rebuttals ?? []) as CoreMessagePayload["objection_rebuttals"],
    calls_to_action: (parsed.calls_to_action ?? []) as CoreMessagePayload["calls_to_action"],
    brand_voice: (parsed.brand_voice ?? { tone: [], avoid: [] }) as CoreMessagePayload["brand_voice"],
    forbidden_claims: (parsed.forbidden_claims ?? []) as string[],
  };

  await pool.query(
    `INSERT INTO core_messages (product_id, version, payload, status)
     VALUES ($1::uuid, $2, $3::jsonb, 'draft')`,
    [productId, nextVersion, JSON.stringify(payload)],
  );

  await pool.query(
    `INSERT INTO agent_runs (product_id, agent, task_name, input, output, status, cost_eur, llm_model)
     VALUES ($1::uuid, 'Core Message Agent', 'generate_core_message',
             $2::jsonb, $3::jsonb, 'ok', $4, $5)`,
    [
      productId,
      JSON.stringify({ product: product.slug }),
      JSON.stringify({ version: nextVersion }),
      result.usage.cost_eur,
      result.usage.model,
    ],
  );

  return { message: payload, cost_eur: result.usage.cost_eur };
}
