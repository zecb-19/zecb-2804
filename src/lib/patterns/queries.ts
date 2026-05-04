import "server-only";
import { pool } from "@/lib/db";

export type PatternRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  version: string;
  status: string;
  source_product_slug: string | null;
  used_in_builds: number;
  complexity: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export async function listPatterns(filters?: {
  category?: string;
  status?: string;
  search?: string;
}): Promise<PatternRow[]> {
  const wheres: string[] = [];
  const params: unknown[] = [];

  if (filters?.category && filters.category !== "all") {
    params.push(filters.category);
    wheres.push(`pt.category = $${params.length}`);
  }
  if (filters?.status && filters.status !== "all") {
    params.push(filters.status);
    wheres.push(`pt.status = $${params.length}`);
  }
  if (filters?.search) {
    params.push(`%${filters.search}%`);
    wheres.push(`(pt.name ILIKE $${params.length} OR pt.description ILIKE $${params.length})`);
  }

  const whereClause = wheres.length > 0 ? "WHERE " + wheres.join(" AND ") : "";

  const { rows } = await pool.query<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    category: string;
    version: string;
    status: string;
    source_product_slug: string | null;
    used_in_builds: string;
    complexity: string;
    tags: string;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT pt.id::text AS id,
            pt.slug,
            pt.name,
            pt.description,
            pt.category,
            pt.version,
            pt.status,
            sp.slug AS source_product_slug,
            pt.used_in_builds::text AS used_in_builds,
            pt.complexity,
            pt.tags::text AS tags,
            pt.created_at::text AS created_at,
            pt.updated_at::text AS updated_at
       FROM patterns pt
       LEFT JOIN products sp ON sp.id = pt.source_product_id
       ${whereClause}
      ORDER BY pt.category, pt.name`,
    params,
  );

  return rows.map((r) => {
    let tags: string[] = [];
    try { tags = JSON.parse(r.tags); } catch { /* */ }
    return {
      ...r,
      used_in_builds: Number(r.used_in_builds),
      tags,
    };
  });
}

export async function listPatternCategories(): Promise<{ category: string; count: number }[]> {
  const { rows } = await pool.query<{ category: string; count: string }>(
    `SELECT category, COUNT(*)::text AS count
       FROM patterns
      GROUP BY category
      ORDER BY count DESC, category`,
  );
  return rows.map((r) => ({ category: r.category, count: Number(r.count) }));
}

export type PatternCandidateRow = {
  id: string;
  product_id: string | null;
  product_slug: string | null;
  pattern_name: string;
  description: string | null;
  reason: string | null;
  category: string;
  status: string;
  reviewer_note: string | null;
  reviewed_at: string | null;
  flagged_at: string;
};

export async function listPatternCandidates(
  userId: string,
  statusFilter: "pending" | "all" = "pending",
): Promise<PatternCandidateRow[]> {
  const statusClause = statusFilter === "pending"
    ? "AND pc.status = 'pending'"
    : "";

  const { rows } = await pool.query<{
    id: string;
    product_id: string | null;
    product_slug: string | null;
    pattern_name: string;
    description: string | null;
    reason: string | null;
    category: string;
    status: string;
    reviewer_note: string | null;
    reviewed_at: string | null;
    flagged_at: string;
  }>(
    `SELECT pc.id::text AS id,
            pc.product_id::text AS product_id,
            p.slug AS product_slug,
            pc.pattern_name,
            pc.description,
            pc.reason,
            pc.category,
            pc.status,
            pc.reviewer_note,
            pc.reviewed_at::text AS reviewed_at,
            pc.flagged_at::text AS flagged_at
       FROM pattern_candidates pc
       LEFT JOIN products p ON p.id = pc.product_id
      WHERE (p.owner_user_id = $1::uuid OR pc.product_id IS NULL)
        ${statusClause}
      ORDER BY pc.flagged_at DESC`,
    [userId],
  );
  return rows;
}

export async function getPatternStats(): Promise<{
  total: number;
  active: number;
  categories: number;
  pending_candidates: number;
}> {
  const { rows: pr } = await pool.query<{ total: string; active: string; categories: string }>(
    `SELECT COUNT(*)::text AS total,
            COUNT(*) FILTER (WHERE status = 'active')::text AS active,
            COUNT(DISTINCT category)::text AS categories
       FROM patterns`,
  );
  const { rows: cr } = await pool.query<{ pending: string }>(
    `SELECT COUNT(*)::text AS pending FROM pattern_candidates WHERE status = 'pending'`,
  );
  return {
    total: Number(pr[0]?.total ?? 0),
    active: Number(pr[0]?.active ?? 0),
    categories: Number(pr[0]?.categories ?? 0),
    pending_candidates: Number(cr[0]?.pending ?? 0),
  };
}
