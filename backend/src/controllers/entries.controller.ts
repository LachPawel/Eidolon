import { Request, Response } from "express";
import { readData, validateFields, writeData } from "../utils/index.js";
import { Article, Entry } from "../types/index.js";
import { randomUUID } from "crypto";

class EntryController {
  async addEntry(req: Request, res: Response) {
    try {
      const { articleId, organization, data } = req.body;

      if (!articleId || !data) {
        res.status(400).json({ error: "Article ID and Data are required" });
        return;
      }

      const articles = await readData("articles.json", "articles");
      const article = articles.find(
        (article: Article) => article.id === articleId
      );

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
        timestamp: new Date().toISOString(),
      };

      entries.push(newEntry);
      await writeData("entries.json", "entries", entries);

      res.status(201).json(newEntry);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save entry" });
    }
  }
}

export { EntryController };
