import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { db } from "../../db/index.js";
import { articles } from "../../db/schema.js";
import { ilike } from "drizzle-orm";
import { searchArticles as algoliaSearch, isAlgoliaConfigured } from "../../services/algolia.js";
import { findSimilarArticles, isPineconeConfigured } from "../../services/pinecone.js";
import {
  measurePerformance,
  compareSearchPerformance,
  generateBenchmarkReport,
  clearMetrics,
} from "../../services/performance.js";

describe("Search Performance Comparison", function () {
  // Increase timeout for API calls
  // this.timeout(30000);

  const testQueries = [
    "Steel",
    "Polymer",
    "Injection",
    "Medical",
    "Chemical",
    "Composite",
    "Alloy",
    "Plastic",
    "Automotive",
    "Component",
  ];

  beforeAll(async function () {
    // Clear previous metrics
    clearMetrics();
    console.log("\n=== Search Performance Test ===\n");
    console.log("Algolia configured:", isAlgoliaConfigured());
    console.log("Pinecone configured:", isPineconeConfigured());
  });

  afterAll(function () {
    // Print final report
    const report = generateBenchmarkReport();
    console.log("\n" + report.summary);

    if (report.recommendations.length > 0) {
      console.log("\nRecommendations:");
      report.recommendations.forEach((rec, idx) => {
        console.log(`  ${idx + 1}. ${rec}`);
      });
    }
  });

  describe("PostgreSQL Search", function () {
    it("should measure PostgreSQL search performance", async function () {
      for (const query of testQueries) {
        const { metrics } = await measurePerformance(
          "postgres-search",
          async () => {
            return db.query.articles.findMany({
              where: ilike(articles.name, `%${query}%`),
              limit: 20,
            });
          },
          { query }
        );

        expect(typeof metrics.durationMs).toBe("number");
        expect(metrics.durationMs).toBeGreaterThan(0);
      }

      const stats = compareSearchPerformance();
      console.log(`\nPostgreSQL - ${stats.postgres.count} queries:`);
      console.log(`  Avg: ${stats.postgres.avgMs.toFixed(2)}ms`);
      console.log(`  Min: ${stats.postgres.minMs.toFixed(2)}ms`);
      console.log(`  Max: ${stats.postgres.maxMs.toFixed(2)}ms`);
      console.log(`  P95: ${stats.postgres.p95Ms.toFixed(2)}ms`);

      expect(stats.postgres.count).toBe(testQueries.length);
    });
  });

  describe("Algolia Search", function () {
    it("should measure Algolia search performance", async function (ctx) {
      if (!isAlgoliaConfigured()) {
        console.log("  Skipping - Algolia not configured");
        ctx.skip();
        return;
      }

      for (const query of testQueries) {
        const { metrics } = await measurePerformance("algolia-search", () => algoliaSearch(query), {
          query,
        });

        expect(typeof metrics.durationMs).toBe("number");
        expect(metrics.durationMs).toBeGreaterThan(0);
      }

      const stats = compareSearchPerformance();
      console.log(`\nAlgolia - ${stats.algolia.count} queries:`);
      console.log(`  Avg: ${stats.algolia.avgMs.toFixed(2)}ms`);
      console.log(`  Min: ${stats.algolia.minMs.toFixed(2)}ms`);
      console.log(`  Max: ${stats.algolia.maxMs.toFixed(2)}ms`);
      console.log(`  P95: ${stats.algolia.p95Ms.toFixed(2)}ms`);

      expect(stats.algolia.count).toBe(testQueries.length);
    });
  });

  describe("Pinecone Semantic Search", function () {
    it(
      "should measure Pinecone semantic search performance",
      { timeout: 30000 },
      async function (ctx) {
        if (!isPineconeConfigured()) {
          console.log("  Skipping - Pinecone not configured");
          ctx.skip();
          return;
        }

        for (const query of testQueries) {
          const { metrics } = await measurePerformance(
            "pinecone-search",
            () => findSimilarArticles(query, undefined, 5),
            { query }
          );

          expect(typeof metrics.durationMs).toBe("number");
          expect(metrics.durationMs).toBeGreaterThan(0);
        }

        const stats = compareSearchPerformance();
        console.log(`\nPinecone - ${stats.pinecone.count} queries:`);
        console.log(`  Avg: ${stats.pinecone.avgMs.toFixed(2)}ms`);
        console.log(`  Min: ${stats.pinecone.minMs.toFixed(2)}ms`);
        console.log(`  Max: ${stats.pinecone.maxMs.toFixed(2)}ms`);
        console.log(`  P95: ${stats.pinecone.p95Ms.toFixed(2)}ms`);

        expect(stats.pinecone.count).toBe(testQueries.length);
      }
    );
  });

  describe("Performance Comparison", function () {
    it("should compare all search backends", function () {
      const stats = compareSearchPerformance();

      console.log("\n=== Performance Comparison ===");

      // PostgreSQL baseline
      if (stats.postgres.count > 0) {
        console.log(`PostgreSQL: ${stats.postgres.avgMs.toFixed(2)}ms avg`);
      }

      // Algolia comparison
      if (stats.algolia.count > 0 && stats.postgres.count > 0) {
        const algoliaSpeedup = stats.postgres.avgMs / stats.algolia.avgMs;
        console.log(
          `Algolia: ${stats.algolia.avgMs.toFixed(2)}ms avg (${algoliaSpeedup.toFixed(1)}x ${algoliaSpeedup > 1 ? "faster" : "slower"})`
        );
      }

      // Pinecone comparison
      if (stats.pinecone.count > 0 && stats.postgres.count > 0) {
        const pineconeSpeedup = stats.postgres.avgMs / stats.pinecone.avgMs;
        console.log(
          `Pinecone: ${stats.pinecone.avgMs.toFixed(2)}ms avg (${pineconeSpeedup.toFixed(1)}x ${pineconeSpeedup > 1 ? "faster" : "slower"})`
        );
      }

      // Algolia should typically be faster than PostgreSQL for text search
      if (stats.postgres.count > 0 && stats.algolia.count > 0 && isAlgoliaConfigured()) {
        console.log("\nNote: Algolia performance depends on network latency and index size.");
      }
    });
  });
});
