import { expect } from "chai";
import { db } from "../../db/index.js";
import { articles, fieldDefinitions, fieldValidations } from "../../db/schema.js";
import { generateArticles } from "../../seeds/generator.js";
import { cleanDatabase } from "../setup.js";
import { eq, sql } from "drizzle-orm";

describe("Seeding Integration", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("Small scale seeding", () => {
    it("should seed 10 articles with field definitions", async () => {
      const generatedArticles = generateArticles(10);

      // Insert articles
      for (const article of generatedArticles) {
        await db.transaction(async (tx) => {
          const [newArticle] = await tx
            .insert(articles)
            .values({
              name: article.name,
              organization: article.organization,
              status: article.status,
            })
            .returning();

          // Insert shop floor fields
          for (const field of article.shopFloorFields) {
            const [fieldDef] = await tx
              .insert(fieldDefinitions)
              .values({
                articleId: newArticle.id,
                fieldKey: field.fieldKey,
                fieldLabel: field.fieldLabel,
                fieldType: field.fieldType,
                scope: "shop_floor",
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

          // Insert attribute fields
          for (const field of article.attributeFields) {
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
        });
      }

      // Verify articles were inserted
      const allArticles = await db.select().from(articles);
      expect(allArticles).to.have.lengthOf(10);

      // Verify field definitions were created
      const allFieldDefs = await db.select().from(fieldDefinitions);
      expect(allFieldDefs.length).to.be.greaterThan(20); // At least 2 fields per article

      // Verify field validations were created
      const allValidations = await db.select().from(fieldValidations);
      expect(allValidations.length).to.be.greaterThan(0);
    });

    it("should query articles with field definitions using joins", async () => {
      const generatedArticles = generateArticles(5);

      // Insert one article
      const article = generatedArticles[0];
      await db.transaction(async (tx) => {
        const [newArticle] = await tx
          .insert(articles)
          .values({
            name: article.name,
            organization: article.organization,
            status: article.status,
          })
          .returning();

        for (const field of article.shopFloorFields) {
          const [fieldDef] = await tx
            .insert(fieldDefinitions)
            .values({
              articleId: newArticle.id,
              fieldKey: field.fieldKey,
              fieldLabel: field.fieldLabel,
              fieldType: field.fieldType,
              scope: "shop_floor",
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
      });

      // Query with relations
      const result = await db.query.articles.findMany({
        with: {
          fieldDefinitions: {
            with: {
              validation: true,
            },
          },
        },
      });

      expect(result).to.have.lengthOf(1);
      expect(result[0].fieldDefinitions.length).to.equal(
        article.shopFloorFields.length
      );

      // Verify field definitions have correct scope
      result[0].fieldDefinitions.forEach((fd) => {
        expect(fd.scope).to.equal("shop_floor");
        expect(fd.validation).to.exist;
      });
    });

    it("should handle articles with different statuses", async () => {
      const generatedArticles = generateArticles(20);

      for (const article of generatedArticles) {
        await db.insert(articles).values({
          name: article.name,
          organization: article.organization,
          status: article.status,
        });
      }

      // Count by status
      const activeCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(eq(articles.status, "active"));

      const draftCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(eq(articles.status, "draft"));

      const archivedCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(eq(articles.status, "archived"));

      // Active should be the most common
      expect(Number(activeCount[0].count)).to.be.greaterThan(
        Number(draftCount[0].count)
      );
      expect(Number(activeCount[0].count)).to.be.greaterThan(
        Number(archivedCount[0].count)
      );
    });

    it("should maintain referential integrity", async () => {
      const generatedArticles = generateArticles(3);

      for (const article of generatedArticles) {
        await db.transaction(async (tx) => {
          const [newArticle] = await tx
            .insert(articles)
            .values({
              name: article.name,
              organization: article.organization,
              status: article.status,
            })
            .returning();

          for (const field of article.shopFloorFields.slice(0, 3)) {
            const [fieldDef] = await tx
              .insert(fieldDefinitions)
              .values({
                articleId: newArticle.id,
                fieldKey: field.fieldKey,
                fieldLabel: field.fieldLabel,
                fieldType: field.fieldType,
                scope: "shop_floor",
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
        });
      }

      const allArticles = await db.select().from(articles);
      const allFieldDefs = await db.select().from(fieldDefinitions);

      // Each field definition should reference an existing article
      for (const fieldDef of allFieldDefs) {
        const articleExists = allArticles.some((a) => a.id === fieldDef.articleId);
        expect(articleExists).to.be.true;
      }
    });
  });

  describe("Data distribution", () => {
    it("should distribute organizations across industries", async () => {
      const generatedArticles = generateArticles(40);

      for (const article of generatedArticles) {
        await db.insert(articles).values({
          name: article.name,
          organization: article.organization,
          status: article.status,
        });
      }

      const allArticles = await db.select().from(articles);
      const organizations = new Set(allArticles.map((a) => a.organization));

      // Should have multiple organizations
      expect(organizations.size).to.be.at.least(10);
    });

    it("should create diverse field types", async () => {
      const generatedArticles = generateArticles(10);

      for (const article of generatedArticles) {
        await db.transaction(async (tx) => {
          const [newArticle] = await tx
            .insert(articles)
            .values({
              name: article.name,
              organization: article.organization,
              status: article.status,
            })
            .returning();

          for (const field of article.shopFloorFields) {
            await tx.insert(fieldDefinitions).values({
              articleId: newArticle.id,
              fieldKey: field.fieldKey,
              fieldLabel: field.fieldLabel,
              fieldType: field.fieldType,
              scope: "shop_floor",
            });
          }
        });
      }

      const allFieldDefs = await db.select().from(fieldDefinitions);
      const fieldTypes = new Set(allFieldDefs.map((f) => f.fieldType));

      // Should have multiple field types
      expect(fieldTypes.size).to.be.at.least(3);
      expect(fieldTypes).to.include.members(["text", "number"]);
    });
  });
});
