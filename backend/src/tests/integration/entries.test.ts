import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "../app.js";
import { cleanDatabase } from "../setup.js";

const app = createTestApp();

describe("Entries API", () => {
  let articleId: string;

  beforeEach(async () => {
    await cleanDatabase();

    // Create a test article
    const res = await request(app)
      .post("/api/articles")
      .send({
        organization: "Test Corp",
        name: "Test Article",
        status: "active",
        shopFloorFields: [
          {
            fieldKey: "weight",
            fieldLabel: "Weight (kg)",
            fieldType: "number",
            scope: "shop_floor",
            validation: { required: true, min: 10, max: 100 },
          },
          {
            fieldKey: "quality",
            fieldLabel: "Quality Check",
            fieldType: "select",
            scope: "shop_floor",
            validation: { required: true, options: ["Pass", "Fail"] },
          },
        ],
      });

    articleId = res.body.id;
  });

  describe("POST /api/entries", () => {
    it("should create a valid entry", async () => {
      const entryData = {
        values: {
          weight: 50,
          quality: "Pass",
        },
      };

      const res = await request(app).post(`/api/entries/${articleId}`).send(entryData).expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.articleId).toBe(Number(articleId));
    });

    it("should reject entry with missing required field", async () => {
      const res = await request(app)
        .post(`/api/entries/${articleId}`)
        .send({
          values: { quality: "Pass" }, // Missing 'weight'
        })
        .expect(400);

      expect(res.body.error).toBe("Validation Failed");
      expect(Array.isArray(res.body.details)).toBe(true);
    });

    it("should reject entry with out-of-range number", async () => {
      const res = await request(app)
        .post(`/api/entries/${articleId}`)
        .send({
          values: { weight: 150, quality: "Pass" }, // Weight > 100
        })
        .expect(400);

      expect(res.body.details).toContain("Field 'Weight (kg)' must be at most 100.");
    });

    it("should reject entry with invalid select option", async () => {
      const res = await request(app)
        .post(`/api/entries/${articleId}`)
        .send({
          values: { weight: 50, quality: "Maybe" }, // Invalid option
        })
        .expect(400);

      expect(res.body.details).toContain("Field 'Quality Check' has an invalid selection.");
    });

    it("should return 404 for non-existent article", async () => {
      const res = await request(app)
        .post("/api/entries/999999")
        .send({
          values: {},
        })
        .expect(404);

      expect(res.body.error).toBe("Article not found");
    });
  });
});
