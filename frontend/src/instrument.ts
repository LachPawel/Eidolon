import * as Sentry from "@sentry/react";

// Environment detection (Vite uses MODE, but we can also use a custom env var)
const environment = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE || "development";

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

// Session replay sample rate per environment
const getReplaysSampleRate = (): number => {
  switch (environment) {
    case "production":
      return 0.1; // 10% in production
    case "staging":
      return 0.5; // 50% in staging
    case "development":
    default:
      return 1.0; // 100% in development
  }
};

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,

  // Setting this option to true will send default PII data to Sentry.
  sendDefaultPii: true,

  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],

  // Tracing
  tracesSampleRate: getTracesSampleRate(),

  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/.*\.up\.railway\.app/],

  // Session Replay
  replaysSessionSampleRate: getReplaysSampleRate(),
  replaysOnErrorSampleRate: 1.0, // 100% when errors occur

  // Environment
  environment,
});

console.log(
  `Sentry initialized (environment: ${environment}, traces: ${getTracesSampleRate() * 100}%)`
);

export { Sentry };
