import { router, publicProcedure } from "../trpc.js";
import { db } from "../db/index.js";
import { getProductionHints, optimizeProductionSchedule } from "../services/ai.js";

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

    const hints = await getProductionHints(simplifiedEntries);
    return hints;
  }),

  optimizeSchedule: publicProcedure.mutation(async () => {
    return await optimizeProductionSchedule();
  }),
});
