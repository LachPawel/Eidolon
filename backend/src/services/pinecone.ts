import { Pinecone, Index as PineconeIndex } from "@pinecone-database/pinecone";
import OpenAI from "openai";

// Lazy-initialized clients
let pineconeClient: Pinecone | null = null;
let openaiClient: OpenAI | null = null;
let indexInstance: PineconeIndex | null = null;

function getPinecone(): Pinecone | null {
  if (!pineconeClient && process.env.PINECONE_API_KEY) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pineconeClient;
}

function getOpenAI(): OpenAI | null {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// Pinecone index name
const INDEX_NAME = "eidolon-articles";

function getIndex(): PineconeIndex | null {
  if (!indexInstance) {
    const pc = getPinecone();
    if (pc) {
      const indexName = process.env.PINECONE_INDEX_NAME || INDEX_NAME;
      indexInstance = pc.index(indexName);
    }
  }
  return indexInstance;
}

export interface ArticleVectorMetadata {
  name: string;
  organization: string;
  industry: string;
  fieldKeys: string[];
  fieldLabels: string[];
  fieldTypes: string[];
}

export interface SimilarArticleMatch {
  id: string;
  score: number;
  metadata: ArticleVectorMetadata;
}

export interface FieldSuggestion {
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  reason: string;
  confidence: number;
}

/**
 * Detects industry based on article name and organization
 */
function detectIndustry(name: string, org: string): string {
  const text = `${name} ${org}`.toLowerCase();
  if (text.includes("plastic") || text.includes("polymer") || text.includes("injection")) {
    return "plastic-textile";
  }
  if (text.includes("metal") || text.includes("steel") || text.includes("aluminum")) {
    return "metal-automotive";
  }
  if (text.includes("pharma") || text.includes("medical") || text.includes("tablet")) {
    return "pharmaceutical";
  }
  if (text.includes("chem") || text.includes("catalyst") || text.includes("reactor")) {
    return "chemistry-process";
  }
  return "general";
}

/**
 * Generate embeddings using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI();
  if (!openai) {
    console.log("[Pinecone] Embedding generation skipped - OpenAI not configured");
    return [];
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 1536,
  });

  return response.data[0].embedding;
}

/**
 * Create a searchable text representation of an article
 */
function articleToText(article: {
  name: string;
  organization: string;
  fieldDefinitions?: { fieldKey: string; fieldLabel: string; fieldType: string }[];
}): string {
  const fields =
    article.fieldDefinitions?.map((f) => `${f.fieldLabel} (${f.fieldType})`).join(", ") || "";
  return `${article.name} by ${article.organization}. Fields: ${fields}`;
}

/**
 * Index an article in Pinecone
 */
export async function indexArticle(article: {
  id: number;
  name: string;
  organization: string;
  fieldDefinitions?: { fieldKey: string; fieldLabel: string; fieldType: string }[];
}): Promise<void> {
  const index = getIndex();
  if (!index) {
    console.log("[Pinecone] Indexing skipped - not configured");
    return;
  }

  const text = articleToText(article);
  const embedding = await generateEmbedding(text);

  if (embedding.length === 0) return;

  await index.upsert([
    {
      id: article.id.toString(),
      values: embedding,
      metadata: {
        name: article.name,
        organization: article.organization,
        industry: detectIndustry(article.name, article.organization),
        fieldKeys: article.fieldDefinitions?.map((f) => f.fieldKey) || [],
        fieldLabels: article.fieldDefinitions?.map((f) => f.fieldLabel) || [],
        fieldTypes: article.fieldDefinitions?.map((f) => f.fieldType) || [],
      },
    },
  ]);
}

/**
 * Bulk index multiple articles in Pinecone
 */
export async function bulkIndexArticles(
  articles: Array<{
    id: number;
    name: string;
    organization: string;
    fieldDefinitions?: { fieldKey: string; fieldLabel: string; fieldType: string }[];
  }>
): Promise<void> {
  const index = getIndex();
  if (!index) {
    console.log("[Pinecone] Bulk indexing skipped - not configured");
    return;
  }

  // Process in batches of 100
  const batchSize = 100;
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);

    const vectors = await Promise.all(
      batch.map(async (article) => {
        const text = articleToText(article);
        const embedding = await generateEmbedding(text);

        return {
          id: article.id.toString(),
          values: embedding,
          metadata: {
            name: article.name,
            organization: article.organization,
            industry: detectIndustry(article.name, article.organization),
            fieldKeys: article.fieldDefinitions?.map((f) => f.fieldKey) || [],
            fieldLabels: article.fieldDefinitions?.map((f) => f.fieldLabel) || [],
            fieldTypes: article.fieldDefinitions?.map((f) => f.fieldType) || [],
          },
        };
      })
    );

    // Filter out vectors with empty embeddings
    const validVectors = vectors.filter((v) => v.values.length > 0);
    if (validVectors.length > 0) {
      await index.upsert(validVectors);
    }

    console.log(
      `[Pinecone] Indexed batch ${i / batchSize + 1}/${Math.ceil(articles.length / batchSize)}`
    );
  }
}

