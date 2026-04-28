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
  })().catch((err) => {
    global.__zecbSchemaInit = undefined;
    throw err;
  });
  return global.__zecbSchemaInit;
}
