import "server-only";

import { pool } from "@/lib/db";
import { log } from "@/lib/log";
import { getMonitorQueue } from "./queues";

export async function scheduleMonitoringJobs(): Promise<number> {
  const queue = getMonitorQueue();
  if (!queue) {
    log.info("Scheduler skipped — Redis not available");
    return 0;
  }

  const { rows } = await pool.query<{
    id: string;
    slug: string;
    schedule_cron: string;
  }>(
    `SELECT DISTINCT p.id::text AS id, p.slug,
            COALESCE(MIN(ds.schedule_cron), '0 * * * *') AS schedule_cron
       FROM products p
       JOIN data_sources ds ON ds.product_id = p.id AND ds.enabled = TRUE
      WHERE p.status = 'live'
      GROUP BY p.id, p.slug`,
  );

  let scheduled = 0;
  for (const product of rows) {
    const jobId = `monitor:${product.id}`;

    await queue.upsertJobScheduler(
      jobId,
      { pattern: product.schedule_cron },
      {
        name: `monitor-${product.slug}`,
        data: { productId: product.id },
      },
    );
    scheduled++;
  }

  log.info({ scheduled }, "Monitoring jobs scheduled");
  return scheduled;
}

export async function enqueueMonitorJob(productId: string): Promise<boolean> {
  const queue = getMonitorQueue();
  if (!queue) return false;

  await queue.add(`monitor-adhoc-${productId}`, { productId }, {
    removeOnComplete: 100,
    removeOnFail: 50,
  });
  return true;
}
