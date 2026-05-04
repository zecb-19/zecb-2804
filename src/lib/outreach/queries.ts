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
