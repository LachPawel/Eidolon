import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
  cacheAside,
  CacheKeys,
  CacheTTL,
} from "../../services/redis.js";

// Mock ioredis
vi.mock("ioredis", () => {
  const mockRedis = {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    on: vi.fn(),
    connect: vi.fn(),
    quit: vi.fn(),
  };

  return {
    Redis: vi.fn(() => mockRedis),
  };
});

describe("Redis Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Set up mock env
    process.env.REDIS_URL = "redis://localhost:6379";
  });

  afterEach(() => {
    delete process.env.REDIS_URL;
  });

  describe("CacheKeys", () => {
    it("should generate article cache key", () => {
      expect(CacheKeys.article(123)).toBe("article:123");
    });

    it("should generate article list cache key", () => {
      expect(CacheKeys.articleList()).toBe("articles:all");
      expect(CacheKeys.articleList("acme")).toBe("articles:org:acme");
    });

    it("should generate AI hints cache key", () => {
      expect(CacheKeys.aiHints("hash123")).toBe("ai:hints:hash123");
    });

    it("should generate production board cache key", () => {
      expect(CacheKeys.productionBoard("acme")).toBe("production:board:acme");
    });
  });

  describe("CacheTTL", () => {
    it("should have correct TTL values", () => {
      expect(CacheTTL.article).toBe(600); // 10 minutes
      expect(CacheTTL.articleList).toBe(300); // 5 minutes
      expect(CacheTTL.aiHints).toBe(1800); // 30 minutes
      expect(CacheTTL.aiFieldHint).toBe(3600); // 1 hour
      expect(CacheTTL.productionBoard).toBe(60); // 1 minute
    });
  });

  describe("cacheGet", () => {
    it("should return null when Redis is not configured", async () => {
      delete process.env.REDIS_URL;

      const result = await cacheGet("test-key");
      expect(result).toBeNull();
    });
  });

  describe("cacheSet", () => {
    it("should return false when Redis is not configured", async () => {
      delete process.env.REDIS_URL;

      const result = await cacheSet("test-key", { data: "test" });
      expect(result).toBe(false);
    });
  });

  describe("cacheDelete", () => {
    it("should return false when Redis is not configured", async () => {
      delete process.env.REDIS_URL;

      const result = await cacheDelete("test-key");
      expect(result).toBe(false);
    });
  });

  describe("cacheDeletePattern", () => {
    it("should return false when Redis is not configured", async () => {
      delete process.env.REDIS_URL;

      const result = await cacheDeletePattern("articles:*");
      expect(result).toBe(false);
    });
  });

  describe("cacheAside", () => {
    it("should call fetcher and return result when cache misses", async () => {
      delete process.env.REDIS_URL;

      const fetcher = vi.fn().mockResolvedValue({ id: 1, name: "Test" });
      const result = await cacheAside("test-key", fetcher);

      expect(fetcher).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, name: "Test" });
    });
  });
});
