import { z } from "zod";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../db/index.js";
import { articles, fieldDefinitions, fieldValidations } from "../db/schema.js";
import { eq, and, ilike } from "drizzle-orm";
import {
  searchArticles as algoliaSearch,
  syncArticleToAlgolia,
  deleteArticleFromAlgolia,
  isAlgoliaConfigured,
} from "../services/algolia.js";
import {
  findSimilarArticles,
  getFieldSuggestions,
  getValidationHints,
  indexArticle,
  deleteArticleFromPinecone,
  isPineconeConfigured,
} from "../services/pinecone.js";
import {
  measurePerformance,
  compareSearchPerformance,
  generateBenchmarkReport,
  getRecentMetricsSummary,
  exportMetrics,
} from "../services/performance.js";

const fieldValidationSchema = z
  .object({
    required: z.boolean().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    options: z.array(z.string()).optional(),
  })
  .optional();

const fieldSchema = z.object({
  id: z.number().optional(),
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
          limit: z.number().min(1).max(100).default(20),
          cursor: z.number().optional(),
          organization: z.string().optional(),
          status: z.enum(["draft", "active", "archived"]).optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;
      const conditions: ReturnType<typeof eq>[] = [];

      if (input?.organization) {
        conditions.push(eq(articles.organization, input.organization));
      }

      if (input?.status) {
        conditions.push(eq(articles.status, input.status));
      }

      if (input?.search) {
        conditions.push(ilike(articles.name, `%${input.search}%`));
      }

      // Wrap database query in performance measurement when searching
      const fetchArticles = async () => {
        return conditions.length > 0
          ? await db.query.articles.findMany({
              where: and(...conditions),
              limit: limit + 1,
              offset: cursor || 0,
              with: {
                fieldDefinitions: {
                  with: {
                    validation: true,
                  },
                },
              },
            })
          : await db.query.articles.findMany({
              limit: limit + 1,
              offset: cursor || 0,
              with: {
                fieldDefinitions: {
                  with: {
                    validation: true,
                  },
                },
              },
            });
      };

      // Track postgres search performance when there's a search query
      const allArticles = input?.search
        ? (await measurePerformance("postgres-search", fetchArticles, { query: input.search }))
            .result
        : await fetchArticles();

      let nextCursor: number | undefined = undefined;
      if (allArticles.length > limit) {
        allArticles.pop();
        nextCursor = (cursor || 0) + limit;
      }

      return {
        items: allArticles.map((article) => ({
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
        })),
        nextCursor,
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        organization: z.string().min(1, "Organization is required"),
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

        // Sync to search services (non-blocking)
        const fieldDefsForSync = allFields.map((f) => ({
          fieldKey: f.fieldKey,
          fieldLabel: f.fieldLabel,
          fieldType: f.fieldType,
        }));

        syncArticleToAlgolia({
          id: newArticle.id,
          name: newArticle.name,
          organization: newArticle.organization,
          status: newArticle.status,
          fieldDefinitions: fieldDefsForSync,
        }).catch((err) => console.error("[Algolia] Sync error:", err));

        indexArticle({
          id: newArticle.id,
          name: newArticle.name,
          organization: newArticle.organization,
          fieldDefinitions: fieldDefsForSync,
        }).catch((err) => console.error("[Pinecone] Index error:", err));

        return newArticle;
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        organization: z.string().optional(),
        status: z.enum(["draft", "active", "archived"]).optional(),
        attributeFields: z.array(fieldSchema).optional(),
        shopFloorFields: z.array(fieldSchema).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.transaction(async (tx) => {
        // Update article details
        if (input.name || input.organization || input.status) {
          await tx
            .update(articles)
            .set({
              name: input.name,
              organization: input.organization,
              status: input.status,
              updatedAt: new Date(),
            })
            .where(eq(articles.id, input.id));
        }

        // Handle fields if provided
        const allInputFields = [...(input.attributeFields || []), ...(input.shopFloorFields || [])];

        if (input.attributeFields || input.shopFloorFields) {
          // Get existing fields
          const existingFields = await tx.query.fieldDefinitions.findMany({
            where: eq(fieldDefinitions.articleId, input.id),
          });

          const existingFieldIds = new Set(existingFields.map((f) => f.id));
          const inputFieldIds = new Set(allInputFields.filter((f) => f.id).map((f) => f.id));

          // Delete fields not in input
          const fieldsToDelete = existingFields.filter((f) => !inputFieldIds.has(f.id));
          for (const field of fieldsToDelete) {
            await tx.delete(fieldDefinitions).where(eq(fieldDefinitions.id, field.id));
          }

          // Update or Create fields
          for (const field of allInputFields) {
            if (field.id && existingFieldIds.has(field.id)) {
              // Update existing field
              await tx
                .update(fieldDefinitions)
                .set({
                  fieldKey: field.fieldKey,
                  fieldLabel: field.fieldLabel,
                  fieldType: field.fieldType,
                  scope: field.scope,
                })
                .where(eq(fieldDefinitions.id, field.id));

              // Update validation
              // First delete existing validation (easier than update)
              await tx
                .delete(fieldValidations)
                .where(eq(fieldValidations.fieldDefinitionId, field.id));

              if (field.validation) {
                await tx.insert(fieldValidations).values({
                  fieldDefinitionId: field.id,
                  required: field.validation.required ?? false,
                  min: field.validation.min?.toString(),
                  max: field.validation.max?.toString(),
                  options: field.validation.options,
                });
              }
            } else {
              // Create new field
              const [newFieldDef] = await tx
                .insert(fieldDefinitions)
                .values({
                  articleId: input.id,
                  fieldKey: field.fieldKey,
                  fieldLabel: field.fieldLabel,
                  fieldType: field.fieldType,
                  scope: field.scope,
                })
                .returning();

              if (field.validation) {
                await tx.insert(fieldValidations).values({
                  fieldDefinitionId: newFieldDef.id,
                  required: field.validation.required ?? false,
                  min: field.validation.min?.toString(),
                  max: field.validation.max?.toString(),
                  options: field.validation.options,
                });
              }
            }
          }
        }

        return { success: true };
      });
    }),

  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.delete(articles).where(eq(articles.id, input.id));

    // Remove from search services (non-blocking)
    deleteArticleFromAlgolia(input.id).catch((err) =>
      console.error("[Algolia] Delete error:", err)
    );
    deleteArticleFromPinecone(input.id).catch((err) =>
      console.error("[Pinecone] Delete error:", err)
    );

    return { success: true };
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, input.id),
      with: {
        fieldDefinitions: {
          with: {
            validation: true,
          },
        },
      },
    });

    if (!article) {
      return null;
    }

    return {
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
    };
  }),

  // ============================================
  // Fast Search with Algolia
  // ============================================
  fastSearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        organization: z.string().optional(),
        status: z.enum(["draft", "active", "archived"]).optional(),
        industry: z.string().optional(),
        hitsPerPage: z.number().min(1).max(100).default(20),
        page: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const { result, metrics } = await measurePerformance(
        "algolia-search",
        () =>
          algoliaSearch(
            input.query,
            {
              organization: input.organization,
              status: input.status,
              industry: input.industry,
            },
            { hitsPerPage: input.hitsPerPage, page: input.page }
          ),
        { query: input.query }
      );

      return {
        hits: result.hits,
        nbHits: result.nbHits,
        processingTimeMs: result.processingTimeMS,
        metrics: {
          durationMs: metrics.durationMs,
          operation: metrics.operation,
        },
      };
    }),

  // ============================================
  // Semantic Search with Pinecone
  // ============================================
  semanticSearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        organization: z.string().optional(),
        topK: z.number().min(1).max(20).default(5),
      })
    )
    .query(async ({ input }) => {
      const { result, metrics } = await measurePerformance(
        "pinecone-search",
        () => findSimilarArticles(input.query, input.organization, input.topK),
        { query: input.query, topK: input.topK }
      );

      return {
        matches: result.matches,
        metrics: {
          durationMs: metrics.durationMs,
          operation: metrics.operation,
        },
      };
    }),

  // ============================================
  // AI Field Suggestions
  // ============================================
  getAIHints: publicProcedure
    .input(
      z.object({
        articleName: z.string().min(1),
        materialType: z.string().min(1),
        existingFieldKeys: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      return getFieldSuggestions(input.articleName, input.materialType, input.existingFieldKeys);
    }),

  // ============================================
  // AI Validation Hints
  // ============================================
  getValidationHint: publicProcedure
    .input(
      z.object({
        materialType: z.string().min(1),
        fieldKey: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      return getValidationHints(input.materialType, input.fieldKey);
    }),

  // ============================================
  // Performance Monitoring
  // ============================================
  getSearchPerformance: publicProcedure.query(() => {
    return compareSearchPerformance();
  }),

  getBenchmarkReport: publicProcedure.query(() => {
    return generateBenchmarkReport();
  }),

  getRecentMetrics: publicProcedure
    .input(
      z
        .object({
          minutesAgo: z.number().min(1).max(60).default(5),
        })
        .optional()
    )
    .query(({ input }) => {
      return getRecentMetricsSummary(input?.minutesAgo ?? 5);
    }),

  exportPerformanceMetrics: publicProcedure.query(() => {
    return exportMetrics();
  }),

  // ============================================
  // Service Status
  // ============================================
  getSearchServicesStatus: publicProcedure.query(() => {
    return {
      algolia: {
        configured: isAlgoliaConfigured(),
        description: "Fast text search with typo tolerance",
      },
      pinecone: {
        configured: isPineconeConfigured(),
        description: "Semantic similarity search and AI hints",
      },
    };
  }),
});
