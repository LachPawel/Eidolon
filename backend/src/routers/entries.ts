import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../db/index.js";
import { entries, entryValues, articles } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { validateFields } from "../utils/validation.js";
import { FieldDefinition } from "../types/index.js";

export const entriesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        articleId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const allEntries = await db.query.entries.findMany({
        where: eq(entries.articleId, input.articleId),
        with: {
          values: {
            with: {
              fieldDefinition: true,
            },
          },
        },
      });

      return allEntries.map((entry) => ({
        id: entry.id,
        articleId: entry.articleId,
        values: entry.values.reduce(
          (acc, val) => {
            const key = val.fieldDefinition.fieldKey;
            // Convert number strings back to numbers
            if (val.valueNumber !== null) {
              acc[key] = Number(val.valueNumber);
            } else if (val.valueText !== null) {
              acc[key] = val.valueText;
            } else if (val.valueBoolean !== null) {
              acc[key] = val.valueBoolean;
            } else {
              acc[key] = null;
            }
            return acc;
          },
          {} as Record<string, string | number | boolean | null>
        ),
        createdAt: entry.createdAt,
      }));
    }),

  create: publicProcedure
    .input(
      z.object({
        articleId: z.number(),
        values: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
      })
    )
    .mutation(async ({ input }) => {
      return await db.transaction(async (tx) => {
        const article = await tx.query.articles.findFirst({
          where: eq(articles.id, input.articleId),
          with: {
            fieldDefinitions: {
              with: {
                validation: true,
              },
            },
          },
        });

        if (!article) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
        }

        const shopFloorFields = article.fieldDefinitions.filter((fd) => fd.scope === "shop_floor");

        // Convert to FieldDefinition format for validation
        const fieldSchema: FieldDefinition[] = shopFloorFields.map((fd) => ({
          id: fd.id,
          fieldKey: fd.fieldKey,
          fieldLabel: fd.fieldLabel,
          fieldType: fd.fieldType as "text" | "number" | "boolean" | "select",
          scope: fd.scope as "attribute" | "shop_floor",
          validation: fd.validation
            ? {
                required: fd.validation.required ?? false,
                min: fd.validation.min ? Number(fd.validation.min) : undefined,
                max: fd.validation.max ? Number(fd.validation.max) : undefined,
                options: fd.validation.options ?? undefined,
              }
            : undefined,
        }));

        // Validate field values
        const validationErrors = validateFields(fieldSchema, input.values);
        if (validationErrors.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validationErrors.join(", "),
          });
        }

        const [newEntry] = await tx
          .insert(entries)
          .values({
            articleId: input.articleId,
          })
          .returning();

        for (const [fieldKey, value] of Object.entries(input.values)) {
          const fieldDef = shopFloorFields.find((fd) => fd.fieldKey === fieldKey);

          if (!fieldDef) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Field ${fieldKey} not found in article schema`,
            });
          }

          let valueText: string | null = null;
          let valueNumber: string | null = null;
          let valueBoolean: boolean | null = null;

          if (fieldDef.fieldType === "text" || fieldDef.fieldType === "select") {
            valueText = String(value);
          } else if (fieldDef.fieldType === "number") {
            valueNumber = String(value);
          } else if (fieldDef.fieldType === "boolean") {
            valueBoolean = Boolean(value);
          }

          await tx.insert(entryValues).values({
            entryId: newEntry.id,
            fieldDefinitionId: fieldDef.id,
            valueText,
            valueNumber,
            valueBoolean,
          });
        }

        return newEntry;
      });
    }),
});
