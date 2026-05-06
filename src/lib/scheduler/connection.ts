import IORedis from "ioredis";

let connection: IORedis | null = null;

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
  });

  connection.on("error", (err) => {
    console.error("[redis] connection error:", err.message);
  });

  return connection;
}
