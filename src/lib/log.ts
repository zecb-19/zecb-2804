import pino from "pino";

export const log = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  base: {
    service: process.env.OTEL_SERVICE_NAME || "zecb",
    env: process.env.NODE_ENV || "development",
  },
});
