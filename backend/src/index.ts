import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import * as trpcExpress from "@trpc/server/adapters/express";
import { articlesRouter, entriesRouter } from "./routes/index.js";
import { appRouter } from "./routers/index.js";
import { createContext } from "./trpc.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://eidolon.up.railway.app"],
    credentials: true,
  })
);
app.use(express.json());

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.use("/api/articles", articlesRouter);
app.use("/api/entries", entriesRouter);

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
