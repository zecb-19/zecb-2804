import IORedis from "ioredis";

let connection: IORedis | null = null;
let lastErrorLog = 0;

export function getRedisConnection(): IORedis | null {
  if (connection) return connection;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.log("[scheduler] REDIS_URL not set — BullMQ disabled, use /api/monitor for manual triggers");
    return null;
  }

  connection = new IORedis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 500, 30_000);
      return delay;
    },
    reconnectOnError() {
      return true;
    },
  });

  connection.on("error", (err) => {
    const now = Date.now();
    if (now - lastErrorLog > 30_000) {
      console.error("[redis] connection error:", err.message);
      lastErrorLog = now;
    }
  });

  return connection;
}
