import { router } from "../trpc.js";
import { articlesRouter } from "./articles.js";
import { entriesRouter } from "./entries.js";

export const appRouter = router({
  articles: articlesRouter,
  entries: entriesRouter,
});

export type AppRouter = typeof appRouter;
