import express, { Request, Response }  from "express";
import path from "path";
import { __dirname } from "./const/index.js";
import { readData, writeData } from "./utils/fileSystem.js";
import { Article, Entry } from "./types/index.js";
import { randomUUID } from "crypto";
import { validateFields } from "./utils/validation.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../../public")));

app.get("/api/articles", async (req, res) => {
  try {
    const { organization, status } = req.query;
    let articles = await readData("articles.json", "articles");

    if (typeof organization === "string")
      articles = articles.filter((article: Article) => article.organization === organization);
    if (typeof status === "string") articles = articles.filter((article: Article) => article.status === status);

    res.json({ articles });
  } catch (error) {
    res.status(500).json({ error: "Failed to load articles" });
  }
});

app.post("/api/entries", async (req: Request, res: Response) => {
  try {
    const { articleId, organization, data } = req.body;

    if (!articleId || !data) {
      res.status(400).json({ error: "Article ID and Data are required" });
      return;
    }

    const articles = await readData("articles.json", "articles");
    const article = articles.find((article: Article) => article.id === articleId);

    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    const errors = validateFields(article.shopFloorSchema, data);
    if (errors.length > 0) {
      res.status(400).json({ error: "Validation Failed", details: errors });
      return;
    }

    const entries = await readData("entries.json", "entries");
    const newEntry: Entry = {
      id: randomUUID(),
      articleId,
      organization,
      data,
      timestamp: new Date().toISOString()
    };

    entries.push(newEntry);
    await writeData("entries.json", "entries", entries);

    res.status(201).json(newEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save entry" });
  }
});

app.post("/api/articles", async (req: Request, res: Response) => {
  try {
    const { organization, name, status, attributeSchema, shopFloorSchema } = req.body;
    
    if (!organization || !name) {
      res.status(400).json({ error: "Organization and Name are required" });
      return;
    }

    const articles = await readData("articles.json", "articles");
    
    const newArticle: Article = {
      id: randomUUID(),
      organization,
      name,
      status: status || "draft",
      attributeSchema: attributeSchema || [],
      attributes: {}, 
      shopFloorSchema: shopFloorSchema || [],
      createdAt: new Date().toISOString()
    };

    articles.push(newArticle);
    await writeData("articles.json", "articles", articles);

    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ error: "Failed to save article" });
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
