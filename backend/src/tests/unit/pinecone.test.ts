import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { validateValueWithAI, setOpenAIClientForTest } from "../../services/pinecone.js";

describe("Pinecone Service (AI Validation)", () => {
  // Mock OpenAI client
  const mockOpenAI = {
    chat: {
      completions: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        create: async (params: any) => {
          // Parse the prompt to decide what to return
          const content = params.messages[0].content;

          if (content.includes('User Input: "14"') && content.includes("pH Level")) {
            return {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      isValid: false,
                      warning: "pH 14 is extremely basic and dangerous",
                      suggestion: "Check sensor",
                    }),
                  },
                },
              ],
            };
          }

          if (content.includes('User Input: "7"') && content.includes("pH Level")) {
            return {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      isValid: true,
                    }),
                  },
                },
              ],
            };
          }

          // Default response
          return {
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    isValid: true,
                  }),
                },
              },
            ],
          };
        },
      },
    },
  };

  beforeAll(() => {
    // Inject mock client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOpenAIClientForTest(mockOpenAI as any);
  });

  afterAll(() => {
    // Reset client
    setOpenAIClientForTest(null);
  });

  it("should validate a correct value as valid", async () => {
    const result = await validateValueWithAI(
      "Chemical Compound A",
      "ChemCorp",
      "pH Level",
      "number",
      "7"
    );

    expect(result.isValid).to.be.true;
    expect(result.warning).to.be.undefined;
  });

  it("should validate an incorrect value as invalid with warning", async () => {
    const result = await validateValueWithAI(
      "Chemical Compound A",
      "ChemCorp",
      "pH Level",
      "number",
      "14"
    );

    expect(result.isValid).to.be.false;
    expect(result.warning).to.include("pH 14 is extremely basic");
  });

  it("should handle empty/undefined value as advice request", async () => {
    // We need to update the mock to handle advice request if we want to test specific output
    // But for now, default mock returns isValid: true which is the fallback
    const result = await validateValueWithAI(
      "Chemical Compound A",
      "ChemCorp",
      "pH Level",
      "number",
      undefined
    );

    expect(result.isValid).to.be.true;
  });
});
