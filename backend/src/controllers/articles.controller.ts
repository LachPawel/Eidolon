import { Request, Response } from "express";
import { db } from "../db/index.js";
import { articles } from "../db/schema.js";
import { eq, and, like } from "drizzle-orm";

class ArticlesController {
  async getArticles(req: Request, res: Response) {
    try {
      const { organization, status, search } = req.query;

      let conditions = [];

      if (typeof organization === "string") {
        conditions.push(eq(articles.organization, organization));
      }

      if (typeof status === "string") {
        conditions.push(eq(articles.status, status));
      }

      if (typeof search === "string" && search.length > 0) {
        conditions.push(like(articles.name, `%${search}%`));
      }

      const result =
        conditions.length > 0
          ? await db
              .select()
              .from(articles)
              .where(and(...conditions))
          : await db.select().from(articles);

      res.json({ articles: result });
    } catch (error) {
      res.status(500).json({ error: "Failed to load articles" });
    }
  }

  async addArticle(req: Request, res: Response) {
    try {
      const { organization, name, status, attributeSchema, shopFloorSchema } =
        req.body;

      if (!organization || !name) {
        res.status(400).json({ error: "Organization and Name are required" });
        return;
      }

      const [newArticle] = await db.insert(articles).values({
        organization,
        name,
        status: status || "draft",
        attributeSchema: attributeSchema || [],
        attributes: {},
        shopFloorSchema: shopFloorSchema || [],
      }).returning();

      res.status(201).json(newArticle);
    } catch (error) {
      res.status(500).json({ error: "Failed to save article" });
    }
  }
}

export { ArticlesController };
