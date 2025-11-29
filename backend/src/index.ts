import "./instrument.js";
import * as Sentry from "@sentry/node";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import * as trpcExpress from "@trpc/server/adapters/express";
import { articlesRouter, entriesRouter } from "./routes/index.js";
import { appRouter } from "./routers/index.js";
import { createContext } from "./trpc.js";

const app = express();
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

app.get("/health", (req, res) => {
  res.status(200).send("OK");
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

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
