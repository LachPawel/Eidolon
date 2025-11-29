import "dotenv/config";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Debug: Check if DSN is loaded
console.log("Sentry DSN loaded:", process.env.SENTRY_DSN ? "Yes" : "No (missing!)");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],

  // Send structured logs to Sentry
  // enableLogs: true,

  // Tracing - capture 100% in dev, reduce in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Profiling
  profileSessionSampleRate: 1.0,
  profileLifecycle: "trace",

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Send default PII (IP address, etc.)
  sendDefaultPii: true,
});

console.log("Sentry instrumentation initialized");
