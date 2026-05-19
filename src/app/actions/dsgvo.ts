"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";

import { ensureSchema, pool } from "@/lib/db";
import { readTenantSession, deleteTenantSession } from "@/lib/tenant/session";

export type DsgvoActionState =
  | { ok: true; message: string; data?: string }
  | { ok: false; message: string }
  | undefined;

export async function requestDataExportAction(
  _prev: DsgvoActionState,
  _formData: FormData,
): Promise<DsgvoActionState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Nicht authentifiziert." };

  try {
    await ensureSchema();

    const [tenant, sources, observations, rules, alerts] = await Promise.all([
      pool.query(
        `SELECT email, name, plan, notify_channels::text, created_at
         FROM tenants WHERE id = $1::uuid`,
        [session.tenantId],
      ),
      pool.query(
        `SELECT kind, name, config::text, enabled, created_at
         FROM data_sources WHERE product_id = $1::uuid ORDER BY created_at`,
        [session.productId],
      ),
      pool.query(
        `SELECT o.observed_at, ds.name AS source, o.dimensions::text, o.measures::text
         FROM observations o
         JOIN data_sources ds ON ds.id = o.data_source_id
         WHERE o.product_id = $1::uuid
         ORDER BY o.observed_at DESC LIMIT 50000`,
        [session.productId],
      ),
      pool.query(
        `SELECT name, condition_type, condition_config::text, notify_channels::text,
                throttle_minutes, enabled, created_at
         FROM alert_rules WHERE product_id = $1::uuid ORDER BY created_at`,
        [session.productId],
      ),
      pool.query(
        `SELECT a.created_at, ar.name AS rule_name, a.message, a.status, a.channels::text
         FROM alerts a
         JOIN alert_rules ar ON ar.id = a.rule_id
         WHERE a.product_id = $1::uuid
         ORDER BY a.created_at DESC LIMIT 50000`,
        [session.productId],
      ),
    ]);

    const exportData = {
      personal_data: tenant.rows[0] ?? null,
      data_sources: sources.rows,
      observations: observations.rows,
      alert_rules: rules.rows,
      alerts: alerts.rows,
      metadata: {
        exported_at: new Date().toISOString(),
        format_version: "1.0",
        legal_basis: "DSGVO Art. 15 — Auskunftsrecht",
      },
    };

    await pool.query(
      `INSERT INTO dsgvo_audit_log (action, email_hash, product_id, details)
       VALUES ('auskunftsrecht', $1, $2::uuid, $3::jsonb)`,
      [
        crypto.createHash("sha256").update(session.email).digest("hex").slice(0, 16),
        session.productId,
        JSON.stringify({ tenant_id: session.tenantId }),
      ],
    );

    return {
      ok: true,
      message: "Ihre Daten wurden exportiert.",
      data: JSON.stringify(exportData, null, 2),
    };
  } catch (err) {
    console.error("[dsgvo:auskunft] failed:", err);
    return { ok: false, message: "Export fehlgeschlagen." };
  }
}

export async function requestDataPortabilityAction(
  _prev: DsgvoActionState,
  _formData: FormData,
): Promise<DsgvoActionState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Nicht authentifiziert." };

  try {
    await ensureSchema();

    const [tenant, sources, observations, rules, alerts] = await Promise.all([
      pool.query(
        `SELECT email, name, plan, notify_channels, created_at FROM tenants WHERE id = $1::uuid`,
        [session.tenantId],
      ),
      pool.query(
        `SELECT kind, name, config, enabled, created_at FROM data_sources WHERE product_id = $1::uuid`,
        [session.productId],
      ),
      pool.query(
        `SELECT o.observed_at, o.dimensions, o.measures
         FROM observations o WHERE o.product_id = $1::uuid
         ORDER BY o.observed_at DESC LIMIT 50000`,
        [session.productId],
      ),
      pool.query(
        `SELECT name, condition_type, condition_config, notify_channels, throttle_minutes, enabled
         FROM alert_rules WHERE product_id = $1::uuid`,
        [session.productId],
      ),
      pool.query(
        `SELECT a.created_at, a.message, a.status, a.channels
         FROM alerts a WHERE a.product_id = $1::uuid
         ORDER BY a.created_at DESC LIMIT 50000`,
        [session.productId],
      ),
    ]);

    const envelope = {
      schema: "urn:zecb:dsgvo:portability:v1",
      personal_data: tenant.rows[0] ?? null,
      data_sources: sources.rows,
      observations: observations.rows,
      alert_rules: rules.rows,
      alerts: alerts.rows,
      metadata: {
        exported_at: new Date().toISOString(),
        format_version: "1.0",
        legal_basis: "DSGVO Art. 20 — Datenportabilität",
      },
    };

    await pool.query(
      `INSERT INTO dsgvo_audit_log (action, email_hash, product_id, details)
       VALUES ('portability', $1, $2::uuid, $3::jsonb)`,
      [
        crypto.createHash("sha256").update(session.email).digest("hex").slice(0, 16),
        session.productId,
        JSON.stringify({ tenant_id: session.tenantId }),
      ],
    );

    return {
      ok: true,
      message: "Datenportabilitäts-Export erstellt (JSON).",
      data: JSON.stringify(envelope, null, 2),
    };
  } catch (err) {
    console.error("[dsgvo:portability] failed:", err);
    return { ok: false, message: "Export fehlgeschlagen." };
  }
}

export async function requestDataDeletionAction(
  _prev: DsgvoActionState,
  formData: FormData,
): Promise<DsgvoActionState> {
  const session = await readTenantSession();
  if (!session) return { ok: false, message: "Nicht authentifiziert." };

  const confirmation = formData.get("confirmation") as string;
  if (confirmation !== "LOESCHEN") {
    return {
      ok: false,
      message: 'Bitte geben Sie "LOESCHEN" ein, um die Löschung zu bestätigen.',
    };
  }

  try {
    await ensureSchema();

    const emailHash = crypto
      .createHash("sha256")
      .update(session.email)
      .digest("hex")
      .slice(0, 16);

    await pool.query(
      `INSERT INTO dsgvo_audit_log (action, email_hash, product_id, details)
       VALUES ('loeschung', $1, $2::uuid, $3::jsonb)`,
      [
        emailHash,
        session.productId,
        JSON.stringify({
          tenant_id: session.tenantId,
          email_hash: emailHash,
          requested_at: new Date().toISOString(),
        }),
      ],
    );

    await pool.query(
      `DELETE FROM alerts WHERE product_id = $1::uuid AND rule_id IN
        (SELECT id FROM alert_rules WHERE product_id = $1::uuid)`,
      [session.productId],
    );
    await pool.query(`DELETE FROM alert_rules WHERE product_id = $1::uuid`, [
      session.productId,
    ]);
    await pool.query(`DELETE FROM observations WHERE product_id = $1::uuid`, [
      session.productId,
    ]);
    await pool.query(`DELETE FROM data_sources WHERE product_id = $1::uuid`, [
      session.productId,
    ]);
    await pool.query(`DELETE FROM tenants WHERE id = $1::uuid`, [
      session.tenantId,
    ]);

    await deleteTenantSession();
    redirect(`/product/${session.productSlug}`);
  } catch (err) {
    if ((err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
      throw err;
    console.error("[dsgvo:loeschung] failed:", err);
    return { ok: false, message: "Löschung fehlgeschlagen. Bitte kontaktieren Sie den Support." };
  }
}
