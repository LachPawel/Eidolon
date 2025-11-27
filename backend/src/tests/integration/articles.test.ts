import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "../app.js";
import { cleanDatabase } from "../setup.js";

const app = createTestApp();

describe("Articles API", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("POST /api/articles", () => {
    it("should create a new article", async () => {
      const articleData = {
        organization: "Test Corp",
        name: "Test Article",
        status: "active",
        shopFloorFields: [
          {
            fieldKey: "weight",
            fieldLabel: "Weight",
            fieldType: "number",
            scope: "shop_floor",
            validation: { required: true, min: 0, max: 100 },
          },
        ],
      };

      const res = await request(app).post("/api/articles").send(articleData).expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("Test Article");
      expect(res.body.organization).toBe("Test Corp");
    });

    it("should return 400 if name is missing", async () => {
      const res = await request(app)
        .post("/api/articles")
        .send({ organization: "Test Corp" })
        .expect(400);

      expect(res.body.error).toBe("Organization and Name are required");
    });
  });

  describe("GET /api/articles", () => {
    it("should return empty array when no articles exist", async () => {
      const res = await request(app).get("/api/articles").expect(200);

      expect(Array.isArray(res.body.articles)).toBe(true);
      expect(res.body.articles).toHaveLength(0);
    });

    it("should filter articles by organization", async () => {
      // Create two articles
      await request(app).post("/api/articles").send({ organization: "Corp A", name: "Article A" });

      await request(app).post("/api/articles").send({ organization: "Corp B", name: "Article B" });

      const res = await request(app).get("/api/articles?organization=Corp A").expect(200);

      expect(res.body.articles).toHaveLength(1);
      expect(res.body.articles[0].organization).toBe("Corp A");
    });

    it("should search articles by name", async () => {
      await request(app).post("/api/articles").send({ organization: "Test", name: "Steel Pipe" });

      await request(app).post("/api/articles").send({ organization: "Test", name: "Copper Wire" });

      const res = await request(app).get("/api/articles?search=Pipe").expect(200);

      expect(res.body.articles).toHaveLength(1);
      expect(res.body.articles[0].name).toContain("Pipe");
    });
  });
});
