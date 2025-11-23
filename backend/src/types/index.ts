export type FieldType = 'text' | 'number' | 'boolean' | 'select';

export type FieldValue = string | number | boolean | null;

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  validation?: FieldValidation;
}

export interface Article {
  id: string;
  organization: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  attributeSchema: FieldDefinition[];
  attributes: Record<string, FieldValue>; 
  shopFloorSchema: FieldDefinition[];
  createdAt: string;
}

export interface Entry {
  id: string;
  articleId: string;
  organization: string;
  data: Record<string, FieldValue>; 
  timestamp: string;
}

export interface DataSchema {
  articles: Article[];
  entries: Entry[];
}