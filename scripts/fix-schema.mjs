import pg from "pg";
import bcrypt from "bcryptjs";

const raw = process.env.DATABASE_URL;
if (!raw) { console.error("DATABASE_URL not set"); process.exit(1); }
const u = new URL(raw);
const pool = new pg.Pool({
  host: u.hostname, port: u.port ? parseInt(u.port, 10) : 5432,
  user: decodeURIComponent(u.username), password: decodeURIComponent(u.password),
  database: u.pathname.replace(/^\//, ""), ssl: { rejectUnauthorized: false }, max: 2,
});

// Tables with real user data — DO NOT touch
// users, products, build_specs, agent_runs, market_signal_reports, templates, password_reset_tokens

// Tables created from old schemas with missing columns — drop and let ensureSchema recreate
const DROP_TABLES = [
  "social_posts",
  "content_articles",
  "email_sequence_events",
  "email_sequences",
  "cdp_events",
  "core_messages",
  "alerts",
  "alert_rules",
  "observations",
  "data_sources",
  "tenants",
  "consent_ledger",
  "unsubscribes",
  "compliance_checks",
  "outreach_queue_items",
  "pattern_candidates",
  "patterns",
];

try {
  console.log("=== Dropping broken tables ===");
  for (const t of DROP_TABLES) {
    await pool.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
    console.log(`  dropped: ${t}`);
  }

  console.log("\n=== Verifying core tables still exist ===");
  const { rows } = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  console.log("  remaining:", rows.map(r => r.tablename).join(", "));

  console.log("\nDone. Restart dev server — ensureSchema will recreate all dropped tables.");
  console.log("Then run: node --env-file=.env.local scripts/create-tenant.mjs");
} catch (e) {
  console.error("Error:", e.message);
} finally {
  await pool.end();
}
