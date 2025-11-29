import "dotenv/config";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Environment detection
const environment = process.env.NODE_ENV || "development";

// Traces sample rate per environment
const getTracesSampleRate = (): number => {
  switch (environment) {
    case "production":
      return 0.8; // 80% in production to save quota
    case "staging":
      return 1.0; // 100% in staging to catch everything
    case "development":
    default:
      return 1.0; // 100% in development
  }
};

// Debug: Check if DSN is loaded
console.log(`Sentry DSN loaded: ${process.env.SENTRY_DSN ? "Yes" : "No (missing!)"}`);
console.log(`Sentry environment: ${environment}`);

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],

  // Tracing
  tracesSampleRate: getTracesSampleRate(),

  // Profiling
  profileSessionSampleRate: 1.0,
  profileLifecycle: "trace",

  // Environment tag for filtering in Sentry dashboard
  environment,

  // Send default PII (IP address, etc.)
  sendDefaultPii: true,
});

console.log(`Sentry instrumentation initialized (traces: ${getTracesSampleRate() * 100}%)`);
