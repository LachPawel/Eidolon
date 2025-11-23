import express from "express";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadArticles = async () => {
  const dataPath = path.join(__dirname, "data", "articles.json");
  const rawData = await readFile(dataPath, "utf-8");
  return JSON.parse(rawData).articles;
};

app.get("/api/articles", async (_req, res) => {
  try {
    const articles = await loadArticles();
    res.json({ articles });
  } catch (error) {
    res.status(500).json({ error: "Failed to load articles" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
