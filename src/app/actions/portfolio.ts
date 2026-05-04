"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/dal";
import { pool } from "@/lib/db";

export type ProductActionState =
  | { ok: true; productId: string }
  | { ok: false; message: string }
  | undefined;

async function changeProductStatus(
  formData: FormData,
  targetStatus: string,
  agentTask: string,
): Promise<ProductActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Session expired. Please sign in again." };
  }

  const productId = formData.get("product_id");
  if (typeof productId !== "string" || productId.length === 0) {
    return { ok: false, message: "Missing product id." };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const lookup = await client.query<{
      id: string;
      slug: string;
      status: string;
    }>(
      `SELECT id::text AS id, slug, status
         FROM products
        WHERE id = $1::uuid AND owner_user_id = $2::uuid
        FOR UPDATE`,
      [productId, user.id],
    );
    const row = lookup.rows[0];
    if (!row) {
      await client.query("ROLLBACK");
      return { ok: false, message: "Product not found in your portfolio." };
    }

    if (row.status === targetStatus) {
      await client.query("ROLLBACK");
      return { ok: false, message: `Product is already ${targetStatus}.` };
    }

    await client.query(
      `UPDATE products SET status = $1, updated_at = NOW() WHERE id = $2::uuid`,
      [targetStatus, row.id],
    );

    await client.query(
      `INSERT INTO agent_runs
         (product_id, agent, task_name, input, status, cost_eur)
       VALUES
         ($1::uuid, 'Portfolio Control', $2, $3::jsonb, 'ok', 0)`,
      [
        row.id,
        agentTask,
        JSON.stringify({
          slug: row.slug,
          previous_status: row.status,
          new_status: targetStatus,
          actor: user.id,
          at: new Date().toISOString(),
        }),
      ],
    );

    await client.query("COMMIT");

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/portfolio");
    revalidatePath("/dashboard/pipeline");

    return { ok: true, productId: row.id };
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch { /* */ }
    console.error(`[${agentTask}] failed:`, err);
    return { ok: false, message: "Operation failed. Please try again." };
  } finally {
    client.release();
  }
}

export async function pauseProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  return changeProductStatus(formData, "paused", "product_paused");
}

export async function resumeProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  return changeProductStatus(formData, "live", "product_resumed");
}

export async function killProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  return changeProductStatus(formData, "killed", "product_killed");
}
