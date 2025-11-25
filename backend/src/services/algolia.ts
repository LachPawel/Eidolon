import { algoliasearch, type SearchClient } from "algoliasearch";

// Lazy-initialized Algolia client
let client: SearchClient | null = null;

function getClient(): SearchClient | null {
  if (!client && process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_ADMIN_KEY) {
    client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
  }
  return client;
}

const INDEX_NAME = "eidolon_articles";

export interface AlgoliaArticle {
  objectID: string;
  name: string;
  organization: string;
  status: string;
  industry: string;
  fieldLabels: string[];
  fieldTypes: string[];
  createdAt: number;
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
 * Syncs an article to Algolia index
 */
export async function syncArticleToAlgolia(article: {
  id: number;
  name: string;
  organization: string;
  status: string;
  fieldDefinitions?: { fieldLabel: string; fieldType: string }[];
}): Promise<void> {
  const algoliaClient = getClient();
  if (!algoliaClient) {
    console.log("[Algolia] Skipping sync - not configured");
    return;
  }

  await algoliaClient.saveObject({
    indexName: INDEX_NAME,
    body: {
      objectID: article.id.toString(),
      name: article.name,
      organization: article.organization,
      status: article.status,
      industry: detectIndustry(article.name, article.organization),
      fieldLabels: article.fieldDefinitions?.map((f) => f.fieldLabel) || [],
      fieldTypes: article.fieldDefinitions?.map((f) => f.fieldType) || [],
      createdAt: Date.now(),
    },
  });
}

/**
 * Bulk sync multiple articles to Algolia
 */
export async function bulkSyncArticlesToAlgolia(
  articles: Array<{
    id: number;
    name: string;
    organization: string;
    status: string;
    fieldDefinitions?: { fieldLabel: string; fieldType: string }[];
  }>
): Promise<void> {
  const algoliaClient = getClient();
  if (!algoliaClient) {
    console.log("[Algolia] Skipping bulk sync - not configured");
    return;
  }

  const objects = articles.map((article) => ({
    objectID: article.id.toString(),
    name: article.name,
    organization: article.organization,
    status: article.status,
    industry: detectIndustry(article.name, article.organization),
    fieldLabels: article.fieldDefinitions?.map((f) => f.fieldLabel) || [],
    fieldTypes: article.fieldDefinitions?.map((f) => f.fieldType) || [],
    createdAt: Date.now(),
  }));

  await algoliaClient.saveObjects({
    indexName: INDEX_NAME,
    objects,
  });
}

export interface AlgoliaSearchFilters {
  organization?: string;
  status?: string;
  industry?: string;
}

export interface AlgoliaSearchResult {
  hits: AlgoliaArticle[];
  nbHits: number;
  processingTimeMS: number;
  query: string;
}

/**
 * Search articles using Algolia
 */
export async function searchArticles(
  query: string,
  filters?: AlgoliaSearchFilters,
  options?: { hitsPerPage?: number; page?: number }
): Promise<AlgoliaSearchResult> {
  const algoliaClient = getClient();
  if (!algoliaClient) {
    console.log("[Algolia] Search skipped - not configured");
    return {
      hits: [],
      nbHits: 0,
      processingTimeMS: 0,
      query,
    };
  }

  const filterStrings: string[] = [];

  if (filters?.organization) {
    filterStrings.push(`organization:"${filters.organization}"`);
  }
  if (filters?.status) {
    filterStrings.push(`status:"${filters.status}"`);
  }
  if (filters?.industry) {
    filterStrings.push(`industry:"${filters.industry}"`);
  }

  const result = await algoliaClient.searchSingleIndex<AlgoliaArticle>({
    indexName: INDEX_NAME,
    searchParams: {
      query,
      filters: filterStrings.join(" AND "),
      hitsPerPage: options?.hitsPerPage ?? 20,
      page: options?.page ?? 0,
    },
  });

  return {
    hits: result.hits,
    nbHits: result.nbHits ?? 0,
    processingTimeMS: result.processingTimeMS ?? 0,
    query: result.query ?? query,
  };
}

/**
 * Delete an article from Algolia index
 */
export async function deleteArticleFromAlgolia(articleId: number): Promise<void> {
  const algoliaClient = getClient();
  if (!algoliaClient) {
    console.log("[Algolia] Delete skipped - not configured");
    return;
  }

  await algoliaClient.deleteObject({
    indexName: INDEX_NAME,
    objectID: articleId.toString(),
  });
}

/**
 * Configure Algolia index settings for optimal search
 */
export async function configureAlgoliaIndex(): Promise<void> {
  const algoliaClient = getClient();
  if (!algoliaClient) {
    console.log("[Algolia] Index configuration skipped - not configured");
    return;
  }

  await algoliaClient.setSettings({
    indexName: INDEX_NAME,
    indexSettings: {
      searchableAttributes: ["name", "organization", "fieldLabels"],
      attributesForFaceting: [
        "filterOnly(organization)",
        "filterOnly(status)",
        "filterOnly(industry)",
      ],
      ranking: ["typo", "words", "proximity", "attribute", "exact", "custom"],
      typoTolerance: true,
      minWordSizefor1Typo: 3,
      minWordSizefor2Typos: 6,
    },
  });

  console.log("[Algolia] Index configured successfully");
}

/**
 * Check if Algolia is properly configured
 */
export function isAlgoliaConfigured(): boolean {
  return !!(process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_ADMIN_KEY);
}
