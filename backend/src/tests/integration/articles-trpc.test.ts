/**
 * TRPC Router Integration Tests
 *
 * These tests verify TRPC endpoints by testing through the HTTP layer,
 * ensuring:
 * - Input validation (zod schemas)
 * - Query/mutation logic
 * - Database operations
 * - Error handling
 * - Pagination (cursor-based)
 */

import { expect } from "chai";
import request from "supertest";
import { createTestApp } from "../app.js";
import { cleanDatabase } from "../setup.js";

const app = createTestApp();

describe("TRPC Articles Router", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("articles.list (GET /trpc/articles.list)", () => {
    it("should return empty array when no articles exist", async () => {
      const res = await request(app).get("/trpc/articles.list").expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result.items).to.be.an("array");
      expect(result.items.length).to.equal(0);
    });

    it("should return articles with pagination", async () => {
      // Create 5 articles
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post("/api/articles")
          .send({
            name: `Article ${i}`,
            organization: "Test Corp",
            status: "active",
          });
      }

      const res = await request(app)
        .get("/trpc/articles.list?input=" + encodeURIComponent(JSON.stringify({ limit: 3 })))
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result.items).to.have.lengthOf(3);
      expect(result.nextCursor).to.exist;
    });

    it("should filter by organization via TRPC", async () => {
      await request(app)
        .post("/api/articles")
        .send({ name: "Corp A Article", organization: "Corp A", status: "active" });

      await request(app)
        .post("/api/articles")
        .send({ name: "Corp B Article", organization: "Corp B", status: "active" });

      const res = await request(app)
        .get(
          "/trpc/articles.list?input=" +
            encodeURIComponent(JSON.stringify({ organization: "Corp A" }))
        )
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result.items).to.have.lengthOf(1);
      expect(result.items[0].organization).to.equal("Corp A");
    });

    it("should filter by status via TRPC", async () => {
      await request(app)
        .post("/api/articles")
        .send({ name: "Active", organization: "Test", status: "active" });

      await request(app)
        .post("/api/articles")
        .send({ name: "Draft", organization: "Test", status: "draft" });

      const res = await request(app)
        .get("/trpc/articles.list?input=" + encodeURIComponent(JSON.stringify({ status: "draft" })))
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result.items).to.have.lengthOf(1);
      expect(result.items[0].status).to.equal("draft");
    });

    it("should search articles via TRPC", async () => {
      await request(app)
        .post("/api/articles")
        .send({ name: "Steel Pipe", organization: "Test", status: "active" });

      await request(app)
        .post("/api/articles")
        .send({ name: "Copper Wire", organization: "Test", status: "active" });

      const res = await request(app)
        .get("/trpc/articles.list?input=" + encodeURIComponent(JSON.stringify({ search: "Steel" })))
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result.items).to.have.lengthOf(1);
      expect(result.items[0].name).to.include("Steel");
    });
  });

  describe("articles.create (POST /trpc/articles.create)", () => {
    it("should create article via TRPC", async () => {
      const res = await request(app)
        .post("/trpc/articles.create")
        .send({
          name: "TRPC Article",
          organization: "TRPC Corp",
          status: "active",
        })
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result.id).to.exist;
      expect(result.name).to.equal("TRPC Article");
      expect(result.organization).to.equal("TRPC Corp");
    });

    it("should create article with attribute fields via TRPC", async () => {
      const res = await request(app)
        .post("/trpc/articles.create")
        .send({
          name: "Test Article",
          organization: "Test Corp",
          status: "active",
          attributeFields: [
            {
              fieldKey: "material",
              fieldLabel: "Material Type",
              fieldType: "text",
              scope: "attribute",
              validation: { required: true },
            },
          ],
        })
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result.id).to.exist;
    });

    it("should validate required fields via TRPC", async () => {
      const res = await request(app)
        .post("/trpc/articles.create")
        .send({
          name: "",
          organization: "Test",
          status: "active",
        })
        .expect(400);

      expect(res.body.error).to.exist;
    });
  });

  describe("articles.update (POST /trpc/articles.update)", () => {
    it("should update article via TRPC", async () => {
      // Create article first
      const createRes = await request(app).post("/api/articles").send({
        name: "Original",
        organization: "Test",
        status: "draft",
      });

      const articleId = createRes.body.id;

      // Update via TRPC
      const res = await request(app)
        .post("/trpc/articles.update")
        .send({
          id: articleId,
          name: "Updated Name",
          status: "active",
        })
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result.success).to.equal(true);
    });
  });

  describe("articles.delete (POST /trpc/articles.delete)", () => {
    it("should delete article via TRPC", async () => {
      // Create article first
      const createRes = await request(app).post("/api/articles").send({
        name: "To Delete",
        organization: "Test",
        status: "active",
      });

      const articleId = createRes.body.id;

      // Delete via TRPC
      const res = await request(app)
        .post("/trpc/articles.delete")
        .send({ id: articleId })
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result.success).to.equal(true);

      // Verify deletion
      const getRes = await request(app).get("/api/articles").expect(200);
      expect(getRes.body.articles).to.have.lengthOf(0);
    });
  });

  describe("articles.getById (GET /trpc/articles.getById)", () => {
    it("should get article by ID via TRPC", async () => {
      // Create article first
      const createRes = await request(app).post("/api/articles").send({
        name: "Test Article",
        organization: "Test Corp",
        status: "active",
      });

      const articleId = createRes.body.id;

      // Get via TRPC
      const res = await request(app)
        .get(
          "/trpc/articles.getById?input=" + encodeURIComponent(JSON.stringify({ id: articleId }))
        )
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result.id).to.equal(articleId);
      expect(result.name).to.equal("Test Article");
    });

    it("should return null for non-existent article via TRPC", async () => {
      const res = await request(app)
        .get("/trpc/articles.getById?input=" + encodeURIComponent(JSON.stringify({ id: 99999 })))
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result).to.equal(null);
    });
  });
});
