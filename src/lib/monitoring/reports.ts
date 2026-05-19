import "server-only";

import { pool } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { log } from "@/lib/log";

export async function generateDailyDigest(productId: string): Promise<void> {
  const { rows: productRows } = await pool.query<{
    slug: string;
    name: string;
    owner_email: string;
    owner_name: string;
  }>(
    `SELECT p.slug, p.name, u.email AS owner_email, u.name AS owner_name
       FROM products p JOIN users u ON u.id = p.owner_user_id
      WHERE p.id = $1::uuid`,
    [productId],
  );
  const product = productRows[0];
  if (!product) return;

  const [alertsRes, obsRes, sourcesRes] = await Promise.all([
    pool.query<{ cnt: string; latest: string | null }>(
      `SELECT COUNT(*)::text AS cnt,
              MAX(created_at)::text AS latest
         FROM alerts
        WHERE product_id = $1::uuid
          AND created_at > NOW() - INTERVAL '24 hours'`,
      [productId],
    ),
    pool.query<{ cnt: string }>(
      `SELECT COUNT(*)::text AS cnt
         FROM observations
        WHERE product_id = $1::uuid
          AND observed_at > NOW() - INTERVAL '24 hours'`,
      [productId],
    ),
    pool.query<{ total: string; healthy: string }>(
      `SELECT COUNT(*)::text AS total,
              COUNT(*) FILTER (WHERE last_fetch_status = 'ok')::text AS healthy
         FROM data_sources
        WHERE product_id = $1::uuid AND enabled = TRUE`,
      [productId],
    ),
  ]);

  const alertCount = Number(alertsRes.rows[0]?.cnt ?? 0);
  const obsCount = Number(obsRes.rows[0]?.cnt ?? 0);
  const totalSources = Number(sourcesRes.rows[0]?.total ?? 0);
  const healthySources = Number(sourcesRes.rows[0]?.healthy ?? 0);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e5e5">
    <h2 style="color:#1a1a2e;margin:0 0 4px">Daily Digest</h2>
    <p style="color:#666;font-size:14px;margin:0 0 24px">${esc(product.name)} — ${new Date().toISOString().slice(0, 10)}</p>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:12px 16px;background:#f8f9fa;border-radius:8px;text-align:center">
          <div style="font-size:28px;font-weight:700;color:#1a1a2e">${alertCount}</div>
          <div style="font-size:12px;color:#666;margin-top:2px">Alerts (24h)</div>
        </td>
        <td style="width:12px"></td>
        <td style="padding:12px 16px;background:#f8f9fa;border-radius:8px;text-align:center">
          <div style="font-size:28px;font-weight:700;color:#1a1a2e">${obsCount}</div>
          <div style="font-size:12px;color:#666;margin-top:2px">Observations</div>
        </td>
        <td style="width:12px"></td>
        <td style="padding:12px 16px;background:#f8f9fa;border-radius:8px;text-align:center">
          <div style="font-size:28px;font-weight:700;color:${healthySources === totalSources ? '#16a34a' : '#dc2626'}">${healthySources}/${totalSources}</div>
          <div style="font-size:12px;color:#666;margin-top:2px">Sources OK</div>
        </td>
      </tr>
    </table>
    ${alertCount > 0 ? '<p style="margin-top:20px;font-size:14px;color:#333">Check your dashboard for alert details.</p>' : '<p style="margin-top:20px;font-size:14px;color:#16a34a">All quiet — no alerts triggered in the last 24 hours.</p>'}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
    <p style="font-size:12px;color:#999">${esc(product.name)} · Daily Digest · <a href="#unsubscribe" style="color:#999">Unsubscribe</a></p>
  </div>
</body></html>`;

  await sendEmail({
    to: product.owner_email,
    subject: `${product.name} Daily: ${alertCount} alerts, ${obsCount} observations`,
    html,
  });

  await pool.query(
    `INSERT INTO agent_runs (product_id, agent, task_name, input, status, cost_eur)
     VALUES ($1::uuid, 'Report Agent', 'daily_digest', $2::jsonb, 'ok', 0)`,
    [productId, JSON.stringify({ alerts: alertCount, observations: obsCount, sources: `${healthySources}/${totalSources}` })],
  );

  log.info({ productId, alertCount, obsCount }, "Daily digest sent");
}

export async function generateWeeklyDigest(productId: string): Promise<void> {
  const { rows: productRows } = await pool.query<{
    slug: string;
    name: string;
    owner_email: string;
    owner_name: string;
  }>(
    `SELECT p.slug, p.name, u.email AS owner_email, u.name AS owner_name
       FROM products p JOIN users u ON u.id = p.owner_user_id
      WHERE p.id = $1::uuid`,
    [productId],
  );
  const product = productRows[0];
  if (!product) return;

  const [alertsRes, obsRes, alertsTrend, sourcesRes] = await Promise.all([
    pool.query<{ cnt: string }>(
      `SELECT COUNT(*)::text AS cnt FROM alerts
       WHERE product_id = $1::uuid AND created_at > NOW() - INTERVAL '7 days'`,
      [productId],
    ),
    pool.query<{ cnt: string }>(
      `SELECT COUNT(*)::text AS cnt FROM observations
       WHERE product_id = $1::uuid AND observed_at > NOW() - INTERVAL '7 days'`,
      [productId],
    ),
    pool.query<{ cnt: string }>(
      `SELECT COUNT(*)::text AS cnt FROM alerts
       WHERE product_id = $1::uuid
         AND created_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'`,
      [productId],
    ),
    pool.query<{ total: string; healthy: string }>(
      `SELECT COUNT(*)::text AS total,
              COUNT(*) FILTER (WHERE last_fetch_status = 'ok')::text AS healthy
         FROM data_sources WHERE product_id = $1::uuid AND enabled = TRUE`,
      [productId],
    ),
  ]);

  const alertCount = Number(alertsRes.rows[0]?.cnt ?? 0);
  const prevAlertCount = Number(alertsTrend.rows[0]?.cnt ?? 0);
  const obsCount = Number(obsRes.rows[0]?.cnt ?? 0);
  const totalSources = Number(sourcesRes.rows[0]?.total ?? 0);
  const healthySources = Number(sourcesRes.rows[0]?.healthy ?? 0);

  const trendPct = prevAlertCount > 0
    ? Math.round(((alertCount - prevAlertCount) / prevAlertCount) * 100)
    : 0;
  const trendLabel = trendPct > 0 ? `+${trendPct}%` : trendPct < 0 ? `${trendPct}%` : "flat";
  const trendColor = trendPct > 20 ? "#dc2626" : trendPct < -20 ? "#16a34a" : "#666";

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e5e5">
    <h2 style="color:#1a1a2e;margin:0 0 4px">Weekly Digest</h2>
    <p style="color:#666;font-size:14px;margin:0 0 24px">${esc(product.name)} — Week of ${new Date().toISOString().slice(0, 10)}</p>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:16px;background:#f8f9fa;border-radius:8px;text-align:center">
          <div style="font-size:32px;font-weight:700;color:#1a1a2e">${alertCount}</div>
          <div style="font-size:12px;color:#666">Alerts (7d)</div>
          <div style="font-size:11px;color:${trendColor};margin-top:4px">vs prev week: ${trendLabel}</div>
        </td>
        <td style="width:12px"></td>
        <td style="padding:16px;background:#f8f9fa;border-radius:8px;text-align:center">
          <div style="font-size:32px;font-weight:700;color:#1a1a2e">${obsCount}</div>
          <div style="font-size:12px;color:#666">Observations</div>
        </td>
        <td style="width:12px"></td>
        <td style="padding:16px;background:#f8f9fa;border-radius:8px;text-align:center">
          <div style="font-size:32px;font-weight:700;color:${healthySources === totalSources ? '#16a34a' : '#dc2626'}">${healthySources}/${totalSources}</div>
          <div style="font-size:12px;color:#666">Sources OK</div>
        </td>
      </tr>
    </table>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
    <p style="font-size:12px;color:#999">${esc(product.name)} · Weekly Digest · <a href="#unsubscribe" style="color:#999">Unsubscribe</a></p>
  </div>
</body></html>`;

  await sendEmail({
    to: product.owner_email,
    subject: `${product.name} Weekly: ${alertCount} alerts (${trendLabel})`,
    html,
  });

  await pool.query(
    `INSERT INTO agent_runs (product_id, agent, task_name, input, status, cost_eur)
     VALUES ($1::uuid, 'Report Agent', 'weekly_digest', $2::jsonb, 'ok', 0)`,
    [productId, JSON.stringify({ alerts: alertCount, trend: trendLabel, observations: obsCount })],
  );

  log.info({ productId, alertCount, trendLabel }, "Weekly digest sent");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
