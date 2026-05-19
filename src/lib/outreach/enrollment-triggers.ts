import "server-only";

import { pool } from "@/lib/db";
import { log } from "@/lib/log";
import {
  createSequenceForProduct,
  enrollUserInSequence,
  type EmailSequenceType,
} from "./lifecycle-email";

async function findOrCreateSequence(
  productId: string,
  type: EmailSequenceType,
): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `SELECT id::text AS id FROM email_sequences
     WHERE product_id = $1::uuid AND sequence_type = $2 AND enabled = TRUE
     LIMIT 1`,
    [productId, type],
  );
  if (rows[0]) return rows[0].id;
  return createSequenceForProduct(productId, type);
}

async function isAlreadyEnrolled(
  sequenceId: string,
  recipientEmail: string,
): Promise<boolean> {
  const { rows } = await pool.query<{ cnt: string }>(
    `SELECT COUNT(*)::text AS cnt FROM email_sequence_events
     WHERE sequence_id = $1::uuid AND recipient_email = $2
       AND status IN ('pending', 'sent')`,
    [sequenceId, recipientEmail],
  );
  return Number(rows[0]?.cnt ?? 0) > 0;
}

export async function checkAndEnrollActivation(
  productId: string,
  tenantId: string,
  email: string,
): Promise<void> {
  try {
    const seqId = await findOrCreateSequence(productId, "activation");
    if (await isAlreadyEnrolled(seqId, email)) return;
    await enrollUserInSequence(seqId, productId, email);
    log.info({ productId, tenantId }, "Enrolled tenant in activation sequence");
  } catch (err) {
    log.error({ productId, tenantId, error: (err as Error).message }, "Activation enrollment failed");
  }
}

export async function checkAndEnrollReEngagement(
  productId: string,
): Promise<number> {
  let enrolled = 0;
  try {
    const { rows } = await pool.query<{ email: string; id: string }>(
      `SELECT email, id::text AS id FROM tenants
       WHERE product_id = $1::uuid
         AND last_login_at < NOW() - INTERVAL '7 days'
         AND last_login_at IS NOT NULL`,
      [productId],
    );

    if (rows.length === 0) return 0;

    const seqId = await findOrCreateSequence(productId, "re_engagement");

    for (const tenant of rows) {
      if (await isAlreadyEnrolled(seqId, tenant.email)) continue;
      await enrollUserInSequence(seqId, productId, tenant.email);
      enrolled++;
    }

    if (enrolled > 0) {
      log.info({ productId, enrolled }, "Enrolled tenants in re-engagement sequence");
    }
  } catch (err) {
    log.error({ productId, error: (err as Error).message }, "Re-engagement enrollment failed");
  }
  return enrolled;
}

export async function checkAndEnrollChurnPrevention(
  productId: string,
  tenantEmail: string,
): Promise<void> {
  try {
    const seqId = await findOrCreateSequence(productId, "churn_prevention");
    if (await isAlreadyEnrolled(seqId, tenantEmail)) return;
    await enrollUserInSequence(seqId, productId, tenantEmail);
    log.info({ productId, tenantEmail }, "Enrolled tenant in churn prevention sequence");
  } catch (err) {
    log.error({ productId, error: (err as Error).message }, "Churn enrollment failed");
  }
}

export async function checkAndEnrollDunning(
  productId: string,
  tenantEmail: string,
): Promise<void> {
  try {
    const seqId = await findOrCreateSequence(productId, "dunning");
    if (await isAlreadyEnrolled(seqId, tenantEmail)) return;
    await enrollUserInSequence(seqId, productId, tenantEmail);
    log.info({ productId, tenantEmail }, "Enrolled tenant in dunning sequence");
  } catch (err) {
    log.error({ productId, error: (err as Error).message }, "Dunning enrollment failed");
  }
}

export async function checkAndEnrollReviewRequest(
  productId: string,
): Promise<number> {
  let enrolled = 0;
  try {
    const { rows } = await pool.query<{ email: string }>(
      `SELECT email FROM tenants
       WHERE product_id = $1::uuid
         AND created_at < NOW() - INTERVAL '30 days'
         AND last_login_at > NOW() - INTERVAL '7 days'`,
      [productId],
    );

    if (rows.length === 0) return 0;

    const { rows: existing } = await pool.query<{ id: string }>(
      `SELECT id::text AS id FROM email_sequences
       WHERE product_id = $1::uuid AND sequence_type = 'review_request' AND enabled = TRUE
       LIMIT 1`,
      [productId],
    );

    if (!existing[0]) return 0;

    for (const tenant of rows) {
      if (await isAlreadyEnrolled(existing[0].id, tenant.email)) continue;
      await enrollUserInSequence(existing[0].id, productId, tenant.email);
      enrolled++;
    }
  } catch (err) {
    log.error({ productId, error: (err as Error).message }, "Review request enrollment failed");
  }
  return enrolled;
}
