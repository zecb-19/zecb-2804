import "server-only";
import { cache } from "react";
import { pool } from "@/lib/db";
import { readTenantSession } from "./session";

export type CurrentTenant = {
  id: string;
  productId: string;
  productSlug: string;
  email: string;
  name: string;
  plan: string;
};

export const getCurrentTenant = cache(async (): Promise<CurrentTenant | null> => {
  const session = await readTenantSession();
  if (!session) return null;
  return {
    id: session.tenantId,
    productId: session.productId,
    productSlug: session.productSlug,
    email: session.email,
    name: session.name,
    plan: "free",
  };
});

export type TenantDashboardData = {
  data_sources: number;
  observations_today: number;
  observations_total: number;
  alert_rules: number;
  alerts_today: number;
  alerts_total: number;
  recent_observations: Array<{
    id: string;
    source_name: string;
    observed_at: string;
    dimensions: Record<string, string>;
    measures: Record<string, unknown>;
  }>;
  recent_alerts: Array<{
    id: string;
    rule_name: string;
    message: string;
    status: string;
    created_at: string;
  }>;
};

export async function getTenantDashboard(
  productId: string,
): Promise<TenantDashboardData> {
  const [ds, obsTotal, obsToday, rules, alertsTotal, alertsToday, recentObs, recentAlerts] = await Promise.all([
    pool.query<{ n: string }>("SELECT COUNT(*)::text AS n FROM data_sources WHERE product_id=$1::uuid AND enabled=TRUE", [productId]),
    pool.query<{ n: string }>("SELECT COUNT(*)::text AS n FROM observations WHERE product_id=$1::uuid", [productId]),
    pool.query<{ n: string }>("SELECT COUNT(*)::text AS n FROM observations WHERE product_id=$1::uuid AND observed_at>=CURRENT_DATE", [productId]),
    pool.query<{ n: string }>("SELECT COUNT(*)::text AS n FROM alert_rules WHERE product_id=$1::uuid AND enabled=TRUE", [productId]),
    pool.query<{ n: string }>("SELECT COUNT(*)::text AS n FROM alerts WHERE product_id=$1::uuid", [productId]),
    pool.query<{ n: string }>("SELECT COUNT(*)::text AS n FROM alerts WHERE product_id=$1::uuid AND created_at>=CURRENT_DATE", [productId]),
    pool.query<{ id: string; source_name: string; observed_at: string; dimensions: string; measures: string }>(
      `SELECT o.id::text AS id, ds.name AS source_name, o.observed_at::text AS observed_at,
              o.dimensions::text AS dimensions, o.measures::text AS measures
         FROM observations o JOIN data_sources ds ON ds.id=o.data_source_id
        WHERE o.product_id=$1::uuid ORDER BY o.observed_at DESC LIMIT 10`,
      [productId],
    ),
    pool.query<{ id: string; rule_name: string; message: string; status: string; created_at: string }>(
      `SELECT a.id::text AS id, ar.name AS rule_name, a.message, a.status, a.created_at::text AS created_at
         FROM alerts a JOIN alert_rules ar ON ar.id=a.rule_id
        WHERE a.product_id=$1::uuid ORDER BY a.created_at DESC LIMIT 10`,
      [productId],
    ),
  ]);

  return {
    data_sources: Number(ds.rows[0]?.n ?? 0),
    observations_today: Number(obsToday.rows[0]?.n ?? 0),
    observations_total: Number(obsTotal.rows[0]?.n ?? 0),
    alert_rules: Number(rules.rows[0]?.n ?? 0),
    alerts_today: Number(alertsToday.rows[0]?.n ?? 0),
    alerts_total: Number(alertsTotal.rows[0]?.n ?? 0),
    recent_observations: recentObs.rows.map((r) => ({
      ...r,
      dimensions: JSON.parse(r.dimensions),
      measures: JSON.parse(r.measures),
    })),
    recent_alerts: recentAlerts.rows,
  };
}
