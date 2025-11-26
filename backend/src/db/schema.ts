import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    organization: text("organization").notNull(),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("articles_name_idx").on(table.name),
    index("articles_organization_idx").on(table.organization),
    index("articles_status_idx").on(table.status),
    index("articles_created_at_idx").on(table.createdAt),
  ]
);

export const fieldDefinitions = pgTable(
  "field_definitions",
  {
    id: serial("id").primaryKey(),
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    fieldKey: text("field_key").notNull(),
    fieldLabel: text("field_label").notNull(),
    fieldType: text("field_type").notNull(), // 'text' | 'number' | 'boolean' | 'select'
    scope: text("scope").notNull(), // 'attribute' | 'shop_floor'
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("field_definitions_article_id_idx").on(table.articleId)]
);

export const fieldValidations = pgTable("field_validations", {
  id: serial("id").primaryKey(),
  fieldDefinitionId: integer("field_definition_id")
    .notNull()
    .references(() => fieldDefinitions.id, { onDelete: "cascade" }),
  required: boolean("required").default(false),
  min: decimal("min"),
  max: decimal("max"),
  options: text("options").array(),
});

export const entries = pgTable(
  "entries",
  {
    id: serial("id").primaryKey(),
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("entries_article_id_idx").on(table.articleId)]
);

export const entryValues = pgTable(
  "entry_values",
  {
    id: serial("id").primaryKey(),
    entryId: integer("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    fieldDefinitionId: integer("field_definition_id")
      .notNull()
      .references(() => fieldDefinitions.id, { onDelete: "cascade" }),
    valueText: text("value_text"),
    valueNumber: decimal("value_number"),
    valueBoolean: boolean("value_boolean"),
  },
  (table) => [
    index("entry_values_entry_id_idx").on(table.entryId),
    index("entry_values_field_definition_id_idx").on(table.fieldDefinitionId),
  ]
);

// Relations
export const articlesRelations = relations(articles, ({ many }) => ({
  fieldDefinitions: many(fieldDefinitions),
  entries: many(entries),
}));

export const fieldDefinitionsRelations = relations(fieldDefinitions, ({ one, many }) => ({
  article: one(articles, {
    fields: [fieldDefinitions.articleId],
    references: [articles.id],
  }),
  validation: one(fieldValidations, {
    fields: [fieldDefinitions.id],
    references: [fieldValidations.fieldDefinitionId],
  }),
  entryValues: many(entryValues),
}));

export const fieldValidationsRelations = relations(fieldValidations, ({ one }) => ({
  fieldDefinition: one(fieldDefinitions, {
    fields: [fieldValidations.fieldDefinitionId],
    references: [fieldDefinitions.id],
  }),
}));

export const entriesRelations = relations(entries, ({ one, many }) => ({
  article: one(articles, {
    fields: [entries.articleId],
    references: [articles.id],
  }),
  values: many(entryValues),
}));

export const entryValuesRelations = relations(entryValues, ({ one }) => ({
  entry: one(entries, {
    fields: [entryValues.entryId],
    references: [entries.id],
  }),
  fieldDefinition: one(fieldDefinitions, {
    fields: [entryValues.fieldDefinitionId],
    references: [fieldDefinitions.id],
  }),
}));
