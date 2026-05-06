import "server-only";

import { pool } from "@/lib/db";
import { log } from "@/lib/log";

export type CdpEvent = {
  product_id: string;
  event: string;
  distinct_id?: string;
  person_id?: string;
  channel?: string;
  campaign_id?: string;
  creative_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_variant_id?: string;
  properties?: Record<string, unknown>;
};

const POSTHOG_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://eu.posthog.com";

export async function trackEvent(event: CdpEvent): Promise<void> {
  await pool.query(
    `INSERT INTO cdp_events
       (product_id, event, distinct_id, person_id, channel, campaign_id,
        creative_id, utm_source, utm_medium, utm_campaign, landing_variant_id, properties)
     VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)`,
    [
      event.product_id,
      event.event,
      event.distinct_id ?? null,
      event.person_id ?? null,
      event.channel ?? null,
      event.campaign_id ?? null,
      event.creative_id ?? null,
      event.utm_source ?? null,
      event.utm_medium ?? null,
      event.utm_campaign ?? null,
      event.landing_variant_id ?? null,
      JSON.stringify(event.properties ?? {}),
    ],
  );

  if (POSTHOG_KEY) {
    try {
      await globalThis.fetch(`${POSTHOG_HOST}/capture/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: POSTHOG_KEY,
          event: event.event,
          distinct_id: event.distinct_id || "anonymous",
          properties: {
            product_id: event.product_id,
            channel: event.channel,
            ...event.properties,
          },
        }),
        signal: AbortSignal.timeout(5_000),
      });
    } catch (err) {
      log.warn({ error: (err as Error).message }, "PostHog capture failed");
    }
  }
}

export type AttributionResult = {
  product_id: string;
  channel: string;
  first_touch_credit: number;
  last_touch_credit: number;
  middle_touch_credit: number;
  total_credit: number;
  conversions: number;
  cost_eur: number;
  cac_eur: number | null;
};

/**
 * Position-based multi-touch attribution: 40% first, 40% last, 20% middle.
 * 60-day window. Computed from cdp_events in our DB (owned attribution).
 */
export async function computeAttribution(
  productId: string,
  windowDays: number = 60,
): Promise<AttributionResult[]> {
  const { rows: conversions } = await pool.query<{
    person_id: string;
    converted_at: string;
  }>(
    `SELECT DISTINCT person_id, MIN(created_at)::text AS converted_at
       FROM cdp_events
      WHERE product_id = $1::uuid
        AND event IN ('subscribe', 'trial_start', 'signup')
        AND person_id IS NOT NULL
        AND created_at >= NOW() - INTERVAL '${windowDays} days'
      GROUP BY person_id`,
    [productId],
  );

  const channelCredits: Record<string, { first: number; last: number; middle: number; conversions: number }> = {};

  for (const conv of conversions) {
    const { rows: touches } = await pool.query<{ channel: string; created_at: string }>(
      `SELECT COALESCE(channel, utm_source, 'direct') AS channel, created_at::text AS created_at
         FROM cdp_events
        WHERE product_id = $1::uuid
          AND (person_id = $2 OR distinct_id = $2)
          AND created_at <= $3::timestamptz
          AND created_at >= $3::timestamptz - INTERVAL '${windowDays} days'
          AND channel IS NOT NULL
        ORDER BY created_at`,
      [productId, conv.person_id, conv.converted_at],
    );

    if (touches.length === 0) continue;

    const firstChannel = touches[0].channel;
    const lastChannel = touches[touches.length - 1].channel;

    (channelCredits[firstChannel] ??= { first: 0, last: 0, middle: 0, conversions: 0 }).first += 0.4;
    (channelCredits[lastChannel] ??= { first: 0, last: 0, middle: 0, conversions: 0 }).last += 0.4;
    channelCredits[lastChannel].conversions++;

    const middleTouches = touches.slice(1, -1);
    const middleCredit = middleTouches.length > 0 ? 0.2 / middleTouches.length : 0;
    for (const t of middleTouches) {
      (channelCredits[t.channel] ??= { first: 0, last: 0, middle: 0, conversions: 0 }).middle += middleCredit;
    }
  }

  return Object.entries(channelCredits).map(([channel, credits]) => ({
    product_id: productId,
    channel,
    first_touch_credit: credits.first,
    last_touch_credit: credits.last,
    middle_touch_credit: credits.middle,
    total_credit: credits.first + credits.last + credits.middle,
    conversions: credits.conversions,
    cost_eur: 0,
    cac_eur: null,
  }));
}
