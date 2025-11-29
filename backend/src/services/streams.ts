import { getRedisClient } from "./redis.js";

// ============================================
// REDIS STREAMS - MESSAGE QUEUE
// ============================================

const STREAM_NAME = "eidolon:tasks";
const CONSUMER_GROUP = "eidolon-workers";
const MAX_STREAM_LENGTH = 10000; // Trim stream to prevent unbounded growth

export type TaskType =
  | "AI_HINTS"
  | "AI_FIELD_HINT"
  | "AI_OPTIMIZE"
  | "ALGOLIA_SYNC"
  | "ALGOLIA_BULK_SYNC"
  | "PINECONE_SYNC";

export interface TaskPayload {
  type: TaskType;
  data: Record<string, unknown>;
  priority?: "high" | "normal" | "low";
  createdAt: number;
}

/**
 * Initialize the consumer group (run once on startup)
 */
export async function initializeStreams(): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    console.log("[Streams] Skipping initialization - Redis not configured");
    return;
  }

  try {
    // Create consumer group if it doesn't exist
    await client.xgroup("CREATE", STREAM_NAME, CONSUMER_GROUP, "0", "MKSTREAM");
    console.log("[Streams] Consumer group created successfully");
  } catch (error: unknown) {
    // Group already exists - that's fine
    if (error instanceof Error && error.message.includes("BUSYGROUP")) {
      console.log("[Streams] Consumer group already exists");
    } else {
      console.error("[Streams] Error initializing streams:", error);
    }
  }
}

/**
 * Add a task to the queue
 */
export async function enqueueTask(
  type: TaskType,
  data: Record<string, unknown>
): Promise<string | null> {
  const client = getRedisClient();
  if (!client) {
    console.log("[Streams] Cannot enqueue - Redis not configured");
    return null;
  }

  try {
    const payload: TaskPayload = {
      type,
      data,
      priority: "normal",
      createdAt: Date.now(),
    };

    // Add to stream with MAXLEN to prevent unbounded growth
    const messageId = await client.xadd(
      STREAM_NAME,
      "MAXLEN",
      "~",
      MAX_STREAM_LENGTH.toString(),
      "*",
      "payload",
      JSON.stringify(payload)
    );

    console.log(`[Streams] Task enqueued: ${type} (${messageId})`);
    return messageId;
  } catch (error) {
    console.error("[Streams] Error enqueueing task:", error);
    return null;
  }
}

/**
 * Read tasks from the queue (for workers)
 */
export async function readTasks(
  consumerId: string,
  count: number = 10,
  blockMs: number = 5000
): Promise<Array<{ id: string; payload: TaskPayload }>> {
  const client = getRedisClient();
  if (!client) return [];

  try {
    const results = await client.xreadgroup(
      "GROUP",
      CONSUMER_GROUP,
      consumerId,
      "COUNT",
      count.toString(),
      "BLOCK",
      blockMs.toString(),
      "STREAMS",
      STREAM_NAME,
      ">"
    );

    if (!results) return [];

    const tasks: Array<{ id: string; payload: TaskPayload }> = [];

    for (const [, messages] of results) {
      for (const [id, fields] of messages as Array<[string, string[]]>) {
        try {
          const payloadIndex = fields.indexOf("payload");
          if (payloadIndex !== -1) {
            const payload = JSON.parse(fields[payloadIndex + 1]) as TaskPayload;
            tasks.push({ id, payload });
          }
        } catch (parseError) {
          console.error("[Streams] Error parsing message:", parseError);
        }
      }
    }

    return tasks;
  } catch (error) {
    console.error("[Streams] Error reading tasks:", error);
    return [];
  }
}

/**
 * Acknowledge a task as completed
 */
export async function acknowledgeTask(messageId: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.xack(STREAM_NAME, CONSUMER_GROUP, messageId);
    return true;
  } catch (error) {
    console.error("[Streams] Error acknowledging task:", error);
    return false;
  }
}

/**
 * Get pending tasks (tasks that were claimed but not acknowledged)
 */
export async function getPendingTasks(): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;

  try {
    const info = await client.xpending(STREAM_NAME, CONSUMER_GROUP);
    return ((info as unknown[])[0] as number) || 0;
  } catch (error) {
    console.error("[Streams] Error getting pending tasks:", error);
    return 0;
  }
}

/**
 * Get stream statistics
 */
export async function getStreamStats(): Promise<{
  length: number;
  pending: number;
  consumers: number;
} | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const length = await client.xlen(STREAM_NAME);
    const pending = await getPendingTasks();

    const groupInfo = await client.xinfo("GROUPS", STREAM_NAME);
    const consumers =
      Array.isArray(groupInfo) && groupInfo[0]
        ? ((groupInfo[0] as Record<string, unknown>).consumers as number) || 0
        : 0;

    return { length, pending, consumers };
  } catch (error) {
    console.error("[Streams] Error getting stream stats:", error);
    return null;
  }
}

// ============================================
// TASK HELPERS - Enqueue specific task types
// ============================================

export const Tasks = {
  /**
   * Enqueue AI hints generation for production entries
   */
  generateAIHints: (entries: Array<{ article: string; status: string; quantity: number }>) =>
    enqueueTask("AI_HINTS", { entries }),

  /**
   * Enqueue AI field hint generation
   */
  generateFieldHint: (fieldLabel: string, fieldType: string, currentValue: string) =>
    enqueueTask("AI_FIELD_HINT", { fieldLabel, fieldType, currentValue }),

  /**
   * Enqueue AI optimization
   */
  optimizeProduction: () => enqueueTask("AI_OPTIMIZE", {}),

  /**
   * Enqueue Algolia sync for a single article
   */
  syncToAlgolia: (articleId: number) => enqueueTask("ALGOLIA_SYNC", { articleId }),

  /**
   * Enqueue bulk Algolia sync
   */
  bulkSyncToAlgolia: (articleIds: number[]) => enqueueTask("ALGOLIA_BULK_SYNC", { articleIds }),

  /**
   * Enqueue Pinecone vector sync
   */
  syncToPinecone: (articleId: number, content: string) =>
    enqueueTask("PINECONE_SYNC", { articleId, content }),
};
