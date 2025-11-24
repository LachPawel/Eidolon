import { FieldDefinition } from "../types/index.js";

export const validateFields = (
  schema: FieldDefinition[], 
  data: Record<string, string | number | boolean>
): string[] => {
  const errors: string[] = [];

  for (const field of schema) {
    const value = data[field.fieldKey];

    if (field.validation?.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${field.fieldLabel}' is required.`);
      continue;
    }

    if (value === undefined || value === null || value === '') continue;

    if (field.fieldType === 'number') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      
      if (typeof numValue !== 'number' || isNaN(numValue)) {
        errors.push(`Field '${field.fieldLabel}' must be a number.`);
      } else {
        if (field.validation?.min !== undefined && numValue < field.validation.min) {
          errors.push(`Field '${field.fieldLabel}' must be at least ${field.validation.min}.`);
        }
        if (field.validation?.max !== undefined && numValue > field.validation.max) {
          errors.push(`Field '${field.fieldLabel}' must be at most ${field.validation.max}.`);
        }
      }
    }
    
    if (field.fieldType === 'select' && field.validation?.options) {
      if (typeof value !== 'string' || !field.validation.options.includes(value)) {
        errors.push(`Field '${field.fieldLabel}' has an invalid selection.`);
      }
    }
  }

  return errors;
};