import { router } from '../trpc.js';
import { articlesRouter } from './articles.js';

export const appRouter = router({
  articles: articlesRouter,
});

export type AppRouter = typeof appRouter;