/**
 * Find similar articles using semantic search
 */
export async function findSimilarArticles(
  query: string,
  organization?: string,
  topK: number = 5
): Promise<{ matches: SimilarArticleMatch[] }> {
  const index = getIndex();
  if (!index) {
    console.log("[Pinecone] Search skipped - not configured");
    return { matches: [] };
  }

  const queryText = organization ? `${query} by ${organization}` : query;
  const embedding = await generateEmbedding(queryText);

  if (embedding.length === 0) {
    return { matches: [] };
  }

  const results = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
  });

  return {
    matches: results.matches.map((m) => ({
      id: m.id,
      score: m.score || 0,
      metadata: m.metadata as unknown as ArticleVectorMetadata,
    })),
  };
}

/**
 * Generate AI field suggestions based on similar articles
 */
export async function getFieldSuggestions(
  articleName: string,
  materialType: string,
  existingFieldKeys: string[]
): Promise<{ suggestedFields: FieldSuggestion[] }> {
  // Find similar articles - this will return empty if not configured
  const searchQuery = `${articleName} ${materialType}`;
  const similar = await findSimilarArticles(searchQuery, undefined, 10);

  if (similar.matches.length === 0) {
    return { suggestedFields: [] };
  }

  // Aggregate common fields from similar articles
  const fieldFrequency: Record<
    string,
    { count: number; type: string; key: string; totalScore: number }
  > = {};

  for (const match of similar.matches) {
    if (!match.metadata) continue;

    const { fieldLabels, fieldTypes, fieldKeys } = match.metadata;

    fieldLabels.forEach((label, idx) => {
      const key = fieldKeys[idx];
      // Skip fields already in the article
      if (existingFieldKeys.includes(key)) return;

      if (!fieldFrequency[label]) {
        fieldFrequency[label] = { count: 0, type: fieldTypes[idx], key, totalScore: 0 };
      }
      fieldFrequency[label].count++;
      fieldFrequency[label].totalScore += match.score;
    });
  }

  // Sort by frequency and score, return top 3
  const suggestions = Object.entries(fieldFrequency)
    .map(([label, data]) => ({
      fieldKey: data.key,
      fieldLabel: label,
      fieldType: data.type,
      count: data.count,
      avgScore: data.totalScore / data.count,
    }))
    .sort((a, b) => {
      // First by count, then by score
      if (b.count !== a.count) return b.count - a.count;
      return b.avgScore - a.avgScore;
    })
    .slice(0, 3)
    .map((item) => ({
      fieldKey: item.fieldKey,
      fieldLabel: item.fieldLabel,
      fieldType: item.fieldType,
      reason: `Found in ${item.count} similar articles`,
      confidence: Math.min(item.count / similar.matches.length, 0.95),
    }));

  return { suggestedFields: suggestions };
}

/**
 * Get validation hints based on material type and similar articles
 */
export async function getValidationHints(
  materialType: string,
  fieldKey: string
): Promise<{
  hint: string | null;
  suggestedValidation: { min?: number; max?: number; required?: boolean } | null;
}> {
  // Material-specific validation hints (works even without Pinecone configured)
  const materialHints: Record<
    string,
    Record<string, { hint: string; validation: { min?: number; max?: number; required?: boolean } }>
  > = {
    plastic: {
      shrinkage_rate: {
        hint: 'Based on "plastic", I recommend adding a Shrinkage Rate field validation check.',
        validation: { min: 0.1, max: 3.0, required: true },
      },
      melt_temperature: {
        hint: "Plastic materials typically require melt temperature between 150-400°C",
        validation: { min: 150, max: 400, required: true },
      },
      injection_pressure: {
        hint: "Injection pressure for plastics usually ranges from 35-140 MPa",
        validation: { min: 35, max: 140, required: true },
      },
    },
    metal: {
      tensile_strength: {
        hint: "Metal components require tensile strength validation",
        validation: { min: 200, max: 2500, required: true },
      },
      hardness: {
        hint: "Hardness values (HRC) for metals typically range from 20-70",
        validation: { min: 20, max: 70, required: true },
      },
    },
    pharmaceutical: {
      purity: {
        hint: "Pharmaceutical grade materials require high purity validation",
        validation: { min: 99.0, max: 100, required: true },
      },
      shelf_life: {
        hint: "Shelf life in months should be validated for pharmaceutical products",
        validation: { min: 6, max: 60, required: true },
      },
    },
  };

  const materialLower = materialType.toLowerCase();
  let matchedMaterial: string | null = null;

  // Find matching material category
  for (const material of Object.keys(materialHints)) {
    if (materialLower.includes(material)) {
      matchedMaterial = material;
      break;
    }
  }

  if (matchedMaterial && materialHints[matchedMaterial][fieldKey]) {
    const { hint, validation } = materialHints[matchedMaterial][fieldKey];
    return { hint, suggestedValidation: validation };
  }

  return { hint: null, suggestedValidation: null };
}

