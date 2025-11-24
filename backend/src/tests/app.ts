import express from "express";
import { articlesRouter, entriesRouter } from "../routes/index.js";

// Create app instance for testing (without starting the server)
export function createTestApp() {
  const app = express();
  
  app.use(express.json());
  app.use("/api/articles", articlesRouter);
  app.use("/api/entries", entriesRouter);
  
  return app;
}