/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

// CI-specific config without browser tests
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      routeFileIgnorePattern: ".spec.tsx$",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.spec.{ts,tsx}"],
    exclude: [
      "**/*.stories.tsx",
      "node_modules/**",
      "src/components/articles/FieldBuilder.spec.tsx",
      "src/components/articles/ArticleForm.spec.tsx",
      "src/components/articles/ArticleRow.spec.tsx",
      "src/components/shopfloor/ArticleList.spec.tsx",
      "src/components/shopfloor/EntryForm.spec.tsx",
      "src/components/production/ProductionBoard.spec.tsx",
    ],
  },
});
