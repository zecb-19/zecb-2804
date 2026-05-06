import "server-only";
import { pool } from "@/lib/db";

export type DataSourceRow = {
  id: string;
  kind: string;
  name: string;
  config: Record<string, unknown>;
  rate_limit_per_hour: number;
  schedule_cron: string;
  enabled: boolean;
  last_fetch_at: string | null;
  last_fetch_status: string | null;
  observations_count: number;
  created_at: string;
};

export async function listDataSourcesForProduct(productId: string): Promise<DataSourceRow[]> {
  const { rows } = await pool.query<{
    id: string;
    kind: string;
    name: string;
    config: string;
    rate_limit_per_hour: number;
    schedule_cron: string;
    enabled: boolean;
    last_fetch_at: string | null;
    last_fetch_status: string | null;
    observations_count: string;
    created_at: string;
  }>(
    `SELECT ds.id::text AS id, ds.kind, ds.name,
            ds.config::text AS config,
            ds.rate_limit_per_hour, ds.schedule_cron, ds.enabled,
            ds.last_fetch_at::text AS last_fetch_at,
            ds.last_fetch_status,
            COALESCE(oc.cnt, 0)::text AS observations_count,
            ds.created_at::text AS created_at
       FROM data_sources ds
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS cnt FROM observations WHERE data_source_id = ds.id
       ) oc ON true
      WHERE ds.product_id = $1::uuid
      ORDER BY ds.created_at`,
    [productId],
  );

  return rows.map((r) => {
    let config: Record<string, unknown> = {};
    try { config = JSON.parse(r.config); } catch { /* */ }
    return {
      ...r,
      config,
      observations_count: Number(r.observations_count),
    };
  });
}

export type ObservationRow = {
  id: string;
  data_source_name: string;
  observed_at: string;
  dimensions: Record<string, string>;
  measures: Record<string, number | string | boolean>;
  fetch_duration_ms: number | null;
};

export async function listObservationsForProduct(
  productId: string,
  limit = 50,
): Promise<ObservationRow[]> {
  const { rows } = await pool.query<{
    id: string;
    data_source_name: string;
    observed_at: string;
    dimensions: string;
    measures: string;
    fetch_duration_ms: number | null;
  }>(
    `SELECT o.id::text AS id,
            ds.name AS data_source_name,
            o.observed_at::text AS observed_at,
            o.dimensions::text AS dimensions,
            o.measures::text AS measures,
            o.fetch_duration_ms
       FROM observations o
       JOIN data_sources ds ON ds.id = o.data_source_id
      WHERE o.product_id = $1::uuid
      ORDER BY o.observed_at DESC
      LIMIT $2`,
    [productId, limit],
  );

  return rows.map((r) => ({
    ...r,
    dimensions: JSON.parse(r.dimensions),
    measures: JSON.parse(r.measures),
  }));
}

export type AlertRow = {
  id: string;
  rule_name: string;
  message: string;
  channels: string[];
  status: string;
  notified_at: string | null;
  created_at: string;
};

export async function listAlertsForProduct(
  productId: string,
  limit = 50,
): Promise<AlertRow[]> {
  const { rows } = await pool.query<{
    id: string;
    rule_name: string;
    message: string;
    channels: string;
    status: string;
    notified_at: string | null;
    created_at: string;
  }>(
    `SELECT a.id::text AS id,
            ar.name AS rule_name,
            a.message,
            a.channels::text AS channels,
            a.status,
            a.notified_at::text AS notified_at,
            a.created_at::text AS created_at
       FROM alerts a
       JOIN alert_rules ar ON ar.id = a.rule_id
      WHERE a.product_id = $1::uuid
      ORDER BY a.created_at DESC
      LIMIT $2`,
    [productId, limit],
  );

  return rows.map((r) => ({
    ...r,
    channels: JSON.parse(r.channels),
  }));
}

export type AlertRuleRow = {
  id: string;
  name: string;
  description: string | null;
  data_source_name: string | null;
  condition_type: string;
  condition_config: Record<string, unknown>;
  notify_channels: string[];
  throttle_minutes: number;
  enabled: boolean;
  last_triggered_at: string | null;
};

export async function listAlertRulesForProduct(productId: string): Promise<AlertRuleRow[]> {
  const { rows } = await pool.query<{
    id: string;
    name: string;
    description: string | null;
    data_source_name: string | null;
    condition_type: string;
    condition_config: string;
    notify_channels: string;
    throttle_minutes: number;
    enabled: boolean;
    last_triggered_at: string | null;
  }>(
    `SELECT ar.id::text AS id, ar.name, ar.description,
            ds.name AS data_source_name,
            ar.condition_type,
            ar.condition_config::text AS condition_config,
            ar.notify_channels::text AS notify_channels,
            ar.throttle_minutes, ar.enabled,
            ar.last_triggered_at::text AS last_triggered_at
       FROM alert_rules ar
       LEFT JOIN data_sources ds ON ds.id = ar.data_source_id
      WHERE ar.product_id = $1::uuid
      ORDER BY ar.created_at`,
    [productId],
  );

  return rows.map((r) => ({
    ...r,
    condition_config: JSON.parse(r.condition_config),
    notify_channels: JSON.parse(r.notify_channels),
  }));
}

export type MonitoringSummary = {
  data_sources: number;
  observations_total: number;
  observations_today: number;
  alert_rules: number;
  alerts_total: number;
  alerts_today: number;
};

export async function getMonitoringSummary(productId: string): Promise<MonitoringSummary> {
  const [ds, obs, obsToday, rules, alerts, alertsToday] = await Promise.all([
    pool.query<{ n: string }>(
      "SELECT COUNT(*)::text AS n FROM data_sources WHERE product_id = $1::uuid",
      [productId],
    ),
    pool.query<{ n: string }>(
      "SELECT COUNT(*)::text AS n FROM observations WHERE product_id = $1::uuid",
      [productId],
    ),
    pool.query<{ n: string }>(
      "SELECT COUNT(*)::text AS n FROM observations WHERE product_id = $1::uuid AND observed_at >= CURRENT_DATE",
      [productId],
    ),
    pool.query<{ n: string }>(
      "SELECT COUNT(*)::text AS n FROM alert_rules WHERE product_id = $1::uuid",
      [productId],
    ),
    pool.query<{ n: string }>(
      "SELECT COUNT(*)::text AS n FROM alerts WHERE product_id = $1::uuid",
      [productId],
    ),
    pool.query<{ n: string }>(
      "SELECT COUNT(*)::text AS n FROM alerts WHERE product_id = $1::uuid AND created_at >= CURRENT_DATE",
      [productId],
    ),
  ]);

  return {
    data_sources: Number(ds.rows[0]?.n ?? 0),
    observations_total: Number(obs.rows[0]?.n ?? 0),
    observations_today: Number(obsToday.rows[0]?.n ?? 0),
    alert_rules: Number(rules.rows[0]?.n ?? 0),
    alerts_total: Number(alerts.rows[0]?.n ?? 0),
    alerts_today: Number(alertsToday.rows[0]?.n ?? 0),
  };
}
