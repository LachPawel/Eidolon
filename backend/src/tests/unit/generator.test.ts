import { describe, it, expect } from "vitest";
import { generateArticle, generateArticles } from "../../seeds/generator.js";
import { industryTemplates } from "../../seeds/industryTemplates.js";

describe("Article Generator", () => {
  describe("generateArticle", () => {
    it("should generate article for medicine-pharma industry", () => {
      const article = generateArticle("medicine-pharma");

      expect(article).to.have.property("name");
      expect(article).to.have.property("organization");
      expect(article).to.have.property("status");
      expect(article).to.have.property("shopFloorFields");
      expect(article).to.have.property("attributeFields");

      expect(article.name).to.be.a("string");
      expect(article.organization).to.be.a("string");
      expect(["draft", "active", "archived"]).to.include(article.status);
      expect(article.shopFloorFields).to.be.an("array");
      expect(article.attributeFields).to.be.an("array");
    });

    it("should generate article for metal-automotive industry", () => {
      const article = generateArticle("metal-automotive");

      expect(article.organization).to.be.a("string");
      const template = industryTemplates["metal-automotive"];
      expect(template.organizations).to.include(article.organization);
    });

    it("should generate article for plastic-textile industry", () => {
      const article = generateArticle("plastic-textile");

      expect(article.organization).to.be.a("string");
      const template = industryTemplates["plastic-textile"];
      expect(template.organizations).to.include(article.organization);
    });

    it("should generate article for chemistry-process industry", () => {
      const article = generateArticle("chemistry-process");

      expect(article.organization).to.be.a("string");
      const template = industryTemplates["chemistry-process"];
      expect(template.organizations).to.include(article.organization);
    });

    it("should generate shop floor fields with correct structure", () => {
      const article = generateArticle("medicine-pharma");

      expect(article.shopFloorFields.length).to.be.at.least(2);
      expect(article.shopFloorFields.length).to.be.at.most(10);

      article.shopFloorFields.forEach((field) => {
        expect(field).to.have.property("fieldKey");
        expect(field).to.have.property("fieldLabel");
        expect(field).to.have.property("fieldType");
        expect(field).to.have.property("scope");
        expect(field.scope).to.equal("shop_floor");
        expect(["text", "number", "boolean", "select"]).to.include(field.fieldType);
      });
    });

    it("should generate validation rules when present", () => {
      const article = generateArticle("metal-automotive");

      const fieldsWithValidation = article.shopFloorFields.filter((f) => f.validation);
      expect(fieldsWithValidation.length).to.be.greaterThan(0);

      fieldsWithValidation.forEach((field) => {
        if (field.validation?.required !== undefined) {
          expect(field.validation.required).to.be.a("boolean");
        }
        if (field.validation?.min !== undefined) {
          expect(field.validation.min).to.be.a("number");
        }
        if (field.validation?.max !== undefined) {
          expect(field.validation.max).to.be.a("number");
        }
        if (field.validation?.options !== undefined) {
          expect(field.validation.options).to.be.an("array");
        }
      });
    });

    it("should throw error for invalid industry", () => {
      expect(() => generateArticle("invalid-industry")).to.throw("Industry template not found");
    });
  });

  describe("generateArticles", () => {
    it("should generate specified number of articles", () => {
      const count = 100;
      const articles = generateArticles(count);

      expect(articles).to.be.an("array");
      expect(articles).to.have.lengthOf(count);
    });

    it("should distribute articles evenly across industries", () => {
      const count = 100;
      const articles = generateArticles(count);

      const byIndustry: Record<string, number> = {};

      articles.forEach((article) => {
        for (const [key, template] of Object.entries(industryTemplates)) {
          if (template.organizations.includes(article.organization)) {
            byIndustry[key] = (byIndustry[key] || 0) + 1;
            break;
          }
        }
      });

      const industries = Object.keys(industryTemplates);
      const expectedPerIndustry = Math.floor(count / industries.length);

      // Each industry should have approximately equal distribution
      Object.values(byIndustry).forEach((count) => {
        expect(count).to.be.at.least(expectedPerIndustry - 5);
        expect(count).to.be.at.most(expectedPerIndustry + 5);
      });
    });

    it("should generate articles with active status predominantly", () => {
      const count = 100;
      const articles = generateArticles(count);

      const statusCounts = articles.reduce(
        (acc, article) => {
          acc[article.status]++;
          return acc;
        },
        { draft: 0, active: 0, archived: 0 }
      );

      // Active should be the majority (weighted 8 out of 10)
      expect(statusCounts.active).to.be.greaterThan(statusCounts.draft);
      expect(statusCounts.active).to.be.greaterThan(statusCounts.archived);
    });

    it("should generate unique article names", () => {
      const count = 50;
      const articles = generateArticles(count);

      const names = articles.map((a) => a.name);
      const uniqueNames = new Set(names);

      // Most names should be unique (allowing for rare collisions)
      expect(uniqueNames.size).to.be.at.least(count * 0.9);
    });
  });

  describe("Industry Templates", () => {
    it("should have all required industries", () => {
      expect(industryTemplates).to.have.property("medicine-pharma");
      expect(industryTemplates).to.have.property("metal-automotive");
      expect(industryTemplates).to.have.property("plastic-textile");
      expect(industryTemplates).to.have.property("chemistry-process");
    });

    it("should have 10 organizations per industry", () => {
      Object.values(industryTemplates).forEach((template) => {
        expect(template.organizations).to.have.lengthOf(10);
      });
    });

    it("should have diverse field templates per industry", () => {
      Object.values(industryTemplates).forEach((template) => {
        expect(template.fieldTemplates.length).to.be.at.least(6);

        const fieldTypes = template.fieldTemplates.map((f) => f.fieldType);
        const uniqueTypes = new Set(fieldTypes);
        expect(uniqueTypes.size).to.be.at.least(3); // At least 3 different field types
      });
    });

    it("should have unique field keys within each industry", () => {
      Object.values(industryTemplates).forEach((template) => {
        const keys = template.fieldTemplates.map((f) => f.fieldKey);
        const uniqueKeys = new Set(keys);
        expect(uniqueKeys.size).to.equal(keys.length);
      });
    });
  });
});
