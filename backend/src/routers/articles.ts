import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import { db } from '../db/index.js';
import { articles } from '../db/schema.js';

export const articlesRouter = router({
  list: publicProcedure.query(async () => {
    return await db.select().from(articles);
  }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        organization: z.string(),
        status: z.enum(['draft', 'active', 'archived']),
      })
    )
    .mutation(async ({ input }) => {
      return await db.insert(articles).values(input).returning();
    }),
});
