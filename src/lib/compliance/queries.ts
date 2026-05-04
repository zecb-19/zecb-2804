import "server-only";
import { pool } from "@/lib/db";

export type ComplianceCheck = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  required_for: string;
  status: string;
  evidence_note: string | null;
  checked_at: string | null;
  checked_by: string | null;
};

export async function listComplianceChecks(): Promise<ComplianceCheck[]> {
  const { rows } = await pool.query<{
    id: string;
    category: string;
    name: string;
    description: string | null;
    required_for: string;
    status: string;
    evidence_note: string | null;
    checked_at: string | null;
    checked_by: string | null;
  }>(
    `SELECT id, category, name, description, required_for, status,
            evidence_note,
            checked_at::text AS checked_at,
            checked_by::text AS checked_by
       FROM compliance_checks
      ORDER BY
        CASE category
          WHEN 'dsgvo' THEN 1
          WHEN 'email' THEN 2
          WHEN 'content' THEN 3
          WHEN 'audit' THEN 4
          WHEN 'cold_email' THEN 5
          ELSE 6
        END,
        name`,
  );
  return rows;
}

export type ComplianceSummary = {
  total: number;
  complete: number;
  in_progress: number;
  not_started: number;
  v1_total: number;
  v1_complete: number;
  v2_total: number;
  v2_complete: number;
};

export async function getComplianceSummary(): Promise<ComplianceSummary> {
  const { rows } = await pool.query<{
    total: string;
    complete: string;
    in_progress: string;
    not_started: string;
    v1_total: string;
    v1_complete: string;
    v2_total: string;
    v2_complete: string;
  }>(
    `SELECT
       COUNT(*)::text AS total,
       COUNT(*) FILTER (WHERE status = 'complete')::text AS complete,
       COUNT(*) FILTER (WHERE status = 'in_progress')::text AS in_progress,
       COUNT(*) FILTER (WHERE status = 'not_started')::text AS not_started,
       COUNT(*) FILTER (WHERE required_for = 'v1')::text AS v1_total,
       COUNT(*) FILTER (WHERE required_for = 'v1' AND status = 'complete')::text AS v1_complete,
       COUNT(*) FILTER (WHERE required_for = 'v2')::text AS v2_total,
       COUNT(*) FILTER (WHERE required_for = 'v2' AND status = 'complete')::text AS v2_complete
     FROM compliance_checks`,
  );
  const r = rows[0];
  return {
    total: Number(r?.total ?? 0),
    complete: Number(r?.complete ?? 0),
    in_progress: Number(r?.in_progress ?? 0),
    not_started: Number(r?.not_started ?? 0),
    v1_total: Number(r?.v1_total ?? 0),
    v1_complete: Number(r?.v1_complete ?? 0),
    v2_total: Number(r?.v2_total ?? 0),
    v2_complete: Number(r?.v2_complete ?? 0),
  };
}

export type UnsubscribeStats = {
  total_entries: number;
  last_entry_at: string | null;
};

export async function getUnsubscribeStats(): Promise<UnsubscribeStats> {
  const { rows } = await pool.query<{
    total_entries: string;
    last_entry_at: string | null;
  }>(
    `SELECT COUNT(*)::text AS total_entries,
            MAX(created_at)::text AS last_entry_at
       FROM unsubscribes`,
  );
  return {
    total_entries: Number(rows[0]?.total_entries ?? 0),
    last_entry_at: rows[0]?.last_entry_at ?? null,
  };
}
