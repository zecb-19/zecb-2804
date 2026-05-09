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
  // Check tenants table columns
  const { rows: cols } = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'tenants' ORDER BY ordinal_position`
  );
  console.log("tenants columns:", cols.map(c => c.column_name).join(", "));

  // Find the product
  const { rows: products } = await pool.query(
    `SELECT id::text, slug, status FROM products WHERE slug = 'buybox-watcher-amazon-de' LIMIT 1`
  );
  if (!products.length) { console.error("Product not found"); process.exit(1); }
  const product = products[0];
  console.log("Product:", product);

  // Create tenant
  const hash = await bcrypt.hash("test1234", 10);
  const { rows } = await pool.query(
    `INSERT INTO tenants (product_id, email, name, password_hash)
     VALUES ($1::uuid, $2, $3, $4)
     ON CONFLICT DO NOTHING
     RETURNING id::text AS id`,
    [product.id, "test@example.com", "Test Customer", hash]
  );
  if (rows.length) {
    console.log("Tenant created:", rows[0].id);
  } else {
    console.log("Tenant already exists (or insert skipped).");
  }
  console.log("\nLogin credentials:");
  console.log("  Email:    test@example.com");
  console.log("  Password: test1234");
} catch(e) {
  console.error("Error:", e.message);
} finally {
  await pool.end();
}
