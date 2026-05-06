import "server-only";

import { pool } from "@/lib/db";
import { log } from "@/lib/log";
import { createDataSource, type FetchContext, type NormalizedObservation } from "./datasource";
import { evaluateRule, type RuleConfig } from "./rules";
import { dispatchNotifications, type NotificationChannel } from "./notifications";

export async function runMonitoringCycle(productId: string): Promise<{
  sources_fetched: number;
  observations_stored: number;
  rules_evaluated: number;
  alerts_triggered: number;
}> {
  const stats = {
    sources_fetched: 0,
    observations_stored: 0,
    rules_evaluated: 0,
    alerts_triggered: 0,
  };

  const { rows: sources } = await pool.query<{
    id: string;
    kind: string;
    name: string;
    config: string;
  }>(
    `SELECT id::text AS id, kind, name, config::text AS config
       FROM data_sources
      WHERE product_id = $1::uuid AND enabled = TRUE`,
    [productId],
  );

  const { rows: product } = await pool.query<{ slug: string }>(
    "SELECT slug FROM products WHERE id = $1::uuid",
    [productId],
  );
  const productSlug = product[0]?.slug ?? "unknown";

  for (const source of sources) {
    try {
      const connector = createDataSource(source.kind);
      const config = JSON.parse(source.config);
      const context: FetchContext = {
        sourceId: source.id,
        productId,
        config,
      };

      const result = await connector.fetch(context);
      stats.sources_fetched++;

      await pool.query(
        `UPDATE data_sources SET last_fetch_at = NOW(), last_fetch_status = 'ok' WHERE id = $1::uuid`,
        [source.id],
      );

      const observations = await connector.normalize(result, context);

      for (const obs of observations) {
        await pool.query(
          `INSERT INTO observations (data_source_id, product_id, observed_at, dimensions, measures, fetch_duration_ms)
           VALUES ($1::uuid, $2::uuid, $3::timestamptz, $4::jsonb, $5::jsonb, $6)`,
          [
            obs.data_source_id,
            productId,
            obs.observed_at,
            JSON.stringify(obs.dimensions),
            JSON.stringify(obs.measures),
            result.fetch_duration_ms,
          ],
        );
        stats.observations_stored++;
      }

      const triggered = await evaluateRulesForSource(
        productId,
        productSlug,
        source.id,
        observations,
      );
      stats.rules_evaluated += triggered.evaluated;
      stats.alerts_triggered += triggered.triggered;

    } catch (err) {
      log.error(
        { sourceId: source.id, kind: source.kind, error: (err as Error).message },
        "Data source fetch failed",
      );
      await pool.query(
        `UPDATE data_sources SET last_fetch_at = NOW(), last_fetch_status = $1 WHERE id = $2::uuid`,
        [(err as Error).message.slice(0, 255), source.id],
      );
    }
  }

  await pool.query(
    `INSERT INTO agent_runs
       (product_id, agent, task_name, input, status, cost_eur)
     VALUES
       ($1::uuid, 'Monitor Agent', 'monitoring_cycle', $2::jsonb, 'ok', 0)`,
    [
      productId,
      JSON.stringify(stats),
    ],
  );

  return stats;
}

async function evaluateRulesForSource(
  productId: string,
  productSlug: string,
  sourceId: string,
  currentObservations: NormalizedObservation[],
): Promise<{ evaluated: number; triggered: number }> {
  let evaluated = 0;
  let triggered = 0;

  const { rows: rules } = await pool.query<{
    id: string;
    name: string;
    condition_type: string;
    condition_config: string;
    notify_channels: string;
    throttle_minutes: number;
    last_triggered_at: string | null;
  }>(
    `SELECT id::text AS id, name, condition_type, condition_config::text AS condition_config,
            notify_channels::text AS notify_channels, throttle_minutes,
            last_triggered_at::text AS last_triggered_at
       FROM alert_rules
      WHERE product_id = $1::uuid
        AND (data_source_id = $2::uuid OR data_source_id IS NULL)
        AND enabled = TRUE`,
    [productId, sourceId],
  );

  const { rows: previousObs } = await pool.query<{
    dimensions: string;
    measures: string;
    observed_at: string;
  }>(
    `SELECT dimensions::text AS dimensions, measures::text AS measures,
            observed_at::text AS observed_at
       FROM observations
      WHERE data_source_id = $1::uuid AND product_id = $2::uuid
      ORDER BY observed_at DESC
      LIMIT 20`,
    [sourceId, productId],
  );

  const previous: NormalizedObservation[] = previousObs.map((r) => ({
    data_source_id: sourceId,
    observed_at: r.observed_at,
    dimensions: JSON.parse(r.dimensions),
    measures: JSON.parse(r.measures),
  }));

  for (const rule of rules) {
    for (const obs of currentObservations) {
      evaluated++;

      if (rule.last_triggered_at) {
        const lastTriggered = new Date(rule.last_triggered_at).getTime();
        const throttleMs = rule.throttle_minutes * 60_000;
        if (Date.now() - lastTriggered < throttleMs) continue;
      }

      const config: RuleConfig = {
        condition_type: rule.condition_type as RuleConfig["condition_type"],
        ...JSON.parse(rule.condition_config),
      };

      const result = evaluateRule(config, obs, previous);

      if (result.triggered) {
        triggered++;

        const channels: NotificationChannel[] = JSON.parse(rule.notify_channels);

        const { rows: alertRows } = await pool.query<{ id: string }>(
          `INSERT INTO alerts (rule_id, product_id, observation_id, channels, message, context)
           VALUES ($1::uuid, $2::uuid, NULL, $3::jsonb, $4, $5::jsonb)
           RETURNING id::text AS id`,
          [
            rule.id,
            productId,
            JSON.stringify(channels),
            result.message,
            JSON.stringify(result.details),
          ],
        );

        await pool.query(
          `UPDATE alert_rules SET last_triggered_at = NOW() WHERE id = $1::uuid`,
          [rule.id],
        );

        const alertId = alertRows[0]?.id;
        if (alertId) {
          await dispatchNotifications({
            alertId,
            ruleId: rule.id,
            ruleName: rule.name,
            productId,
            productSlug,
            message: result.message,
            details: result.details,
            channels,
          });
        }
      }
    }
  }

  return { evaluated, triggered };
}
