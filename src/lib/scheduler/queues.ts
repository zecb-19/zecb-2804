import { Queue } from "bullmq";
import { getRedisConnection } from "./connection";

export type MonitorJobData = {
  productId: string;
  sourceId?: string;
};

export type BuildJobData = {
  productId: string;
  step: number;
};

let monitorQueue: Queue<MonitorJobData> | null = null;
let buildQueue: Queue<BuildJobData> | null = null;

export function getMonitorQueue(): Queue<MonitorJobData> | null {
  if (monitorQueue) return monitorQueue;
  const conn = getRedisConnection();
  if (!conn) return null;
  monitorQueue = new Queue<MonitorJobData>("zecb:monitor", { connection: conn });
  return monitorQueue;
}

export function getBuildQueue(): Queue<BuildJobData> | null {
  if (buildQueue) return buildQueue;
  const conn = getRedisConnection();
  if (!conn) return null;
  buildQueue = new Queue<BuildJobData>("zecb:build", { connection: conn });
  return buildQueue;
}
