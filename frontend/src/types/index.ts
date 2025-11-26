import type { AppRouter } from "../../../backend/src/routers";
import type { inferRouterOutputs } from "@trpc/server";

// Infer all output types from the backend router
type RouterOutput = inferRouterOutputs<AppRouter>;

// Export specific types we need
export type Article = RouterOutput["articles"]["list"]["items"][number];
export type ArticlesList = RouterOutput["articles"]["list"];
export type CreatedArticle = RouterOutput["articles"]["create"];

export type Entry = RouterOutput["entries"]["list"][number];
export type EntriesList = RouterOutput["entries"]["list"];
export type CreatedEntry = RouterOutput["entries"]["create"];

// Extract nested types for convenience
export type Field = NonNullable<Article["shopFloorFields"]>[number];
export type FieldType = Field["fieldType"];
export type ArticleStatus = Article["status"];

export type FieldInput = {
  id?: number;
  fieldKey: string;
  fieldLabel: string;
  fieldType: "text" | "number" | "boolean" | "select";
  scope: "attribute" | "shop_floor";
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    options?: string[];
  };
};
