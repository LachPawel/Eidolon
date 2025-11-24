import { faker } from "@faker-js/faker";
import { industryTemplates, IndustryTemplate, FieldTemplate } from "./industryTemplates.js";
import { FieldDefinition } from "../types/index.js";

interface GeneratedArticle {
  name: string;
  organization: string;
  status: "draft" | "active" | "archived";
  shopFloorFields: FieldDefinition[];
  attributeFields: FieldDefinition[];
}

/**
 * Generates a random article name from industry template
 */
function generateArticleName(template: IndustryTemplate): string {
  const prefix = faker.helpers.arrayElement(template.articlePrefixes);
  const suffix = faker.helpers.arrayElement(template.articleSuffixes);
  const variant = faker.number.int({ min: 100, max: 999 });
  
  return `${prefix} ${suffix} ${variant}`;
}

/**
 * Selects random field templates for an article
 */
function selectRandomFields(template: IndustryTemplate, min: number = 2, max: number = 10): FieldTemplate[] {
  const fieldCount = faker.number.int({ min, max });
  return faker.helpers.arrayElements(template.fieldTemplates, fieldCount);
}

/**
 * Converts field template to field definition with proper structure
 */
function fieldTemplateToDefinition(template: FieldTemplate, scope: "attribute" | "shop_floor"): FieldDefinition {
  return {
    fieldKey: template.fieldKey,
    fieldLabel: template.fieldLabel,
    fieldType: template.fieldType,
    scope,
    validation: template.validation,
  };
}

/**
 * Generates a single article for a specific industry
 */
export function generateArticle(industryKey: string): GeneratedArticle {
  const template = industryTemplates[industryKey];
  
  if (!template) {
    throw new Error(`Industry template not found: ${industryKey}`);
  }

  const organization = faker.helpers.arrayElement(template.organizations);
  const name = generateArticleName(template);
  const status = faker.helpers.weightedArrayElement([
    { value: "active" as const, weight: 8 },
    { value: "draft" as const, weight: 1 },
    { value: "archived" as const, weight: 1 },
  ]);

  // Generate shop floor fields (2-10 fields)
  const shopFloorFieldTemplates = selectRandomFields(template, 2, 10);
  const shopFloorFields = shopFloorFieldTemplates.map(ft => 
    fieldTemplateToDefinition(ft, "shop_floor")
  );

  // Generate attribute fields (0-5 fields) - less common
  const hasAttributes = faker.datatype.boolean({ probability: 0.3 });
  const attributeFields = hasAttributes
    ? selectRandomFields(template, 0, 5).map(ft => 
        fieldTemplateToDefinition(ft, "attribute")
      )
    : [];

  return {
    name,
    organization,
    status,
    shopFloorFields,
    attributeFields,
  };
}

/**
 * Generates multiple articles distributed across industries
 */
export function generateArticles(totalCount: number = 10000): GeneratedArticle[] {
  const articles: GeneratedArticle[] = [];
  const industries = Object.keys(industryTemplates);
  const articlesPerIndustry = Math.floor(totalCount / industries.length);

  console.log(`Generating ${totalCount} articles across ${industries.length} industries...`);
  console.log(`~${articlesPerIndustry} articles per industry\n`);

  for (const industryKey of industries) {
    const template = industryTemplates[industryKey];
    console.log(`Generating articles for: ${template.name}`);
    
    for (let i = 0; i < articlesPerIndustry; i++) {
      articles.push(generateArticle(industryKey));
      
      if ((i + 1) % 500 === 0) {
        console.log(`  - Generated ${i + 1}/${articlesPerIndustry}`);
      }
    }
  }

  // Generate remaining articles to reach exact total
  const remaining = totalCount - articles.length;
  if (remaining > 0) {
    console.log(`\nGenerating ${remaining} additional articles...`);
    for (let i = 0; i < remaining; i++) {
      const randomIndustry = faker.helpers.arrayElement(industries);
      articles.push(generateArticle(randomIndustry));
    }
  }

  console.log(`\n✓ Total articles generated: ${articles.length}`);
  return articles;
}

/**
 * Get summary statistics of generated articles
 */
export function getArticleStatistics(articles: GeneratedArticle[]): void {
  const byIndustry: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byOrganization: Record<string, number> = {};
  
  let totalShopFloorFields = 0;
  let totalAttributeFields = 0;

  for (const article of articles) {
    // Find which industry this article belongs to
    for (const [key, template] of Object.entries(industryTemplates)) {
      if (template.organizations.includes(article.organization)) {
        byIndustry[template.name] = (byIndustry[template.name] || 0) + 1;
        break;
      }
    }

    byStatus[article.status] = (byStatus[article.status] || 0) + 1;
    byOrganization[article.organization] = (byOrganization[article.organization] || 0) + 1;
    
    totalShopFloorFields += article.shopFloorFields.length;
    totalAttributeFields += article.attributeFields.length;
  }

  console.log("\n" + "=".repeat(60));
  console.log("ARTICLE GENERATION STATISTICS");
  console.log("=".repeat(60));
  
  console.log("\nBy Industry:");
  Object.entries(byIndustry).forEach(([industry, count]) => {
    console.log(`  ${industry}: ${count} articles`);
  });

  console.log("\nBy Status:");
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} articles`);
  });

  console.log("\nBy Organization:");
  const topOrgs = Object.entries(byOrganization)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  topOrgs.forEach(([org, count]) => {
    console.log(`  ${org}: ${count} articles`);
  });

  console.log("\nField Statistics:");
  console.log(`  Average shop floor fields per article: ${(totalShopFloorFields / articles.length).toFixed(2)}`);
  console.log(`  Average attribute fields per article: ${(totalAttributeFields / articles.length).toFixed(2)}`);
  console.log(`  Total field definitions: ${totalShopFloorFields + totalAttributeFields}`);
  
  console.log("=".repeat(60) + "\n");
}
