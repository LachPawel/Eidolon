import { z } from "zod";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../db/index.js";
import { articles, fieldDefinitions, fieldValidations } from "../db/schema.js";
import { eq, and, like } from "drizzle-orm";

const fieldValidationSchema = z
  .object({
    required: z.boolean().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    options: z.array(z.string()).optional(),
  })
  .optional();

const fieldSchema = z.object({
  fieldKey: z.string(),
  fieldLabel: z.string(),
  fieldType: z.enum(["text", "number", "boolean", "select"]),
  scope: z.enum(["attribute", "shop_floor"]),
  validation: fieldValidationSchema,
});

export const articlesRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          organization: z.string().optional(),
          status: z.enum(["draft", "active", "archived"]).optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input?.organization) {
        conditions.push(eq(articles.organization, input.organization));
      }

      if (input?.status) {
        conditions.push(eq(articles.status, input.status));
      }

      if (input?.search) {
        conditions.push(like(articles.name, `%${input.search}%`));
      }

      const allArticles =
        conditions.length > 0
          ? await db.query.articles.findMany({
              where: and(...conditions),
              with: {
                fieldDefinitions: {
                  with: {
                    validation: true,
                  },
                },
              },
            })
          : await db.query.articles.findMany({
              with: {
                fieldDefinitions: {
                  with: {
                    validation: true,
                  },
                },
              },
            });

      return allArticles.map((article) => ({
        id: article.id,
        name: article.name,
        organization: article.organization,
        status: article.status,
        attributeFields: article.fieldDefinitions
          .filter((fd) => fd.scope === "attribute")
          .map((fd) => ({
            id: fd.id,
            fieldKey: fd.fieldKey,
            fieldLabel: fd.fieldLabel,
            fieldType: fd.fieldType,
            scope: "attribute" as const,
            validation: fd.validation
              ? {
                  required: fd.validation.required ?? false,
                  min: fd.validation.min ? Number(fd.validation.min) : undefined,
                  max: fd.validation.max ? Number(fd.validation.max) : undefined,
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
            fieldType: fd.fieldType,
            scope: "shop_floor" as const,
            validation: fd.validation
              ? {
                  required: fd.validation.required ?? false,
                  min: fd.validation.min ? Number(fd.validation.min) : undefined,
                  max: fd.validation.max ? Number(fd.validation.max) : undefined,
                  options: fd.validation.options ?? undefined,
                }
              : undefined,
          })),
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      }));
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        organization: z.string(),
        status: z.enum(["draft", "active", "archived"]),
        attributeFields: z.array(fieldSchema).optional(),
        shopFloorFields: z.array(fieldSchema).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.transaction(async (tx) => {
        const [newArticle] = await tx
          .insert(articles)
          .values({
            name: input.name,
            organization: input.organization,
            status: input.status,
          })
          .returning();

        const allFields = [...(input.attributeFields || []), ...(input.shopFloorFields || [])];

        if (allFields.length > 0) {
          for (const field of allFields) {
            const [fieldDef] = await tx
              .insert(fieldDefinitions)
              .values({
                articleId: newArticle.id,
                fieldKey: field.fieldKey,
                fieldLabel: field.fieldLabel,
                fieldType: field.fieldType,
                scope: field.scope,
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
    }),
});
