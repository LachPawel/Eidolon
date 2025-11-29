import { Redis } from "ioredis";

// Lazy-initialized Redis client
let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!redisClient && process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
    });

    redisClient.on("error", (err: Error) => {
      console.error("[Redis] Connection error:", err.message);
    });

    redisClient.on("connect", () => {
      console.log("[Redis] Connected successfully");
    });
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  if (client) {
    await client.connect();
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// ============================================
// CACHING UTILITIES
// ============================================

const DEFAULT_TTL = 300; // 5 minutes

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

/**
 * Get a value from cache
 */
export async function cacheGet<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const prefixedKey = options.prefix ? `${options.prefix}:${key}` : key;
    const value = await client.get(prefixedKey);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("[Redis] Cache get error:", error);
    return null;
  }
}

/**
 * Set a value in cache
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const prefixedKey = options.prefix ? `${options.prefix}:${key}` : key;
    const ttl = options.ttl ?? DEFAULT_TTL;
    await client.setex(prefixedKey, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("[Redis] Cache set error:", error);
    return false;
  }
}

/**
 * Delete a value from cache
 */
export async function cacheDelete(key: string, options: CacheOptions = {}): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const prefixedKey = options.prefix ? `${options.prefix}:${key}` : key;
    await client.del(prefixedKey);
    return true;
  } catch (error) {
    console.error("[Redis] Cache delete error:", error);
    return false;
  }
}

/**
 * Delete all keys matching a pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return true;
  } catch (error) {
    console.error("[Redis] Cache delete pattern error:", error);
    return false;
  }
}

/**
 * Cache-aside pattern: Get from cache or fetch and cache
 */
export async function cacheAside<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheGet<T>(key, options);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Cache the result
  await cacheSet(key, data, options);

  return data;
}

// ============================================
// CACHE KEY BUILDERS
// ============================================

export const CacheKeys = {
  article: (id: number) => `article:${id}`,
  articleList: (org?: string) => (org ? `articles:org:${org}` : "articles:all"),
  aiHints: (entryHash: string) => `ai:hints:${entryHash}`,
  aiFieldHint: (field: string, value: string) => `ai:field:${field}:${hashString(value)}`,
  productionBoard: (org: string) => `production:board:${org}`,
};

export const CacheTTL = {
  article: 600, // 10 minutes
  articleList: 300, // 5 minutes
  aiHints: 1800, // 30 minutes (AI responses are expensive)
  aiFieldHint: 3600, // 1 hour
  productionBoard: 60, // 1 minute (real-time data)
};

// Simple hash function for cache keys
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