/**
 * Delete an article from Pinecone index
 */
export async function deleteArticleFromPinecone(articleId: number): Promise<void> {
  const index = getIndex();
  if (!index) {
    console.log("[Pinecone] Delete skipped - not configured");
    return;
  }

  await index.deleteOne(articleId.toString());
}

/**
 * Check if Pinecone is properly configured
 */
export function isPineconeConfigured(): boolean {
  return !!(process.env.PINECONE_API_KEY && process.env.OPENAI_API_KEY);
}

/**
 * Validate a shop floor value using AI or get advice
 */
export async function validateValueWithAI(
  articleName: string,
  organization: string,
  fieldLabel: string,
  fieldType: string,
  value?: string | number
): Promise<{ isValid: boolean; warning?: string; suggestion?: string }> {
  const openai = getOpenAI();
  if (!openai) return { isValid: true };

  try {
    const isAdviceRequest = value === undefined || value === "";

    const prompt = isAdviceRequest
      ? `
      Context: Manufacturing shop floor data entry.
      Article: "${articleName}" by "${organization}".
      Field: "${fieldLabel}" (Type: ${fieldType}).

      Task: Provide a short, helpful hint about what is expected for this field.
      - What is the typical range or format?
      - Any specific units or conventions?
      - Keep it very brief (max 15 words).

      Response format (JSON):
      {
        "isValid": true,
        "suggestion": "string (max 15 words)"
      }
      `
      : `
      Context: Manufacturing shop floor data entry.
      Article: "${articleName}" by "${organization}".
      Field: "${fieldLabel}" (Type: ${fieldType}).
      User Input: "${value}".

      Task: Validate if the input is appropriate for this field.
      - If it's a number, is it within a realistic range for this context?
      - If it's text, is it semantically relevant? (e.g. if field is "Expiry Date" and input is "Hello", it's invalid).
      - If it seems correct, return isValid: true.
      - If it seems wrong or unusual, return isValid: false and a short warning message.

      Response format (JSON):
      {
        "isValid": boolean,
        "warning": "string (optional, max 15 words)",
        "suggestion": "string (optional, max 10 words)"
      }
      `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) return { isValid: true };

    return JSON.parse(content);
  } catch (error) {
    console.error("[AI Validation] Error:", error);
    return { isValid: true };
  }
}

/**
 * Analyze article schema for improvements
 */
export async function analyzeSchemaWithAI(
  articleName: string,
  organization: string,
  fields: { fieldKey: string; fieldLabel: string; fieldType: string }[]
): Promise<{
  duplicates: { fieldKey: string; message: string }[];
  missing: { fieldLabel: string; fieldType: string; reason: string }[];
  nameFeedback?: string;
}> {
  const openai = getOpenAI();
  if (!openai) return { duplicates: [], missing: [] };

  try {
    const prompt = `
    Context: Manufacturing article schema definition.
    Article: "${articleName}" by "${organization}".
    Current Fields: ${JSON.stringify(fields.map((f) => ({ label: f.fieldLabel, type: f.fieldType })))}.

    Task: Analyze the schema.
    1. Identify semantically duplicate fields (e.g. "Weight" and "Mass").
    2. Identify missing critical fields for this type of item.
    3. Check if the article name is descriptive enough.

    Response format (JSON):
    {
      "duplicates": [{ "fieldLabel": "string", "message": "string" }],
      "missing": [{ "fieldLabel": "string", "fieldType": "string", "reason": "string" }],
      "nameFeedback": "string (optional, only if name is poor)"
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) return { duplicates: [], missing: [] };

    const result = JSON.parse(content);

    // Map back to field keys
    const duplicates = (result.duplicates || []).map(
      (d: { fieldLabel: string; message: string }) => {
        const field = fields.find((f) => f.fieldLabel === d.fieldLabel);
        return {
          fieldKey: field?.fieldKey || d.fieldLabel,
          message: d.message,
        };
      }
    );

    return {
      duplicates,
      missing: result.missing || [],
      nameFeedback: result.nameFeedback,
    };
  } catch (error) {
    console.error("[AI Schema Analysis] Error:", error);
    return { duplicates: [], missing: [] };
  }
}
