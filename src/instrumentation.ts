export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startMonitorWorker, startBuildWorker } = await import(
      "@/lib/scheduler/worker"
    );
    const { scheduleMonitoringJobs, scheduleDigestJobs } = await import(
      "@/lib/scheduler/scheduler"
    );
    const { log } = await import("@/lib/log");
    const { ensureSchema } = await import("@/lib/db");

    const { initSentry } = await import("@/lib/sentry");
    initSentry();

    try {
      await ensureSchema();

      const monitorWorker = startMonitorWorker();
      const buildWorker = startBuildWorker();

      if (monitorWorker) {
        const monitorCount = await scheduleMonitoringJobs();
        const digestCount = await scheduleDigestJobs();
        log.info(
          { monitorCount, digestCount, workers: [monitorWorker ? "monitor" : null, buildWorker ? "build" : null].filter(Boolean) },
          "ZECB workers started — monitoring is automatic",
        );
      } else {
        log.info("ZECB workers skipped — Redis not available");
      }
    } catch (err) {
      const { log: errLog } = await import("@/lib/log");
      errLog.error({ error: (err as Error).message }, "Failed to start workers");
    }
  }
}
