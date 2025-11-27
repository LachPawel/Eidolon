import { describe, it, expect } from "vitest";
import { validateFields } from "../../utils/validation.js";
import { FieldDefinition } from "../../types/index.js";

describe("Validation Utils", () => {
  describe("validateFields", () => {
    it("should pass validation for valid data", () => {
      const schema: FieldDefinition[] = [
        {
          fieldKey: "weight",
          fieldLabel: "Weight",
          fieldType: "number",
          scope: "shop_floor",
          validation: { required: true, min: 10, max: 100 },
        },
      ];

      const data = { weight: 50 };
      const errors = validateFields(schema, data);

      expect(errors).to.be.an("array").that.is.empty;
    });

    it("should fail when required field is missing", () => {
      const schema: FieldDefinition[] = [
        {
          fieldKey: "weight",
          fieldLabel: "Weight",
          fieldType: "number",
          scope: "shop_floor",
          validation: { required: true, min: 10, max: 100 },
        },
      ];

      const data = {};
      const errors = validateFields(schema, data);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.equal("Field 'Weight' is required.");
    });

    it("should fail when number is below min", () => {
      const schema: FieldDefinition[] = [
        {
          fieldKey: "weight",
          fieldLabel: "Weight",
          fieldType: "number",
          scope: "shop_floor",
          validation: { min: 10, max: 100 },
        },
      ];

      const data = { weight: 5 };
      const errors = validateFields(schema, data);

      expect(errors).to.include("Field 'Weight' must be at least 10.");
    });

    it("should fail when number is above max", () => {
      const schema: FieldDefinition[] = [
        {
          fieldKey: "weight",
          fieldLabel: "Weight",
          fieldType: "number",
          scope: "shop_floor",
          validation: { min: 10, max: 100 },
        },
      ];

      const data = { weight: 150 };
      const errors = validateFields(schema, data);

      expect(errors).to.include("Field 'Weight' must be at most 100.");
    });

    it("should fail when select value is not in options", () => {
      const schema: FieldDefinition[] = [
        {
          fieldKey: "quality",
          fieldLabel: "Quality",
          fieldType: "select",
          scope: "shop_floor",
          validation: { options: ["Pass", "Fail"] },
        },
      ];

      const data = { quality: "Maybe" };
      const errors = validateFields(schema, data);

      expect(errors).to.include("Field 'Quality' has an invalid selection.");
    });

    it("should handle empty schema", () => {
      const schema: FieldDefinition[] = [];
      const data = { anything: "value" };
      const errors = validateFields(schema, data);

      expect(errors).to.be.empty;
    });

    it("should ignore extra fields not in schema", () => {
      const schema: FieldDefinition[] = [
        {
          fieldKey: "weight",
          fieldLabel: "Weight",
          fieldType: "number",
          scope: "shop_floor",
          validation: { min: 10, max: 100 },
        },
      ];

      const data = { weight: 50, extraField: "should be ignored" };
      const errors = validateFields(schema, data);

      expect(errors).to.be.empty;
    });
  });
});
