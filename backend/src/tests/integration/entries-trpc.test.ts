/**
 * TRPC Router Integration Tests for Entries
 *
 * Tests for shop floor entry creation and management through TRPC
 */

import { expect } from "chai";
import request from "supertest";
import { createTestApp } from "../app.js";
import { cleanDatabase } from "../setup.js";

const app = createTestApp();

describe("TRPC Entries Router", () => {
  let testArticleId: number;

  beforeEach(async () => {
    await cleanDatabase();

    // Create a test article with shop floor fields
    const res = await request(app)
      .post("/api/articles")
      .send({
        name: "Test Product",
        organization: "Test Corp",
        status: "active",
        shopFloorFields: [
          {
            fieldKey: "weight",
            fieldLabel: "Weight (kg)",
            fieldType: "number",
            scope: "shop_floor",
            validation: { required: true, min: 0, max: 1000 },
          },
          {
            fieldKey: "color",
            fieldLabel: "Color",
            fieldType: "text",
            scope: "shop_floor",
            validation: { required: false },
          },
        ],
      });

    testArticleId = res.body.id;
  });

  describe("entries.list (GET /trpc/entries.list)", () => {
    it("should return empty array when no entries exist", async () => {
      const res = await request(app)
        .get(
          "/trpc/entries.list?input=" +
            encodeURIComponent(JSON.stringify({ articleId: testArticleId }))
        )
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result).to.be.an("array");
      expect(result.length).to.equal(0);
    });

    it("should return entries for an article via TRPC", async () => {
      // Create entries via TRPC
      await request(app)
        .post("/trpc/entries.create")
        .send({
          articleId: testArticleId,
          values: {
            weight: 50,
            color: "Blue",
          },
        });

      await request(app)
        .post("/trpc/entries.create")
        .send({
          articleId: testArticleId,
          values: {
            weight: 75,
            color: "Red",
          },
        });

      const res = await request(app)
        .get(
          "/trpc/entries.list?input=" +
            encodeURIComponent(JSON.stringify({ articleId: testArticleId }))
        )
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result).to.have.lengthOf(2);
      expect(result[0].values).to.have.property("weight");
      expect(result[0].values).to.have.property("color");
    });

    it("should filter entries by article ID", async () => {
      // Create another article with shop floor fields
      const res2 = await request(app)
        .post("/api/articles")
        .send({
          name: "Another Product",
          organization: "Test Corp",
          status: "active",
          shopFloorFields: [
            {
              fieldKey: "quantity",
              fieldLabel: "Quantity",
              fieldType: "number",
              scope: "shop_floor",
            },
          ],
        });
      const article2Id = res2.body.id;

      // Create entries for different articles via TRPC
      await request(app)
        .post("/trpc/entries.create")
        .send({
          articleId: testArticleId,
          values: { weight: 50 },
        });

      await request(app)
        .post("/trpc/entries.create")
        .send({
          articleId: article2Id,
          values: { quantity: 10 },
        });

      // Query for first article's entries
      const res = await request(app)
        .get(
          "/trpc/entries.list?input=" +
            encodeURIComponent(JSON.stringify({ articleId: testArticleId }))
        )
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result).to.have.lengthOf(1);
      expect(result[0].articleId).to.equal(testArticleId);
    });
  });

  describe("entries.create (POST /trpc/entries.create)", () => {
    it("should create entry via TRPC", async () => {
      const res = await request(app)
        .post("/trpc/entries.create")
        .send({
          articleId: testArticleId,
          values: {
            weight: 100,
            color: "Green",
          },
        })
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result.id).to.exist;
      expect(result.articleId).to.equal(testArticleId);
    });

    it("should validate field values against schema via TRPC", async () => {
      const res = await request(app)
        .post("/trpc/entries.create")
        .send({
          articleId: testArticleId,
          values: {
            weight: 1500, // Exceeds max of 1000
            color: "Blue",
          },
        })
        .expect(400);

      expect(res.body.error).to.exist;
    });

    it("should handle missing required fields via TRPC", async () => {
      const res = await request(app)
        .post("/trpc/entries.create")
        .send({
          articleId: testArticleId,
          values: {
            color: "Blue",
            // weight is missing but required
          },
        })
        .expect(400);

      expect(res.body.error).to.exist;
    });

    it("should accept entries with only optional fields via TRPC", async () => {
      const res = await request(app)
        .post("/trpc/entries.create")
        .send({
          articleId: testArticleId,
          values: {
            weight: 50,
            // color is optional
          },
        })
        .expect(200);

      const result = JSON.parse(res.text).result.data;
      expect(result.id).to.exist;
    });
  });

  describe("TRPC Integration - Full Flow", () => {
    it("should handle complete workflow: create article -> create entries -> list entries", async () => {
      // 1. Create article via regular API
      const articleRes = await request(app)
        .post("/api/articles")
        .send({
          name: "Integration Test Product",
          organization: "Test",
          status: "active",
          shopFloorFields: [
            {
              fieldKey: "quantity",
              fieldLabel: "Quantity",
              fieldType: "number",
              scope: "shop_floor",
              validation: { required: true, min: 1 },
            },
          ],
        })
        .expect(201);

      const articleId = articleRes.body.id;

      // 2. Create entry via TRPC
      const createRes = await request(app)
        .post("/trpc/entries.create")
        .send({
          articleId: articleId,
          values: { quantity: 100 },
        })
        .expect(200);

      expect(JSON.parse(createRes.text).result.data.id).to.exist;

      // 3. List entries via TRPC
      const listRes = await request(app)
        .get("/trpc/entries.list?input=" + encodeURIComponent(JSON.stringify({ articleId })))
        .expect(200);

      const entries = JSON.parse(listRes.text).result.data;
      expect(entries).to.have.lengthOf(1);
      expect(entries[0].values.quantity).to.equal(100);
    });
  });
});
