import "server-only";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __zecbPgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __zecbSchemaInit: Promise<void> | undefined;
}

function buildPool(): Pool {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set in the environment");
  }
  // Parse explicitly so the `sslmode=require` query param is ignored —
  // recent pg-connection-string treats it as `verify-full`, which fails
  // against AWS RDS's cert chain. We pin our own ssl behavior instead.
  const u = new URL(raw);
  return new Pool({
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 5432,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });
}

export const pool: Pool = global.__zecbPgPool ?? buildPool();
if (!global.__zecbPgPool) global.__zecbPgPool = pool;

export function ensureSchema(): Promise<void> {
  if (global.__zecbSchemaInit) return global.__zecbSchemaInit;
  global.__zecbSchemaInit = (async () => {
    // Postgres 13+ exposes gen_random_uuid() built-in (no pgcrypto needed).
    // The deployed RDS instance is 17.x. UUID PKs are required because the
    // wider schema (tenants, products, etc.) keys on UUIDs everywhere.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);`);
    // Additive migrations — idempotent. Safe to run on every cold start.
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID;`);
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';`,
    );
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;`);
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT FALSE;`,
    );
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;`);

    // --- products / build_specs / agent_runs ----------------------------
    // Per PRD §9 — products registry, BuildSpec history, and the central
    // agent_runs ledger every cost number depends on. CREATE statements
    // mirror the schema already deployed on RDS so a fresh database lands
    // identical to prod; subsequent ALTERs add the columns the BuildSpec
    // form needs without disturbing existing rows.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        tagline TEXT,
        template_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'building',
        mrr_eur INTEGER NOT NULL DEFAULT 0,
        users_count INTEGER NOT NULL DEFAULT 0,
        growth_30d REAL NOT NULL DEFAULT 0,
        palette JSONB NOT NULL DEFAULT '{}'::jsonb,
        current_build_run_id TEXT,
        owner_user_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        phase TEXT NOT NULL DEFAULT 'ignition',
        phase_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS template_version TEXT NOT NULL DEFAULT '1.0.0';`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS build_step INT NOT NULL DEFAULT 1;`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS build_total_steps INT NOT NULL DEFAULT 11;`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS current_step_label TEXT;`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_monthly_opex_eur NUMERIC(10,2);`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS branding JSONB NOT NULL DEFAULT '{}'::jsonb;`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS pricing_tiers JSONB NOT NULL DEFAULT '[]'::jsonb;`,
    );
    await pool.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS products_owner_idx ON products (owner_user_id);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS products_status_idx ON products (status);`,
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS build_specs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        run_id TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        spec_json JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS build_specs_product_idx ON build_specs (product_id);`,
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS agent_runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        build_run_id TEXT,
        agent TEXT NOT NULL,
        task_name TEXT NOT NULL,
        input JSONB NOT NULL DEFAULT '{}'::jsonb,
        output JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL DEFAULT 'ok',
        error_message TEXT,
        llm_model TEXT,
        cost_eur REAL NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS agent_runs_product_idx ON agent_runs (product_id, created_at DESC);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS agent_runs_recent_idx ON agent_runs (created_at DESC);`,
    );
    // Attribute Architect-Agent runs (no product yet) to the operator
    // who triggered them, so the Audit Trail viewer can scope by user.
    await pool.query(
      `ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS owner_user_id UUID;`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS agent_runs_owner_idx ON agent_runs (owner_user_id, created_at DESC);`,
    );

    // --- market_signal_reports (Architect Agent output) ---------------
    // PRD §17.1 U-O-01 + §19 step 3: validated opportunities awaiting
    // operator approval, then promotable to a BuildSpec draft.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS market_signal_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_user_id UUID NOT NULL,
        generation_request_id UUID NOT NULL,
        vertical TEXT NOT NULL,
        persona JSONB NOT NULL DEFAULT '{}'::jsonb,
        opportunity TEXT NOT NULL,
        pain_statement TEXT NOT NULL,
        core_promise TEXT NOT NULL,
        mechanism TEXT,
        suggested_slug TEXT,
        suggested_data_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
        suggested_alert_primitives JSONB NOT NULL DEFAULT '[]'::jsonb,
        suggested_notification_channels JSONB NOT NULL DEFAULT '[]'::jsonb,
        suggested_pricing_tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
        unit_economics JSONB NOT NULL DEFAULT '{}'::jsonb,
        tam_estimate TEXT,
        reasoning TEXT,
        llm_model TEXT,
        cost_eur NUMERIC(10,4) NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        reviewer_note TEXT,
        reviewed_at TIMESTAMPTZ,
        promoted_to_product_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS msr_owner_idx ON market_signal_reports (owner_user_id, created_at DESC);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS msr_status_idx ON market_signal_reports (status);`,
    );
  })().catch((err) => {
    global.__zecbSchemaInit = undefined;
    throw err;
  });
  return global.__zecbSchemaInit;
}
