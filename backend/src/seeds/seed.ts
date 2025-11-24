import "dotenv/config";
import { db } from "../db/index.js";
import { articles, fieldDefinitions, fieldValidations } from "../db/schema.js";
import { generateArticles, getArticleStatistics } from "./generator.js";

const BATCH_SIZE = 100; // Insert articles in batches for better performance

async function seedDatabase(articleCount: number = 10000) {
  console.log("\n🌱 Starting database seeding...\n");
  console.log(`Target: ${articleCount} articles\n`);

  try {
    // Generate all articles
    const generatedArticles = generateArticles(articleCount);
    getArticleStatistics(generatedArticles);

    console.log("📦 Inserting articles into database...\n");
    
    let insertedCount = 0;
    let fieldDefinitionsCount = 0;
    let fieldValidationsCount = 0;

    // Process in batches
    for (let i = 0; i < generatedArticles.length; i += BATCH_SIZE) {
      const batch = generatedArticles.slice(i, i + BATCH_SIZE);
      
      await db.transaction(async (tx) => {
        for (const article of batch) {
          // Insert article
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

            fieldDefinitionsCount++;

            if (field.validation) {
              await tx.insert(fieldValidations).values({
                fieldDefinitionId: fieldDef.id,
                required: field.validation.required ?? false,
                min: field.validation.min?.toString(),
                max: field.validation.max?.toString(),
                options: field.validation.options,
              });
              fieldValidationsCount++;
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

            fieldDefinitionsCount++;

            if (field.validation) {
              await tx.insert(fieldValidations).values({
                fieldDefinitionId: fieldDef.id,
                required: field.validation.required ?? false,
                min: field.validation.min?.toString(),
                max: field.validation.max?.toString(),
                options: field.validation.options,
              });
              fieldValidationsCount++;
            }
          }

          insertedCount++;
        }
      });

      console.log(`  ✓ Inserted ${Math.min(i + BATCH_SIZE, generatedArticles.length)}/${generatedArticles.length} articles`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ DATABASE SEEDING COMPLETE!");
    console.log("=".repeat(60));
    console.log(`Articles inserted: ${insertedCount}`);
    console.log(`Field definitions created: ${fieldDefinitionsCount}`);
    console.log(`Field validations created: ${fieldValidationsCount}`);
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Get count from command line argument or default to 10000
const count = process.argv[2] ? parseInt(process.argv[2]) : 10000;

if (isNaN(count) || count <= 0) {
  console.error("❌ Invalid article count. Please provide a positive number.");
  process.exit(1);
}

seedDatabase(count);
