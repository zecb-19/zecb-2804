import "server-only";

import { pool } from "@/lib/db";
import { log } from "@/lib/log";
import type { CoreMessagePayload } from "./core-message";

/* ─── Types ──────────────────────────────────────────────────── */

export type GoogleAdsCampaign = {
  campaign_name: string;
  campaign_type: "search" | "performance_max";
  product_id: string;
  budget_daily_eur: number;
  bidding_strategy: "target_cpa" | "maximize_conversions";
  target_cpa_eur?: number;
  ad_groups: GoogleAdsAdGroup[];
  negative_keywords: string[];
};

export type GoogleAdsAdGroup = {
  name: string;
  keyword_tier: "high_intent" | "category" | "competitor";
  keywords: GoogleAdsKeyword[];
  responsive_search_ad: ResponsiveSearchAd;
  landing_page_path: string;
};

export type GoogleAdsKeyword = {
  text: string;
  match_type: "BROAD" | "PHRASE" | "EXACT";
};

export type ResponsiveSearchAd = {
  headlines: string[];
  descriptions: string[];
  final_url: string;
  path1?: string;
  path2?: string;
};

export type GoogleAdsExtensions = {
  sitelinks: Array<{ text: string; url: string; description1: string; description2: string }>;
  callouts: string[];
  structured_snippets: { header: string; values: string[] };
};

/* ─── Campaign Generation ────────────────────────────────────── */

const NEGATIVE_KEYWORDS = [
  "jobs", "karriere", "stellenangebot", "kostenlos", "free", "gratis",
  "tutorial", "definition", "was ist", "what is", "wikipedia",
  "erklärung", "bedeutung", "studium", "ausbildung",
];

export async function generateGoogleAdsCampaign(
  productId: string,
): Promise<GoogleAdsCampaign> {
  const { rows } = await pool.query<{
    slug: string;
    name: string;
    tagline: string | null;
    payload: string;
  }>(
    `SELECT p.slug, p.name, p.tagline, cm.payload::text AS payload
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const landingBase = `${appUrl}/p/${product.slug}`;

  const highIntentKeywords: GoogleAdsKeyword[] = persona.pains.slice(0, 5).map((pain) => ({
    text: pain.toLowerCase().replace(/[^a-zäöüß\s]/g, "").trim(),
    match_type: "PHRASE" as const,
  }));

  const categoryKeywords: GoogleAdsKeyword[] = [
    { text: `${product.slug.replace(/-/g, " ")} software`, match_type: "BROAD" },
    { text: `${product.slug.replace(/-/g, " ")} tool`, match_type: "BROAD" },
    { text: "monitoring software", match_type: "PHRASE" },
    { text: "überwachung tool", match_type: "PHRASE" },
    { text: "automatische benachrichtigung", match_type: "PHRASE" },
  ];

  const headlines = [
    msg.core_promise.tweet.slice(0, 30),
    msg.pain_statements.pointed.slice(0, 30),
    `${product.name}`,
    "Kostenlos testen",
    "In 2 Min. startklar",
    "Automatisches Monitoring",
    msg.pain_statements.calm.slice(0, 30),
    "DSGVO-konform",
    "Sofort benachrichtigt",
    "Keine Installation nötig",
    "24/7 Überwachung",
    `Jetzt ${product.name} testen`,
  ].map((h) => h.slice(0, 30));

  const descriptions = [
    msg.core_promise.sentence.slice(0, 90),
    `${product.name} — ${product.tagline || "Automatisierte Überwachung"}`.slice(0, 90),
    msg.proof_elements[0]?.content.slice(0, 90) ?? "Professionelles Monitoring ohne Programmierung.",
    "Kostenlos starten. Keine Kreditkarte. In 2 Minuten eingerichtet.",
  ].map((d) => d.slice(0, 90));

  const rsa: ResponsiveSearchAd = {
    headlines,
    descriptions,
    final_url: landingBase,
    path1: product.slug.slice(0, 15),
    path2: "testen",
  };

  const campaign: GoogleAdsCampaign = {
    campaign_name: `${product.slug}_search_de_${new Date().toISOString().slice(0, 10)}`,
    campaign_type: "search",
    product_id: productId,
    budget_daily_eur: 20,
    bidding_strategy: "maximize_conversions",
    ad_groups: [
      {
        name: "problem_queries",
        keyword_tier: "high_intent",
        keywords: highIntentKeywords,
        responsive_search_ad: rsa,
        landing_page_path: `/p/${product.slug}/lp/search-problem`,
      },
      {
        name: "category_queries",
        keyword_tier: "category",
        keywords: categoryKeywords,
        responsive_search_ad: rsa,
        landing_page_path: `/p/${product.slug}/lp/search-category`,
      },
    ],
    negative_keywords: NEGATIVE_KEYWORDS,
  };

  await pool.query(
    `INSERT INTO agent_runs (product_id, agent, task_name, input, output, status, cost_eur)
     VALUES ($1::uuid, 'Google Ads Agent', 'generate_campaign', $2::jsonb, $3::jsonb, 'ok', 0)`,
    [
      productId,
      JSON.stringify({ product: product.slug }),
      JSON.stringify({
        campaign: campaign.campaign_name,
        ad_groups: campaign.ad_groups.length,
        keywords: campaign.ad_groups.reduce((n, g) => n + g.keywords.length, 0),
        headlines: headlines.length,
      }),
    ],
  );

  log.info({ productId, campaign: campaign.campaign_name }, "Google Ads campaign generated");
  return campaign;
}

export function generateExtensions(
  productName: string,
  productSlug: string,
  landingBase: string,
): GoogleAdsExtensions {
  return {
    sitelinks: [
      { text: "Features", url: `${landingBase}#features`, description1: "Alle Funktionen", description2: "im Überblick" },
      { text: "Preise", url: `${landingBase}#pricing`, description1: "Transparente Preise", description2: "ab €29/Monat" },
      { text: "FAQ", url: `${landingBase}#faq`, description1: "Häufige Fragen", description2: "schnell beantwortet" },
      { text: "Blog", url: `${landingBase}/blog`, description1: "Tipps & Anleitungen", description2: `rund um ${productName}` },
    ],
    callouts: ["Keine Kreditkarte nötig", "DSGVO-konform", "In 2 Min. startklar", "24/7 Monitoring", "Deutsche Server"],
    structured_snippets: {
      header: "Typen",
      values: ["API-Monitoring", "Web-Scraping", "RSS-Überwachung", "PDF-Tracking", "Preis-Alerts"],
    },
  };
}

