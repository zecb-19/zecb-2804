import { Worker, type Job } from "bullmq";
import { getRedisConnection } from "./connection";
import { runMonitoringCycle } from "@/lib/monitoring/pipeline";
import { log } from "@/lib/log";
import type { MonitorJobData, BuildJobData } from "./queues";

let monitorWorker: Worker | null = null;
let buildWorker: Worker | null = null;

export function startMonitorWorker(): Worker | null {
  if (monitorWorker) return monitorWorker;
  const conn = getRedisConnection();
  if (!conn) return null;

  monitorWorker = new Worker<MonitorJobData>(
    "zecb:monitor",
    async (job: Job<MonitorJobData>) => {
      const { productId } = job.data;
      log.info({ productId, jobId: job.id }, "Monitor job starting");

      const stats = await runMonitoringCycle(productId);

      log.info({ productId, jobId: job.id, ...stats }, "Monitor job complete");
      return stats;
    },
    {
      connection: conn,
      concurrency: 5,
      limiter: { max: 10, duration: 60_000 },
    },
  );

  monitorWorker.on("failed", (job, err) => {
    log.error({ jobId: job?.id, error: err.message }, "Monitor job failed");
  });

  log.info("Monitor worker started");
  return monitorWorker;
}

export function startBuildWorker(): Worker | null {
  if (buildWorker) return buildWorker;
  const conn = getRedisConnection();
  if (!conn) return null;

  buildWorker = new Worker<BuildJobData>(
    "zecb:build",
    async (job: Job<BuildJobData>) => {
      const { productId, step } = job.data;
      log.info({ productId, step, jobId: job.id }, "Build job starting");
      // Build orchestrator steps will be wired here
      log.info({ productId, step, jobId: job.id }, "Build job complete");
    },
    {
      connection: conn,
      concurrency: 2,
    },
  );

  buildWorker.on("failed", (job, err) => {
    log.error({ jobId: job?.id, error: err.message }, "Build job failed");
  });

  log.info("Build worker started");
  return buildWorker;
}

export async function stopWorkers(): Promise<void> {
  await monitorWorker?.close();
  await buildWorker?.close();
  monitorWorker = null;
  buildWorker = null;
}
