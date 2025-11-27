import OpenAI from "openai";
import { db } from "../db/index.js";
import { entries } from "../db/schema.js";
import { eq, inArray } from "drizzle-orm";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ProductionEntry = {
  article: string;
  status: string;
  quantity: number;
};

export const getProductionHints = async (entries: ProductionEntry[], openaiInstance = openai) => {
  if (!process.env.OPENAI_API_KEY) {
    return ["AI hints are unavailable: Missing OpenAI API Key."];
  }

  try {
    const prompt = `
      You are an expert manufacturing production manager.
      Analyze the following production board state and provide 3 short, actionable hints or insights to optimize flow, identify bottlenecks, or improve efficiency.
      
      Current Production State:
      ${JSON.stringify(entries, null, 2)}
      
      The columns are: PREPARATION -> IN PRODUCTION -> READY.
      Quantities are listed for each article.
      
      Format your response as a JSON array of strings, e.g. ["Hint 1", "Hint 2", "Hint 3"].
      Keep hints concise.
    `;

    const response = await openaiInstance.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    return parsed.hints || parsed.suggestions || [];
  } catch (error) {
    console.error("Error generating AI hints:", error);
    return ["Failed to generate AI hints at this time."];
  }
};

export const optimizeProductionSchedule = async (database = db, openaiInstance = openai) => {
  // 1. Fetch PREPARATION items
  const prepEntries = await database.query.entries.findMany({
    where: eq(entries.status, "PREPARATION"),
    with: { article: true },
  });

  if (prepEntries.length === 0) return { message: "No items to optimize." };

  // 2. Ask AI to prioritize
  const prompt = `
      You are a production scheduler.
      Here are items in PREPARATION:
      ${JSON.stringify(
        prepEntries.map((e) => ({
          id: e.id,
          name: e.article.name,
          qty: e.quantity,
        }))
      )}
      
      Select up to 3 items that should be moved to "IN PRODUCTION" immediately to maximize throughput.
      Return a JSON object with a key "ids" containing the array of IDs, e.g. { "ids": [1, 5, 9] }.
    `;

  try {
    const completion = await openaiInstance.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    const result = JSON.parse(content || "{}");
    const idsToMove: number[] = result.ids || [];

    if (idsToMove.length > 0) {
      // 3. Update DB
      await database
        .update(entries)
        .set({
          status: "IN PRODUCTION",
          startedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(inArray(entries.id, idsToMove));

      return {
        message: `Optimized: Moved ${idsToMove.length} items to production.`,
        movedIds: idsToMove,
      };
    }

    return { message: "AI decided no changes needed." };
  } catch (error) {
    console.error("AI Optimization failed:", error);
    return { message: "Optimization failed." };
  }
};
