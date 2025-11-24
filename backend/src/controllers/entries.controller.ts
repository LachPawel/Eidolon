import { Request, Response } from "express";
import { validateFields } from "../utils/index.js";
import { db } from "../db/index.js";
import { entries, entryValues, fieldDefinitions } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { Entry } from "../types/index.js";

class EntryController {
  async getEntries(req: Request, res: Response) {
    try {
      const articleId = parseInt(req.params.articleId);

      if (isNaN(articleId)) {
        return res.status(400).json({ error: "Invalid article ID" });
      }

      const allEntries = await db.query.entries.findMany({
        where: eq(entries.articleId, articleId),
        with: {
          values: {
            with: {
              fieldDefinition: true,
            },
          },
        },
      });

      const formattedEntries: Entry[] = allEntries.map((entry) => ({
        id: entry.id,
        articleId: entry.articleId,
        values: entry.values.map((val) => ({
          fieldDefinitionId: val.fieldDefinitionId,
          valueText: val.valueText ?? undefined,
          valueNumber: val.valueNumber ? Number(val.valueNumber) : undefined,
          valueBoolean: val.valueBoolean ?? undefined,
        })),
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      }));

      res.json(formattedEntries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  }

  async addEntry(req: Request, res: Response) {
    try {
      const articleId = parseInt(req.params.articleId);
      const { values }: { values: Record<string, any> } = req.body;

      if (isNaN(articleId)) {
        return res.status(400).json({ error: "Invalid article ID" });
      }

      // Fetch article with field definitions and validations
      const article = await db.query.articles.findFirst({
        where: eq(entries.articleId, articleId),
        with: {
          fieldDefinitions: {
            where: eq(fieldDefinitions.scope, "shop_floor"),
            with: {
              validation: true,
            },
          },
        },
      });

      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      // Convert field definitions to the format expected by validateFields
      const schema = article.fieldDefinitions.map((fd) => ({
        id: fd.id,
        fieldKey: fd.fieldKey,
        fieldLabel: fd.fieldLabel,
        fieldType: fd.fieldType as "text" | "number" | "boolean" | "select",
        scope: "shop_floor" as const,
        validation: fd.validation
          ? {
              required: fd.validation.required ?? false,
              min: fd.validation.min ? Number(fd.validation.min) : undefined,
              max: fd.validation.max ? Number(fd.validation.max) : undefined,
              options: fd.validation.options ?? undefined,
            }
          : undefined,
      }));

      // Validate the entry data
      const validationErrors = validateFields(schema, values);
      if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
      }
      // Start transaction
      const result = await db.transaction(async (tx) => {
        // Insert entry
        const [newEntry] = await tx
          .insert(entries)
          .values({
            articleId,
          })
          .returning();

        // Insert entry values
        for (const field of schema) {
          const value = values[field.fieldKey];

          if (value === undefined || value === null) continue;

          const entryValueData: any = {
            entryId: newEntry.id,
            fieldDefinitionId: field.id!,
          };

          // Store value in appropriate column based on field type
          switch (field.fieldType) {
            case "text":
            case "select":
              entryValueData.valueText = String(value);
              break;
            case "number":
              entryValueData.valueNumber = String(value);
              break;
            case "boolean":
              entryValueData.valueBoolean = Boolean(value);
              break;
          }

          await tx.insert(entryValues).values(entryValueData);
        }

        return newEntry;
      });

      // Fetch the complete entry with values
      const completeEntry = await db.query.entries.findFirst({
        where: eq(entries.id, result.id),
        with: {
          values: {
            with: {
              fieldDefinition: true,
            },
          },
        },
      });

      res.status(201).json(completeEntry);
    } catch (error) {
      console.error("Error adding entry:", error);
      res.status(500).json({ error: "Failed to add entry" });
    }
  }
}

export { EntryController };
