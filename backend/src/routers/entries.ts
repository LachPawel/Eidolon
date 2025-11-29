import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc.js";
import { db } from "../db/index.js";
import { entries, entryValues, articles } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { validateFields } from "../utils/validation.js";
import type { FieldDefinition } from "../types/index.js";
import { ProductionEvents } from "../services/realtime.js";

export const entriesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        articleId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const whereClause = input.articleId ? eq(entries.articleId, input.articleId) : undefined;

      const allEntries = await db.query.entries.findMany({
        where: whereClause,
        with: {
          values: {
            with: {
              fieldDefinition: true,
            },
          },
          article: true,
        },
      });

      return allEntries.map((entry) => ({
        id: entry.id,
        articleId: entry.articleId,
        articleName: entry.article.name,
        quantity: entry.quantity,
        status: entry.status,
        priority: entry.priority,
        startedAt: entry.startedAt,
        completedAt: entry.completedAt,
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

  getStats: publicProcedure.query(async () => {
    const allEntries = await db.query.entries.findMany();

    const activeJobs = allEntries.filter((e) => e.status === "IN PRODUCTION").length;
    const completedJobs = allEntries.filter((e) => e.status === "READY").length;

    const counts = allEntries.reduce(
      (acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const stages = ["PREPARATION", "IN PRODUCTION"];
    let bottleneckStage = "None";
    let bottleneckCount = 0;

    for (const stage of stages) {
      if ((counts[stage] || 0) > bottleneckCount) {
        bottleneckCount = counts[stage] || 0;
        bottleneckStage = stage;
      }
    }

    const total = allEntries.length;
    const efficiency = total > 0 ? Math.round((completedJobs / total) * 100) : 0;

    return {
      activeJobs,
      completedJobs,
      bottleneckStage,
      efficiency,
    };
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        quantity: z.number().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Get current entry to detect status change
      const currentEntry = await db.query.entries.findFirst({
        where: eq(entries.id, input.id),
      });

      const [updatedEntry] = await db
        .update(entries)
        .set({
          ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          updatedAt: new Date(),
        })
        .where(eq(entries.id, input.id))
        .returning();

      // Broadcast real-time update
      if (input.status && currentEntry && currentEntry.status !== input.status) {
        // Status changed - broadcast status change event
        ProductionEvents.statusChanged(input.id, currentEntry.status, input.status).catch((err) =>
          console.error("[Realtime] Failed to broadcast:", err)
        );
      } else {
        // General update
        ProductionEvents.entryUpdated(input.id, {
          quantity: updatedEntry.quantity,
          status: updatedEntry.status,
        }).catch((err) => console.error("[Realtime] Failed to broadcast:", err));
      }

      return updatedEntry;
    }),

  create: publicProcedure
    .input(
      z.object({
        articleId: z.number(),
        quantity: z.number().optional().default(1),
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
            quantity: input.quantity,
            status: "PREPARATION",
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

        // Broadcast real-time event for new entry
        ProductionEvents.entryCreated(newEntry.id, {
          articleId: newEntry.articleId,
          quantity: newEntry.quantity,
          status: newEntry.status,
        }).catch((err) => console.error("[Realtime] Failed to broadcast:", err));

        return newEntry;
      });
    }),
});
