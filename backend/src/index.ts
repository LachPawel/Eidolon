import express from "express";
import path from "path";
import { __dirname } from "./const/index.js";
import { articlesRouter, entriesRouter } from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../../public")));

app.use("/api/articles", articlesRouter);
app.use("/api/entries", entriesRouter);

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
