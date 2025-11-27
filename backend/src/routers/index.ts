import { router } from "../trpc.js";
import { articlesRouter } from "./articles.js";
import { entriesRouter } from "./entries.js";
import { aiRouter } from "./ai.js";

export const appRouter = router({
  articles: articlesRouter,
  entries: entriesRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
