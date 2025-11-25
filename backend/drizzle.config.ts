import dotenv from "dotenv";
import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";

// Only load .env if it exists (local dev)
// In production, variables are provided by the environment
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing in drizzle.config.ts");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
} satisfies Config);
