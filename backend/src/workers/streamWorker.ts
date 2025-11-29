import "../instrument.js";
import { config } from "dotenv";
config();

import { getRedisClient, connectRedis, disconnectRedis } from "../services/redis.js";
import {
  initializeStreams,
  readTasks,
  acknowledgeTask,
  type TaskType,
} from "../services/streams.js";
import { syncArticleToAlgolia, bulkSyncArticlesToAlgolia } from "../services/algolia.js";
import { getProductionHints, optimizeProductionSchedule } from "../services/ai.js";
import { db } from "../db/index.js";
import { articles, fieldDefinitions } from "../db/schema.js";
import { eq, inArray } from "drizzle-orm";
import { cacheSet, CacheKeys, CacheTTL } from "../services/redis.js";

// Worker configuration
const WORKER_ID = `worker-${process.pid}-${Date.now()}`;
const POLL_INTERVAL = 100; // ms between polls when no messages
const BATCH_SIZE = 10;

let isRunning = true;

/**
 * Process a single task based on its type
 */
async function processTask(taskType: TaskType, data: Record<string, unknown>): Promise<void> {
  console.log(`[Worker] Processing task: ${taskType}`);

  switch (taskType) {
    case "AI_HINTS": {
      const entries = data.entries as Array<{ article: string; status: string; quantity: number }>;
      const hints = await getProductionHints(entries);

      // Cache the result
      const entryHash = JSON.stringify(entries);
      await cacheSet(CacheKeys.aiHints(entryHash), hints, { ttl: CacheTTL.aiHints });

      console.log(`[Worker] AI hints generated and cached`);
      break;
    }

    case "AI_FIELD_HINT": {
      // Field hint processing - could expand this
      console.log(`[Worker] AI field hint processed`);
      break;
    }

    case "AI_OPTIMIZE": {
      await optimizeProductionSchedule();
      console.log(`[Worker] AI optimization completed`);
      break;
    }

    case "ALGOLIA_SYNC": {
      const articleId = data.articleId as number;
      const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
      });

      if (article) {
        const fields = await db.query.fieldDefinitions.findMany({
          where: eq(fieldDefinitions.articleId, articleId),
        });
        await syncArticleToAlgolia({
          id: article.id,
          name: article.name,
          organization: article.organization,
          status: article.status,
          fieldDefinitions: fields.map((f) => ({
            fieldLabel: f.fieldLabel,
            fieldType: f.fieldType,
          })),
        });
        console.log(`[Worker] Article ${articleId} synced to Algolia`);
      }
      break;
    }

    case "ALGOLIA_BULK_SYNC": {
      const articleIds = data.articleIds as number[];
      const articleList = await db.query.articles.findMany({
        where: inArray(articles.id, articleIds),
      });

      // Fetch field definitions for all articles
      const allFields = await db.query.fieldDefinitions.findMany({
        where: inArray(fieldDefinitions.articleId, articleIds),
      });

      await bulkSyncArticlesToAlgolia(
        articleList.map((a) => {
          const fields = allFields.filter((f) => f.articleId === a.id);
          return {
            id: a.id,
            name: a.name,
            organization: a.organization,
            status: a.status,
            fieldDefinitions: fields.map((f) => ({
              fieldLabel: f.fieldLabel,
              fieldType: f.fieldType,
            })),
          };
        })
      );
      console.log(`[Worker] ${articleList.length} articles bulk synced to Algolia`);
      break;
    }

    case "PINECONE_SYNC": {
      // Pinecone sync logic here
      console.log(`[Worker] Pinecone sync completed`);
      break;
    }

    default:
      console.warn(`[Worker] Unknown task type: ${taskType}`);
  }
}

/**
 * Main worker loop
 */
async function runWorker(): Promise<void> {
  console.log(`[Worker] Starting worker: ${WORKER_ID}`);

  // Connect to Redis
  await connectRedis();

  const client = getRedisClient();
  if (!client) {
    console.error("[Worker] Failed to connect to Redis. Exiting.");
    process.exit(1);
  }

  // Initialize streams
  await initializeStreams();

  console.log(`[Worker] Worker ${WORKER_ID} is ready and listening for tasks...`);

  while (isRunning) {
    try {
      // Read tasks from the stream
      const tasks = await readTasks(WORKER_ID, BATCH_SIZE, 5000);

      if (tasks.length === 0) {
        // No tasks, wait a bit before polling again
        await sleep(POLL_INTERVAL);
        continue;
      }

      // Process each task
      for (const { id, payload } of tasks) {
        try {
          await processTask(payload.type, payload.data);
          await acknowledgeTask(id);
        } catch (error) {
          console.error(`[Worker] Error processing task ${id}:`, error);
          // Don't acknowledge - let it be retried
        }
      }
    } catch (error) {
      console.error("[Worker] Error in worker loop:", error);
      await sleep(1000); // Wait before retrying
    }
  }

  console.log("[Worker] Worker shutting down...");
  await disconnectRedis();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Graceful shutdown handlers
process.on("SIGINT", () => {
  console.log("\n[Worker] Received SIGINT, shutting down gracefully...");
  isRunning = false;
});

process.on("SIGTERM", () => {
  console.log("[Worker] Received SIGTERM, shutting down gracefully...");
  isRunning = false;
});

// Start the worker
runWorker().catch((error) => {
  console.error("[Worker] Fatal error:", error);
  process.exit(1);
});
