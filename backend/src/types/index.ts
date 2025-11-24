export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
}

export interface FieldDefinition {
  id?: number;
  fieldKey: string;
  fieldLabel: string;
  fieldType: "text" | "number" | "boolean" | "select";
  scope: "attribute" | "shop_floor";
  validation?: FieldValidation;
}

export interface Article {
  id?: number;
  name: string;
  organization: string;
  status: "draft" | "active" | "archived";
  attributeFields?: FieldDefinition[];
  shopFloorFields?: FieldDefinition[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EntryValue {
  fieldDefinitionId: number;
  valueText?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
}

export interface Entry {
  id?: number;
  articleId: number;
  values: EntryValue[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EntryValueData {
  entryId: number;
  fieldDefinitionId: number;
  valueText?: string;
  valueNumber?: string;
  valueBoolean?: boolean;
}

export type EntryValueUnion = string | number | boolean;
