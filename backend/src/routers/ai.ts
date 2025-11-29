import { router, publicProcedure } from "../trpc.js";
import { db } from "../db/index.js";
import { getProductionHints, optimizeProductionSchedule } from "../services/ai.js";
import { cacheGet, cacheSet, CacheKeys, CacheTTL } from "../services/redis.js";
import { Tasks } from "../services/streams.js";

// Simple hash function to create cache key from entries
function hashEntries(
  entries: Array<{ article: string; status: string; quantity: number }>
): string {
  const str = JSON.stringify(entries.sort((a, b) => a.article.localeCompare(b.article)));
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export const aiRouter = router({
  getHints: publicProcedure.query(async () => {
    // Fetch all entries with their article names
    const allEntries = await db.query.entries.findMany({
      with: {
        article: true,
      },
    });

    const simplifiedEntries = allEntries.map((e) => ({
      article: e.article.name,
      status: e.status,
      quantity: e.quantity,
    }));

    // Create cache key based on entries
    const entryHash = hashEntries(simplifiedEntries);
    const cacheKey = CacheKeys.aiHints(entryHash);

    // Try to get from cache first
    const cachedHints = await cacheGet<string[]>(cacheKey);
    if (cachedHints) {
      console.log("[AI] Returning cached hints");
      return cachedHints;
    }

    // Generate hints (synchronously for now, could be queued for async)
    const hints = await getProductionHints(simplifiedEntries);

    // Cache the result
    await cacheSet(cacheKey, hints, { ttl: CacheTTL.aiHints });

    return hints;
  }),

  // Async version - enqueues task and returns immediately
  getHintsAsync: publicProcedure.mutation(async () => {
    const allEntries = await db.query.entries.findMany({
      with: { article: true },
    });

    const simplifiedEntries = allEntries.map((e) => ({
      article: e.article.name,
      status: e.status,
      quantity: e.quantity,
    }));

    // Enqueue for background processing
    const messageId = await Tasks.generateAIHints(simplifiedEntries);

    return {
      status: "queued",
      messageId,
      message: "AI hints generation has been queued. Check back shortly.",
    };
  }),

  optimizeSchedule: publicProcedure.mutation(async () => {
    return await optimizeProductionSchedule();
  }),

  // Async version of optimize
  optimizeScheduleAsync: publicProcedure.mutation(async () => {
    const messageId = await Tasks.optimizeProduction();

    return {
      status: "queued",
      messageId,
      message: "Production optimization has been queued.",
    };
  }),
});
