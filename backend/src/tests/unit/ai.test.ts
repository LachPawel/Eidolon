import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getProductionHints, optimizeProductionSchedule } from "../../services/ai.js";
import type OpenAI from "openai";
import type { db } from "../../db/index.js";

// Helper types for our mocks
type MockOpenAI = {
  chat: {
    completions: {
      create: ReturnType<typeof vi.fn>;
    };
  };
};

type MockDB = {
  query: {
    entries: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };
  update: ReturnType<typeof vi.fn>;
};

describe("AI Service", () => {
  let openaiMock: MockOpenAI;
  let dbMock: MockDB;
  let originalApiKey: string | undefined;

  beforeEach(() => {
    originalApiKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = "test-key";

    // Create fresh mocks for each test
    openaiMock = {
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    };

    // Chainable mock for db.update().set().where()
    const updateChain = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    };

    dbMock = {
      query: {
        entries: {
          findMany: vi.fn(),
        },
      },
      update: vi.fn().mockReturnValue(updateChain),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.OPENAI_API_KEY = originalApiKey;
  });

  describe("getProductionHints", () => {
    it("should return hints from OpenAI", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ hints: ["Hint 1", "Hint 2"] }),
            },
          },
        ],
      };
      openaiMock.chat.completions.create.mockResolvedValue(mockResponse as unknown);

      const entries = [{ article: "A1", status: "PREPARATION", quantity: 10 }];

      // Cast to unknown then to actual type to satisfy TS if strictly typed in service
      const hints = await getProductionHints(entries, openaiMock as unknown as OpenAI);

      expect(hints).toEqual(["Hint 1", "Hint 2"]);
      expect(openaiMock.chat.completions.create).toHaveBeenCalledTimes(1);
    });

    it("should handle empty response from OpenAI", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };
      openaiMock.chat.completions.create.mockResolvedValue(mockResponse as unknown);

      const hints = await getProductionHints([], openaiMock as unknown as OpenAI);
      // Expecting empty array since response was empty
      expect(hints).toEqual([]);
    });

    it("should handle JSON parse error gracefully", async () => {
      const mockResponse = {
        choices: [{ message: { content: "invalid json" } }],
      };
      openaiMock.chat.completions.create.mockResolvedValue(mockResponse as unknown);

      const hints = await getProductionHints([], openaiMock as unknown as OpenAI);
      // The catch block returns failure message
      expect(hints[0]).toContain("Failed to generate AI hints");
    });

    it("should return error message if API key is missing", async () => {
      // Simulate OpenAI throwing an error (which happens if key is missing/invalid)
      openaiMock.chat.completions.create.mockRejectedValue(new Error("Missing API Key"));

      const hints = await getProductionHints([], openaiMock as unknown as OpenAI);
      expect(hints[0]).toContain("Failed to generate AI hints");
    });
  });

  describe("optimizeProductionSchedule", () => {
    it("should return message if no items to optimize", async () => {
      dbMock.query.entries.findMany.mockResolvedValue([]);

      const result = await optimizeProductionSchedule(
        dbMock as unknown as typeof db,
        openaiMock as unknown as OpenAI
      );
      expect(result).toEqual({ message: "No items to optimize." });
    });

    it("should move items to production if AI suggests", async () => {
      const prepEntries = [
        { id: 1, article: { name: "A1" }, quantity: 10 },
        { id: 2, article: { name: "A2" }, quantity: 20 },
      ];
      dbMock.query.entries.findMany.mockResolvedValue(prepEntries);

      const mockResponse = {
        choices: [{ message: { content: JSON.stringify({ ids: [1] }) } }],
      };
      openaiMock.chat.completions.create.mockResolvedValue(mockResponse as unknown);

      const result = await optimizeProductionSchedule(
        dbMock as unknown as typeof db,
        openaiMock as unknown as OpenAI
      );

      expect(result).toEqual({
        message: "Optimized: Moved 1 items to production.",
        movedIds: [1],
      });
      expect(dbMock.update).toHaveBeenCalled();
    });

    it("should do nothing if AI suggests no moves", async () => {
      const prepEntries = [{ id: 1, article: { name: "A1" }, quantity: 10 }];
      dbMock.query.entries.findMany.mockResolvedValue(prepEntries);

      const mockResponse = {
        choices: [{ message: { content: JSON.stringify({ ids: [] }) } }],
      };
      openaiMock.chat.completions.create.mockResolvedValue(mockResponse as unknown);

      const result = await optimizeProductionSchedule(
        dbMock as unknown as typeof db,
        openaiMock as unknown as OpenAI
      );

      expect(result).toEqual({ message: "AI decided no changes needed." });
      expect(dbMock.update).not.toHaveBeenCalled();
    });
  });
});
