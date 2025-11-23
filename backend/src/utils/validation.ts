import { FieldDefinition, FieldValue } from "../types/index.js";

export const validateFields = (schema: FieldDefinition[], data: Record<string, FieldValue>): string[] => {
  const errors: string[] = [];

  for (const field of schema) {
    const value = data[field.key];

    if (field.validation?.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${field.label}' is required.`);
      continue;
    }

    if (value === undefined || value === null || value === '') continue;

    if (field.type === 'number') {
      if (typeof value !== 'number') {
        errors.push(`Field '${field.label}' must be a number.`);
      } else {
        if (field.validation?.min !== undefined && value < field.validation.min) {
          errors.push(`Field '${field.label}' must be at least ${field.validation.min}.`);
        }
        if (field.validation?.max !== undefined && value > field.validation.max) {
          errors.push(`Field '${field.label}' must be at most ${field.validation.max}.`);
        }
      }
    }
    
    if (field.type === 'select' && field.validation?.options) {
      if (typeof value !== 'string' || !field.validation.options.includes(value)) {
        errors.push(`Field '${field.label}' has an invalid selection.`);
      }
    }
  }

  return errors;
};