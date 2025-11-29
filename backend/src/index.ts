import "./instrument.js";
import * as Sentry from "@sentry/node";
import { createServer } from "http";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import * as trpcExpress from "@trpc/server/adapters/express";
import { articlesRouter, entriesRouter } from "./routes/index.js";
import { appRouter } from "./routers/index.js";
import { createContext } from "./trpc.js";
import { connectRedis, getRedisClient } from "./services/redis.js";
import { initializeStreams, getStreamStats } from "./services/streams.js";
import { initializeSocketIO, getPresence } from "./services/realtime.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", async (req, res) => {
  const redis = getRedisClient();
  const redisStatus = redis ? "connected" : "not configured";
  const streamStats = await getStreamStats();
  const presence = await getPresence();

  res.status(200).json({
    status: "OK",
    redis: redisStatus,
    streams: streamStats,
    activeUsers: presence.length,
  });
});

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.use("/api/articles", articlesRouter);
app.use("/api/entries", entriesRouter);

Sentry.setupExpressErrorHandler(app);

// Initialize Redis, Streams, and Socket.IO
async function startServer() {
  try {
    // Connect to Redis if configured
    if (process.env.REDIS_URL) {
      await connectRedis();
      await initializeStreams();
      console.log("[Server] Redis and Streams initialized");
    } else {
      console.log("[Server] Redis not configured - caching and queuing disabled");
    }

    // Initialize Socket.IO for real-time features
    initializeSocketIO(httpServer, allowedOrigins);
    console.log("[Server] Socket.IO initialized");

    httpServer.listen(PORT, () => {
      console.log(`Server is running on PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
  }
}

startServer();
