import { Request, Response } from "express";
import { db } from "../db/index.js";
import { articles, fieldDefinitions, fieldValidations } from "../db/schema.js";
import { eq, and, like } from "drizzle-orm";
import { Article } from "../types/index.js";

class ArticlesController {
  async getArticles(req: Request, res: Response) {
    try {
      const allArticles = await db.query.articles.findMany({
        with: {
          fieldDefinitions: {
            with: {
              validation: true,
            },
          },
        },
      });

      const formattedArticles: Article[] = allArticles.map((article) => ({
        id: article.id,
        name: article.name,
        organization: article.organization,
        status: article.status as "draft" | "active" | "archived",
        attributeFields: article.fieldDefinitions
          .filter((fd) => fd.scope === "attribute")
          .map((fd) => ({
            id: fd.id,
            fieldKey: fd.fieldKey,
            fieldLabel: fd.fieldLabel,
            fieldType: fd.fieldType as "text" | "number" | "boolean" | "select",
            scope: "attribute" as const,
            validation: fd.validation
              ? {
                  required: fd.validation.required ?? false,
                  min: fd.validation.min
                    ? Number(fd.validation.min)
                    : undefined,
                  max: fd.validation.max
                    ? Number(fd.validation.max)
                    : undefined,
                  options: fd.validation.options ?? undefined,
                }
              : undefined,
          })),
        shopFloorFields: article.fieldDefinitions
          .filter((fd) => fd.scope === "shop_floor")
          .map((fd) => ({
            id: fd.id,
            fieldKey: fd.fieldKey,
            fieldLabel: fd.fieldLabel,
            fieldType: fd.fieldType as "text" | "number" | "boolean" | "select",
            scope: "shop_floor" as const,
            validation: fd.validation
              ? {
                  required: fd.validation.required ?? false,
                  min: fd.validation.min
                    ? Number(fd.validation.min)
                    : undefined,
                  max: fd.validation.max
                    ? Number(fd.validation.max)
                    : undefined,
                  options: fd.validation.options ?? undefined,
                }
              : undefined,
          })),
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      }));

      res.json(formattedArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  }

  async addArticle(req: Request, res: Response) {
    try {
      const {
        name,
        organization,
        status,
        attributeFields,
        shopFloorFields,
      }: Article = req.body;

      if (!name || !organization) {
        return res
          .status(400)
          .json({ error: "Name and organization are required" });
      }

      // Start transaction
      const result = await db.transaction(async (tx) => {
        // Insert article
        const [newArticle] = await tx
          .insert(articles)
          .values({
            name,
            organization,
            status: status || "draft",
          })
          .returning();

        // Insert attribute fields
        if (attributeFields && attributeFields.length > 0) {
          for (const field of attributeFields) {
            const [fieldDef] = await tx
              .insert(fieldDefinitions)
              .values({
                articleId: newArticle.id,
                fieldKey: field.fieldKey,
                fieldLabel: field.fieldLabel,
                fieldType: field.fieldType,
                scope: "attribute",
              })
              .returning();

            if (field.validation) {
              await tx.insert(fieldValidations).values({
                fieldDefinitionId: fieldDef.id,
                required: field.validation.required ?? false,
                min: field.validation.min?.toString(),
                max: field.validation.max?.toString(),
                options: field.validation.options,
              });
            }
          }
        }

        return newArticle;
      });

      // Fetch the complete article with fields
      const completeArticle = await db.query.articles.findFirst({
        where: eq(articles.id, result.id),
        with: {
          fieldDefinitions: {
            with: {
              validation: true,
            },
          },
        },
      });

      res.status(201).json(completeArticle);
    } catch (error) {
      console.error("Error adding article:", error);
      res.status(500).json({ error: "Failed to add article" });
    }
  }
}

export { ArticlesController };