/* ─── Google Ads API Deployment ──────────────────────────────── */

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    log.error({ status: res.status }, "Google OAuth token refresh failed");
    return null;
  }

  const data = await res.json() as { access_token?: string };
  return data.access_token ?? null;
}

function apiHeaders(accessToken: string): Record<string, string> {
  return {
    "Authorization": `Bearer ${accessToken}`,
    "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "",
    "Content-Type": "application/json",
    "login-customer-id": process.env.GOOGLE_ADS_CUSTOMER_ID || "",
  };
}

export async function deployCampaignToGoogle(
  campaign: GoogleAdsCampaign,
): Promise<{ campaignResourceName?: string; deployed: boolean }> {
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  if (!customerId) {
    log.info({ campaign: campaign.campaign_name }, "Google Ads deployment skipped — not configured");
    return { deployed: false };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    log.error("Google Ads deployment failed — could not get access token");
    return { deployed: false };
  }

  const apiBase = `https://googleads.googleapis.com/v17/customers/${customerId}`;
  const headers = apiHeaders(accessToken);

  try {
    // Step 1: Create campaign budget
    const budgetRes = await fetch(`${apiBase}/campaignBudgets:mutate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        operations: [{
          create: {
            name: `${campaign.campaign_name}_budget`,
            amountMicros: String(campaign.budget_daily_eur * 1_000_000),
            deliveryMethod: "STANDARD",
          },
        }],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!budgetRes.ok) {
      const err = await budgetRes.text();
      log.error({ status: budgetRes.status, error: err }, "Google Ads budget creation failed");
      return { deployed: false };
    }

    const budgetData = await budgetRes.json() as { results?: Array<{ resourceName: string }> };
    const budgetResourceName = budgetData.results?.[0]?.resourceName;
    if (!budgetResourceName) return { deployed: false };

    // Step 2: Create campaign
    const campaignRes = await fetch(`${apiBase}/campaigns:mutate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        operations: [{
          create: {
            name: campaign.campaign_name,
            advertisingChannelType: campaign.campaign_type === "search" ? "SEARCH" : "PERFORMANCE_MAX",
            status: "PAUSED",
            campaignBudget: budgetResourceName,
            maximizeConversions: {},
            networkSettings: {
              targetGoogleSearch: true,
              targetSearchNetwork: false,
              targetContentNetwork: false,
            },
            geoTargetTypeSetting: {
              positiveGeoTargetType: "PRESENCE",
              negativeGeoTargetType: "PRESENCE_OR_INTEREST",
            },
          },
        }],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!campaignRes.ok) {
      const err = await campaignRes.text();
      log.error({ status: campaignRes.status, error: err }, "Google Ads campaign creation failed");
      return { deployed: false };
    }

    const campaignData = await campaignRes.json() as { results?: Array<{ resourceName: string }> };
    const campaignResourceName = campaignData.results?.[0]?.resourceName;

    await pool.query(
      `INSERT INTO agent_runs (product_id, agent, task_name, input, output, status, cost_eur)
       VALUES ($1::uuid, 'Google Ads Agent', 'deploy_campaign', $2::jsonb, $3::jsonb, 'ok', 0)`,
      [
        campaign.product_id,
        JSON.stringify({ campaign: campaign.campaign_name }),
        JSON.stringify({ resource_name: campaignResourceName, deployed: true }),
      ],
    );

    log.info({ campaignResourceName }, "Google Ads campaign deployed (PAUSED)");
    return { campaignResourceName: campaignResourceName ?? undefined, deployed: true };
  } catch (err) {
    log.error({ error: (err as Error).message }, "Google Ads deployment error");
    return { deployed: false };
  }
}

/* ─── Budget Guardrails (§B.4.3) ─────────────────────────────── */

export function validateGoogleBudgetChange(
  currentDailyEur: number,
  proposedDailyEur: number,
): { allowed: boolean; reason: string } {
  const changePct = Math.abs((proposedDailyEur - currentDailyEur) / currentDailyEur) * 100;
  if (changePct > 50) {
    return { allowed: false, reason: `Budget change of ${changePct.toFixed(0)}% exceeds 50% threshold — requires human approval` };
  }
  return { allowed: true, reason: "Within automated adjustment range" };
}
