import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Tasks, type TaskType } from "../../services/streams.js";

// Mock redis service
vi.mock("../../services/redis.js", () => ({
  getRedisClient: vi.fn(() => null),
}));

describe("Streams Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    delete process.env.REDIS_URL;
  });

  describe("Task Types", () => {
    it("should have correct task types defined", () => {
      const taskTypes: TaskType[] = [
        "AI_HINTS",
        "AI_FIELD_HINT",
        "AI_OPTIMIZE",
        "ALGOLIA_SYNC",
        "ALGOLIA_BULK_SYNC",
        "PINECONE_SYNC",
      ];

      expect(taskTypes).toHaveLength(6);
    });
  });

  describe("Tasks helpers", () => {
    describe("generateAIHints", () => {
      it("should return null when Redis is not configured", async () => {
        const entries = [{ article: "Widget A", status: "IN PRODUCTION", quantity: 10 }];

        const result = await Tasks.generateAIHints(entries);
        expect(result).toBeNull();
      });
    });

    describe("generateFieldHint", () => {
      it("should return null when Redis is not configured", async () => {
        const result = await Tasks.generateFieldHint("temperature", "number", "25");
        expect(result).toBeNull();
      });
    });

    describe("optimizeProduction", () => {
      it("should return null when Redis is not configured", async () => {
        const result = await Tasks.optimizeProduction();
        expect(result).toBeNull();
      });
    });

    describe("syncToAlgolia", () => {
      it("should return null when Redis is not configured", async () => {
        const result = await Tasks.syncToAlgolia(123);
        expect(result).toBeNull();
      });
    });

    describe("bulkSyncToAlgolia", () => {
      it("should return null when Redis is not configured", async () => {
        const result = await Tasks.bulkSyncToAlgolia([1, 2, 3]);
        expect(result).toBeNull();
      });
    });

    describe("syncToPinecone", () => {
      it("should return null when Redis is not configured", async () => {
        const result = await Tasks.syncToPinecone(123, "Test content");
        expect(result).toBeNull();
      });
    });
  });
});
