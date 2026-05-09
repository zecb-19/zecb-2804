import pg from "pg";
import bcrypt from "bcryptjs";

const raw = process.env.DATABASE_URL;
if (!raw) { console.error("DATABASE_URL not set"); process.exit(1); }
const u = new URL(raw);
const pool = new pg.Pool({
  host: u.hostname, port: u.port ? parseInt(u.port,10) : 5432,
  user: decodeURIComponent(u.username), password: decodeURIComponent(u.password),
  database: u.pathname.replace(/^\//,""), ssl: { rejectUnauthorized: false }, max: 2,
});

try {
  const productId = "302460c5-ed11-4977-bf97-47610b2bc7e4";
  const email = "test@example.com";
  const name = "Test Customer";
  const password = "test1234";

  const hash = await bcrypt.hash(password, 10);

  // Drop the old slug NOT NULL constraint if it exists
  await pool.query(`ALTER TABLE tenants ALTER COLUMN slug DROP NOT NULL;`).catch(() => {});

  const { rows } = await pool.query(
    `INSERT INTO tenants (product_id, email, name, password_hash, slug)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id::text AS id`,
    [productId, email, name, hash, email]
  );

  console.log("Tenant created:", rows[0].id);
  console.log("");
  console.log("=== YOUR LOGIN CREDENTIALS ===");
  console.log("URL:      http://localhost:3003/product/buybox-watcher-amazon-de");
  console.log("Email:    test@example.com");
  console.log("Password: test1234");
} catch(e) {
  console.error("Error:", e.message);
} finally {
  await pool.end();
}
