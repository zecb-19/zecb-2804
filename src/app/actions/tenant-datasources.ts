"use server";

import { revalidatePath } from "next/cache";

import { ensureSchema, pool } from "@/lib/db";
import { readTenantSession } from "@/lib/tenant/session";
import { runMonitoringCycle } from "@/lib/monitoring/pipeline";

export type DataSourceState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

export async function createDataSourceAction(
  _prev: DataSourceState,
  formData: FormData,
): Promise<DataSourceState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };

  const name = (formData.get("name") as string)?.trim();
  const kind = (formData.get("kind") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();
  const rateLimit = Number(formData.get("rate_limit") || 60);

  if (!name || name.length < 2) return { ok: false, message: "Name is required (min 2 characters)." };
  if (!kind) return { ok: false, message: "Source type is required." };

  const validKinds = ["http_api", "webscrape", "rss", "csv_upload", "pdf_watch", "email_inbound", "google_sheets"];
  if (!validKinds.includes(kind)) return { ok: false, message: "Invalid source type." };

  if ((kind === "http_api" || kind === "webscrape" || kind === "rss" || kind === "pdf_watch") && !url) {
    return { ok: false, message: "URL is required for this source type." };
  }

  try {
    await ensureSchema();
    const config = url ? { url } : {};

    await pool.query(
      `INSERT INTO data_sources (product_id, kind, name, config, rate_limit_per_hour)
       VALUES ($1::uuid, $2, $3, $4::jsonb, $5)`,
      [session.productId, kind, name, JSON.stringify(config), rateLimit],
    );

    revalidatePath(`/product/${session.productSlug}`);
    return { ok: true, message: "Data source created." };
  } catch (err) {
    console.error("[createDataSource] failed:", err);
    return { ok: false, message: "Failed to create data source." };
  }
}

export async function deleteDataSourceAction(
  _prev: DataSourceState,
  formData: FormData,
): Promise<DataSourceState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };

  const sourceId = formData.get("source_id") as string;
  if (!sourceId) return { ok: false, message: "Source ID is required." };

  try {
    await ensureSchema();
    await pool.query(
      `DELETE FROM data_sources WHERE id = $1::uuid AND product_id = $2::uuid`,
      [sourceId, session.productId],
    );
    revalidatePath(`/product/${session.productSlug}`);
    return { ok: true, message: "Data source deleted." };
  } catch (err) {
    console.error("[deleteDataSource] failed:", err);
    return { ok: false, message: "Failed to delete data source." };
  }
}

export async function runMonitoringAction(
  _prev: DataSourceState,
  formData: FormData,
): Promise<DataSourceState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Not authenticated." };

  try {
    await ensureSchema();

    const { rows } = await pool.query<{ slug: string }>(
      `SELECT slug FROM products WHERE id = $1::uuid AND status = 'live'`,
      [session.productId],
    );
    if (!rows[0]) return { ok: false, message: "Product is not live." };

    const stats = await runMonitoringCycle(session.productId);

    revalidatePath(`/product/${session.productSlug}`);
    return {
      ok: true,
      message: `Fetched ${stats.sources_fetched} sources, stored ${stats.observations_stored} observations, evaluated ${stats.rules_evaluated} rules, triggered ${stats.alerts_triggered} alerts.`,
    };
  } catch (err) {
    console.error("[runMonitoring] failed:", err);
    return { ok: false, message: `Monitoring failed: ${(err as Error).message}` };
  }
}
