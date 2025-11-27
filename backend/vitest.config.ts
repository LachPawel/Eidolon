import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**", "drizzle.config.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
