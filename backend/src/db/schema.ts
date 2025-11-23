import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { FieldDefinition } from '../types/index.js';

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  organization: text('organization').notNull(),
  name: text('name').notNull(),
  status: text('status').notNull().default('draft'), // 'draft' | 'active' | 'archived'
  attributeSchema: jsonb('attribute_schema').$type<FieldDefinition[]>().notNull().default([]),
  attributes: jsonb('attributes').$type<Record<string, any>>().notNull().default({}),
  shopFloorSchema: jsonb('shop_floor_schema').$type<FieldDefinition[]>().notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const entries = pgTable('entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id),
  organization: text('organization').notNull(),
  data: jsonb('data').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});