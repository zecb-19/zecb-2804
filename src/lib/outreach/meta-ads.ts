import "server-only";

import { pool } from "@/lib/db";
import { log } from "@/lib/log";
import type { CoreMessagePayload } from "./core-message";

export type CampaignStructure = {
  campaign_name: string;
  objective: string;
  ad_sets: AdSet[];
  budget_daily_eur: number;
  product_id: string;
};

export type AdSet = {
  name: string;
  budget_daily_eur: number;
  audience: {
    interests: string[];
    age_min: number;
    age_max: number;
    genders: string[];
    locations: string[];
  };
  placements: string[];
  ads: Ad[];
};

export type Ad = {
  headline: string;
  primary_text: string;
  description: string;
  cta: string;
  hook_type: "calm" | "pointed" | "provocative";
};

/**
 * Generate a Meta Ads campaign structure from the Core Message.
 * PRD §8.4: Campaign creation at launch from Core Message + BuildSpec.
 */
export async function generateCampaignStructure(
  productId: string,
): Promise<CampaignStructure> {
  const { rows } = await pool.query<{
    slug: string;
    payload: string;
  }>(
    `SELECT p.slug, cm.payload::text AS payload
       FROM products p
       JOIN core_messages cm ON cm.product_id = p.id
      WHERE p.id = $1::uuid
      ORDER BY cm.version DESC
      LIMIT 1`,
    [productId],
  );

  const product = rows[0];
  if (!product) throw new Error("Product or Core Message not found");

  const msg: CoreMessagePayload = JSON.parse(product.payload);
  const persona = msg.target_audience.primary_persona;

  const ads: Ad[] = [
    {
      headline: msg.core_promise.tweet.slice(0, 40),
      primary_text: msg.pain_statements.calm,
      description: msg.core_promise.sentence.slice(0, 90),
      cta: msg.calls_to_action.find((c) => c.commitment === "low")?.text ?? "Learn More",
      hook_type: "calm",
    },
    {
      headline: msg.pain_statements.pointed.slice(0, 40),
      primary_text: msg.pain_statements.pointed,
      description: msg.proof_elements[0]?.content.slice(0, 90) ?? "",
      cta: msg.calls_to_action.find((c) => c.commitment === "medium")?.text ?? "Try Free",
      hook_type: "pointed",
    },
    {
      headline: msg.pain_statements.provocative.slice(0, 40),
      primary_text: msg.pain_statements.provocative,
      description: msg.proof_elements[1]?.content.slice(0, 90) ?? "",
      cta: msg.calls_to_action.find((c) => c.commitment === "medium")?.text ?? "Start Free",
      hook_type: "provocative",
    },
  ];

  const structure: CampaignStructure = {
    campaign_name: `${product.slug}_acquisition_${new Date().toISOString().slice(0, 10)}`,
    objective: "conversions",
    product_id: productId,
    budget_daily_eur: 20,
    ad_sets: [
      {
        name: `${persona.role}_primary`,
        budget_daily_eur: 20,
        audience: {
          interests: persona.pains.slice(0, 5),
          age_min: 25,
          age_max: 55,
          genders: ["all"],
          locations: ["DE", "AT", "CH"],
        },
        placements: ["feed", "reels", "stories"],
        ads,
      },
    ],
  };

  await pool.query(
    `INSERT INTO agent_runs (product_id, agent, task_name, input, output, status, cost_eur)
     VALUES ($1::uuid, 'Meta Ads Agent', 'generate_campaign', $2::jsonb, $3::jsonb, 'ok', 0)`,
    [
      productId,
      JSON.stringify({ product: product.slug }),
      JSON.stringify({ campaign: structure.campaign_name, ad_sets: structure.ad_sets.length, ads: ads.length }),
    ],
  );

  if (process.env.META_SYSTEM_USER_TOKEN) {
    log.info({ productId, campaign: structure.campaign_name }, "Meta Ads API configured — campaign ready to create");
  } else {
    log.info({ productId }, "Meta Ads API not configured — campaign structure generated but not deployed");
  }

  return structure;
}

/**
 * PRD §8.4: Budget guardrails.
 */
export function validateBudgetChange(
  currentDailyEur: number,
  proposedDailyEur: number,
): { allowed: boolean; reason: string } {
  const changePct = Math.abs((proposedDailyEur - currentDailyEur) / currentDailyEur) * 100;

  if (changePct > 50) {
    return {
      allowed: false,
      reason: `Budget change of ${changePct.toFixed(0)}% exceeds 50% threshold — requires human approval`,
    };
  }

  return { allowed: true, reason: "Within automated adjustment range" };
}
