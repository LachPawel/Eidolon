import { Request, Response } from "express";
import { readData, writeData } from "../utils/index.js";
import { Article } from "../types/index.js";
import { randomUUID } from "crypto";

class ArticlesController {
  async getArticles(req: Request, res: Response) {
    try {
      const { organization, status } = req.query;
      let articles = await readData("articles.json", "articles");

      if (typeof organization === "string")
        articles = articles.filter(
          (article: Article) => article.organization === organization
        );
      if (typeof status === "string")
        articles = articles.filter(
          (article: Article) => article.status === status
        );

      res.json({ articles });
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

      const articles = await readData("articles.json", "articles");

      const newArticle: Article = {
        id: randomUUID(),
        organization,
        name,
        status: status || "draft",
        attributeSchema: attributeSchema || [],
        attributes: {},
        shopFloorSchema: shopFloorSchema || [],
        createdAt: new Date().toISOString(),
      };

      articles.push(newArticle);
      await writeData("articles.json", "articles", articles);

      res.status(201).json(newArticle);
    } catch (error) {
      res.status(500).json({ error: "Failed to save article" });
    }
  }
}

export { ArticlesController };
