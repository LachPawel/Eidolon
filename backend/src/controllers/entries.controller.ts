import { Request, Response } from "express";
import { validateFields } from "../utils/index.js";
import { db } from "../db/index.js";
import { articles, entries } from "../db/schema.js";
import { eq } from "drizzle-orm";

class EntryController {
  async addEntry(req: Request, res: Response) {
    try {
      const { articleId, organization, data } = req.body;

      if (!articleId || !data) {
        res.status(400).json({ error: "Article ID and Data are required" });
        return;
      }

      const [article] = await db.select().from(articles).where(eq(articles.id, articleId));
      
      if (!article) {
        res.status(404).json({ error: "Article not found" });
        return;
      }

      const errors = validateFields(article.shopFloorSchema, data);
      if (errors.length > 0) {
        res.status(400).json({ error: "Validation Failed", details: errors });
        return;
      }

      const [newEntry] = await db.insert(entries).values({
        articleId,
        organization,
        data,
      }).returning();

      res.status(201).json(newEntry);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save entry" });
    }
  }
}

export { EntryController };
