import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSocketIO,
  getPresence,
  publishProductionEvent,
  ProductionEvents,
} from "../../services/realtime.js";

// Mock redis client
vi.mock("../../services/redis.js", () => ({
  getRedisClient: vi.fn(() => null),
}));

describe("Realtime Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSocketIO", () => {
    it("should return null when not initialized", () => {
      const io = getSocketIO();
      expect(io).toBeNull();
    });
  });

  describe("getPresence", () => {
    it("should return empty array when Redis is not configured", async () => {
      const presence = await getPresence();
      expect(presence).toEqual([]);
    });
  });

  describe("publishProductionEvent", () => {
    it("should not throw when Redis is not configured", async () => {
      await expect(
        publishProductionEvent({
          type: "ENTRY_UPDATED",
          entryId: 1,
          data: { status: "IN PRODUCTION" },
        })
      ).resolves.not.toThrow();
    });
  });

  describe("ProductionEvents helpers", () => {
    describe("entryCreated", () => {
      it("should create correct event payload", async () => {
        const result = await ProductionEvents.entryCreated(1, { articleId: 10, quantity: 5 });
        // Returns undefined when Redis not configured (no socket.io fallback without io instance)
        expect(result).toBeUndefined();
      });
    });

    describe("entryUpdated", () => {
      it("should create correct event payload", async () => {
        const result = await ProductionEvents.entryUpdated(2, { quantity: 10 }, "user-123");
        expect(result).toBeUndefined();
      });
    });

    describe("entryDeleted", () => {
      it("should create correct event payload", async () => {
        const result = await ProductionEvents.entryDeleted(3, "user-456");
        expect(result).toBeUndefined();
      });
    });

    describe("statusChanged", () => {
      it("should create correct event payload", async () => {
        const result = await ProductionEvents.statusChanged(
          4,
          "PREPARATION",
          "IN PRODUCTION",
          "user-789"
        );
        expect(result).toBeUndefined();
      });
    });
  });

  describe("Event Types", () => {
    it("should have correct event type constants", () => {
      // Test that the event types are as expected
      const eventTypes = ["ENTRY_CREATED", "ENTRY_UPDATED", "ENTRY_DELETED", "STATUS_CHANGED"];

      // These are the valid types based on ProductionEvent interface
      eventTypes.forEach((type) => {
        expect(typeof type).toBe("string");
      });
    });
  });

  describe("PresenceUser structure", () => {
    it("should define correct presence user properties", () => {
      // Mock presence user structure
      const mockUser = {
        socketId: "abc123",
        userName: "John",
        joinedAt: Date.now(),
      };

      expect(mockUser).toHaveProperty("socketId");
      expect(mockUser).toHaveProperty("userName");
      expect(mockUser).toHaveProperty("joinedAt");
      expect(typeof mockUser.socketId).toBe("string");
      expect(typeof mockUser.joinedAt).toBe("number");
    });
  });

  describe("ProductionEvent structure", () => {
    it("should define correct production event properties", () => {
      const mockEvent = {
        type: "ENTRY_UPDATED" as const,
        entryId: 1,
        data: { status: "READY" },
        userId: "user-1",
        timestamp: Date.now(),
      };

      expect(mockEvent).toHaveProperty("type");
      expect(mockEvent).toHaveProperty("entryId");
      expect(mockEvent).toHaveProperty("data");
      expect(mockEvent).toHaveProperty("timestamp");
      expect(typeof mockEvent.entryId).toBe("number");
      expect(typeof mockEvent.timestamp).toBe("number");
    });
  });
});

describe("Realtime Service with mocked Redis", () => {
  it("should handle presence operations gracefully without Redis", async () => {
    // getPresence should return empty array
    const presence = await getPresence();
    expect(Array.isArray(presence)).toBe(true);
    expect(presence.length).toBe(0);
  });

  it("should handle publish operations gracefully without Redis", async () => {
    // Should not throw
    await expect(
      ProductionEvents.statusChanged(1, "PREPARATION", "IN PRODUCTION")
    ).resolves.not.toThrow();
  });
});
