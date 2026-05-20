import "server-only";
import { pool } from "@/lib/db";

export type OutreachQueueItem = {
  id: string;
  product_id: string | null;
  product_slug: string | null;
  item_type: string;
  title: string;
  description: string | null;
  channel: string | null;
  content_preview: string | null;
  metadata: Record<string, unknown>;
  status: string;
  reviewer_note: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export async function listOutreachQueueItems(
  userId: string,
  filters?: { item_type?: string; status?: string },
): Promise<OutreachQueueItem[]> {
  const wheres = [
    "p.owner_user_id = $1::uuid",
  ];
  const params: unknown[] = [userId];

  if (filters?.item_type && filters.item_type !== "all") {
    params.push(filters.item_type);
    wheres.push(`oqi.item_type = $${params.length}`);
  }
  if (filters?.status && filters.status !== "all") {
    params.push(filters.status);
    wheres.push(`oqi.status = $${params.length}`);
  }

  const { rows } = await pool.query<{
    id: string;
    product_id: string | null;
    product_slug: string | null;
    item_type: string;
    title: string;
    description: string | null;
    channel: string | null;
    content_preview: string | null;
    metadata: string;
    status: string;
    reviewer_note: string | null;
    reviewed_at: string | null;
    created_at: string;
  }>(
    `SELECT oqi.id::text AS id,
            oqi.product_id::text AS product_id,
            p.slug AS product_slug,
            oqi.item_type,
            oqi.title,
            oqi.description,
            oqi.channel,
            oqi.content_preview,
            oqi.metadata::text AS metadata,
            oqi.status,
            oqi.reviewer_note,
            oqi.reviewed_at::text AS reviewed_at,
            oqi.created_at::text AS created_at
       FROM outreach_queue_items oqi
       JOIN products p ON p.id = oqi.product_id
      WHERE ${wheres.join(" AND ")}
      ORDER BY oqi.created_at DESC`,
    params,
  );

  return rows.map((r) => {
    let metadata: Record<string, unknown> = {};
    try { metadata = JSON.parse(r.metadata); } catch { /* */ }
    return { ...r, metadata };
  });
}

export type OutreachQueueStats = {
  total_pending: number;
  content_pending: number;
  propagation_pending: number;
  channel_pending: number;
  approved_this_week: number;
  rejected_this_week: number;
};

export async function getOutreachQueueStats(
  userId: string,
): Promise<OutreachQueueStats> {
  const { rows } = await pool.query<{
    total_pending: string;
    content_pending: string;
    propagation_pending: string;
    channel_pending: string;
    approved_this_week: string;
    rejected_this_week: string;
  }>(
    `SELECT
       COUNT(*) FILTER (WHERE oqi.status = 'pending')::text AS total_pending,
       COUNT(*) FILTER (WHERE oqi.status = 'pending' AND oqi.item_type = 'content')::text AS content_pending,
       COUNT(*) FILTER (WHERE oqi.status = 'pending' AND oqi.item_type = 'propagation')::text AS propagation_pending,
       COUNT(*) FILTER (WHERE oqi.status = 'pending' AND oqi.item_type = 'channel_proposal')::text AS channel_pending,
       COUNT(*) FILTER (WHERE oqi.status = 'approved' AND oqi.reviewed_at >= date_trunc('week', NOW()))::text AS approved_this_week,
       COUNT(*) FILTER (WHERE oqi.status = 'rejected' AND oqi.reviewed_at >= date_trunc('week', NOW()))::text AS rejected_this_week
     FROM outreach_queue_items oqi
     JOIN products p ON p.id = oqi.product_id
    WHERE p.owner_user_id = $1::uuid`,
    [userId],
  );
  const r = rows[0];
  return {
    total_pending: Number(r?.total_pending ?? 0),
    content_pending: Number(r?.content_pending ?? 0),
    propagation_pending: Number(r?.propagation_pending ?? 0),
    channel_pending: Number(r?.channel_pending ?? 0),
    approved_this_week: Number(r?.approved_this_week ?? 0),
    rejected_this_week: Number(r?.rejected_this_week ?? 0),
  };
}

/* ─── Outreach Performance ────────────────────────────────────── */

export type ChannelPerformance = {
  channel: string;
  impressions: number;
  clicks: number;
  signups: number;
  conversions: number;
  spend_eur: number;
  cac_eur: number | null;
};

export type ContentPerformanceItem = {
  id: string;
  title: string;
  category: string;
  type: "article" | "social";
  platform?: string;
  word_count?: number;
  status: string;
  engagement: number;
  created_at: string;
};

export type OutreachPerformanceData = {
  channels: ChannelPerformance[];
  top_content: ContentPerformanceItem[];
  total_cdp_events: number;
  total_email_sent: number;
  total_email_opened: number;
};

export async function getOutreachPerformance(userId: string): Promise<OutreachPerformanceData> {
  const [channelRows, articleRows, socialRows, cdpCount, emailStats] = await Promise.all([
    pool.query<{ channel: string; impressions: string; clicks: string; signups: string; conversions: string; spend_eur: string; cac_eur: string | null }>(
      `SELECT ods.channel,
              SUM(ods.impressions)::text AS impressions,
              SUM(ods.clicks)::text AS clicks,
              SUM(ods.signups)::text AS signups,
              SUM(ods.conversions)::text AS conversions,
              SUM(ods.spend_eur)::text AS spend_eur,
              CASE WHEN SUM(ods.conversions) > 0 THEN (SUM(ods.spend_eur) / SUM(ods.conversions))::text ELSE NULL END AS cac_eur
         FROM outreach_daily_stats ods
         JOIN products p ON p.id = ods.product_id
        WHERE p.owner_user_id = $1::uuid AND ods.day >= CURRENT_DATE - 30
        GROUP BY ods.channel ORDER BY SUM(ods.spend_eur) DESC`,
      [userId],
    ),
    pool.query<{ id: string; title: string; category: string; word_count: number; status: string; created_at: string }>(
      `SELECT ca.id::text, ca.title, ca.category, ca.word_count, ca.status, ca.created_at::text
         FROM content_articles ca
         JOIN products p ON p.id = ca.product_id
        WHERE p.owner_user_id = $1::uuid
        ORDER BY ca.created_at DESC LIMIT 10`,
      [userId],
    ),
    pool.query<{ id: string; content: string; platform: string; status: string; engagement: string; created_at: string }>(
      `SELECT sp.id::text, LEFT(sp.content, 80) AS content, sp.platform, sp.status,
              COALESCE((sp.engagement->>'likes')::int, 0) + COALESCE((sp.engagement->>'shares')::int, 0) AS engagement,
              sp.created_at::text
         FROM social_posts sp
         JOIN products p ON p.id = sp.product_id
        WHERE p.owner_user_id = $1::uuid
        ORDER BY sp.created_at DESC LIMIT 10`,
      [userId],
    ),
    pool.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM cdp_events ce JOIN products p ON p.id = ce.product_id WHERE p.owner_user_id = $1::uuid`,
      [userId],
    ),
    pool.query<{ sent: string; opened: string }>(
      `SELECT COUNT(*) FILTER (WHERE ese.status = 'sent')::text AS sent,
              COUNT(*) FILTER (WHERE ese.opened_at IS NOT NULL)::text AS opened
         FROM email_sequence_events ese
         JOIN products p ON p.id = ese.product_id
        WHERE p.owner_user_id = $1::uuid`,
      [userId],
    ),
  ]);

  const topContent: ContentPerformanceItem[] = [
    ...articleRows.rows.map((r) => ({ id: r.id, title: r.title, category: r.category, type: "article" as const, word_count: r.word_count, status: r.status, engagement: 0, created_at: r.created_at })),
    ...socialRows.rows.map((r) => ({ id: r.id, title: r.content, category: r.platform, type: "social" as const, platform: r.platform, status: r.status, engagement: Number(r.engagement), created_at: r.created_at })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

  return {
    channels: channelRows.rows.map((r) => ({
      channel: r.channel,
      impressions: Number(r.impressions),
      clicks: Number(r.clicks),
      signups: Number(r.signups),
      conversions: Number(r.conversions),
      spend_eur: Number(r.spend_eur),
      cac_eur: r.cac_eur ? Number(r.cac_eur) : null,
    })),
    top_content: topContent,
    total_cdp_events: Number(cdpCount.rows[0]?.n ?? 0),
    total_email_sent: Number(emailStats.rows[0]?.sent ?? 0),
    total_email_opened: Number(emailStats.rows[0]?.opened ?? 0),
  };
}
