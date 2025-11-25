import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { articlesRouter, entriesRouter } from "../routes/index.js";
import { appRouter } from "../routers/index.js";
import { createContext } from "../trpc.js";

// Create app instance for testing (without starting the server)
export function createTestApp() {
  const app = express();

  app.use(express.json());

  // Mount TRPC middleware
  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Mount REST API routes
  app.use("/api/articles", articlesRouter);
  app.use("/api/entries", entriesRouter);

  return app;
}
