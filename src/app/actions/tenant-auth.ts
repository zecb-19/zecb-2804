"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { ensureSchema, pool } from "@/lib/db";
import {
  createTenantSession,
  deleteTenantSession,
} from "@/lib/tenant/session";

export type TenantAuthState =
  | { ok: true }
  | { ok: false; message: string }
  | undefined;

export async function tenantSignupAction(
  _prev: TenantAuthState,
  formData: FormData,
): Promise<TenantAuthState> {
  const productSlug = formData.get("product_slug") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!productSlug || !name || !email || !password) {
    return { ok: false, message: "All fields are required." };
  }
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }

  try {
    await ensureSchema();

    const { rows: productRows } = await pool.query<{ id: string; slug: string }>(
      "SELECT id::text AS id, slug FROM products WHERE slug = $1 AND status = 'live'",
      [productSlug],
    );
    const product = productRows[0];
    if (!product) return { ok: false, message: "Product not found." };

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO tenants (product_id, email, name, password_hash)
       VALUES ($1::uuid, $2, $3, $4)
       RETURNING id::text AS id`,
      [product.id, email, name, hash],
    );
    const tenantId = rows[0]?.id;
    if (!tenantId) return { ok: false, message: "Could not create account." };

    await createTenantSession({
      tenantId,
      productId: product.id,
      productSlug: product.slug,
      email,
      name,
    });

    return { ok: true };
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return { ok: false, message: "An account with this email already exists." };
    }
    console.error("[tenantSignup] failed:", err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

export async function tenantSigninAction(
  _prev: TenantAuthState,
  formData: FormData,
): Promise<TenantAuthState> {
  const productSlug = formData.get("product_slug") as string;
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!productSlug || !email || !password) {
    return { ok: false, message: "Email and password are required." };
  }

  try {
    await ensureSchema();

    const { rows } = await pool.query<{
      id: string;
      product_id: string;
      name: string;
      password_hash: string;
    }>(
      `SELECT t.id::text AS id, t.product_id::text AS product_id,
              t.name, t.password_hash
         FROM tenants t
         JOIN products p ON p.id = t.product_id
        WHERE p.slug = $1 AND t.email = $2
        LIMIT 1`,
      [productSlug, email],
    );
    const tenant = rows[0];
    if (!tenant) return { ok: false, message: "Invalid email or password." };

    const valid = await bcrypt.compare(password, tenant.password_hash);
    if (!valid) return { ok: false, message: "Invalid email or password." };

    await pool.query(
      "UPDATE tenants SET last_login_at = NOW() WHERE id = $1::uuid",
      [tenant.id],
    );

    await createTenantSession({
      tenantId: tenant.id,
      productId: tenant.product_id,
      productSlug,
      email,
      name: tenant.name,
    });

    return { ok: true };
  } catch (err) {
    console.error("[tenantSignin] failed:", err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

export async function tenantSignoutAction(slug: string): Promise<void> {
  await deleteTenantSession();
  redirect(`/product/${slug}`);
}
