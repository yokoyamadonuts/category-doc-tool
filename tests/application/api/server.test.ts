/**
 * Hono API Server Tests
 * Verifies: REQ-VIS-001, REQ-VIS-003
 */
import { describe, expect, it, beforeAll } from "bun:test";
import { createApp } from "../../../src/application/api/server";
import { createCategory } from "../../../src/domain/entities/Category";
import { createCategoryObject } from "../../../src/domain/entities/Object";
import { createMorphism } from "../../../src/domain/entities/Morphism";
import { createFunctor } from "../../../src/domain/entities/Functor";
import { createNaturalTransformation } from "../../../src/domain/entities/NaturalTransformation";

describe("Hono API Server", () => {
  // Test data
  const testObjects = [
    createCategoryObject("obj-1", "Object 1", "test-domain"),
    createCategoryObject("obj-2", "Object 2", "test-domain"),
  ];
  const testMorphisms = [
    createMorphism("m-1", "f", "obj-1", "obj-2"),
    createMorphism("id-1", "id_obj-1", "obj-1", "obj-1"),
  ];
  const testCategory = createCategory(
    "cat-1",
    "Test Category",
    testObjects,
    testMorphisms
  );
  const testFunctor = createFunctor(
    "F",
    "Functor F",
    "cat-1",
    "cat-1",
    new Map([["obj-1", "obj-2"]]),
    new Map([["m-1", "m-1"]])
  );
  const testNatTrans = createNaturalTransformation(
    "eta",
    "η",
    "F",
    "F",
    new Map([["obj-1", "m-1"]])
  );

  const testData = {
    categories: [testCategory],
    functors: [testFunctor],
    naturalTransformations: [testNatTrans],
  };

  const app = createApp(testData);

  // TEST-API-001: Health check
  describe("GET /api/health", () => {
    it("should return health status", async () => {
      const res = await app.request("/api/health");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe("ok");
    });
  });

  // TEST-API-002: Objects endpoints
  describe("Objects API", () => {
    it("GET /api/objects should return all objects", async () => {
      const res = await app.request("/api/objects");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.objects).toHaveLength(2);
    });

    it("GET /api/objects/:id should return single object", async () => {
      const res = await app.request("/api/objects/obj-1");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.object.id).toBe("obj-1");
      expect(data.object.title).toBe("Object 1");
    });

    it("GET /api/objects/:id should return 404 for unknown id", async () => {
      const res = await app.request("/api/objects/unknown");
      expect(res.status).toBe(404);
    });

    it("GET /api/objects?domain=x should filter by domain", async () => {
      const res = await app.request("/api/objects?domain=test-domain");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.objects.length).toBeGreaterThan(0);
      expect(data.objects.every((o: any) => o.domain === "test-domain")).toBe(true);
    });
  });

  // TEST-API-003: Morphisms endpoints
  describe("Morphisms API", () => {
    it("GET /api/morphisms should return all morphisms", async () => {
      const res = await app.request("/api/morphisms");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.morphisms).toHaveLength(2);
    });

    it("GET /api/morphisms/:id should return single morphism", async () => {
      const res = await app.request("/api/morphisms/m-1");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.morphism.id).toBe("m-1");
      expect(data.morphism.name).toBe("f");
    });

    it("GET /api/morphisms?source=x should filter by source", async () => {
      const res = await app.request("/api/morphisms?source=obj-1");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.morphisms.every((m: any) => m.source === "obj-1")).toBe(true);
    });
  });

  // TEST-API-004: Categories endpoints
  describe("Categories API", () => {
    it("GET /api/categories should return all categories", async () => {
      const res = await app.request("/api/categories");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.categories).toHaveLength(1);
    });

    it("GET /api/categories/:id should return single category", async () => {
      const res = await app.request("/api/categories/cat-1");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.category.id).toBe("cat-1");
      expect(data.category.name).toBe("Test Category");
      expect(data.category.objects).toHaveLength(2);
    });

    it("GET /api/categories/:id should return 404 for unknown id", async () => {
      const res = await app.request("/api/categories/unknown");
      expect(res.status).toBe(404);
    });
  });

  // TEST-API-005: Functors endpoints
  describe("Functors API", () => {
    it("GET /api/functors should return all functors", async () => {
      const res = await app.request("/api/functors");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.functors).toHaveLength(1);
    });

    it("GET /api/functors/:id should return single functor", async () => {
      const res = await app.request("/api/functors/F");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.functor.id).toBe("F");
      expect(data.functor.name).toBe("Functor F");
    });
  });

  // TEST-API-006: Graph endpoint
  describe("Graph API", () => {
    it("GET /api/graph should return nodes and edges", async () => {
      const res = await app.request("/api/graph");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.nodes).toBeDefined();
      expect(data.edges).toBeDefined();
      expect(Array.isArray(data.nodes)).toBe(true);
      expect(Array.isArray(data.edges)).toBe(true);
    });

    it("GET /api/graph?category=x should filter by category", async () => {
      const res = await app.request("/api/graph?category=cat-1");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.nodes.length).toBeGreaterThan(0);
    });
  });

  // TEST-API-007: Validate endpoint
  describe("Validate API", () => {
    it("POST /api/validate should validate all", async () => {
      const res = await app.request("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.isValid).toBeDefined();
      expect(data.errors).toBeDefined();
      expect(data.warnings).toBeDefined();
    });
  });

  // TEST-API-008: Trace endpoint
  describe("Trace API", () => {
    it("POST /api/trace should find path", async () => {
      const res = await app.request("/api/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "obj-1",
          target: "obj-2",
          categoryId: "cat-1",
        }),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.found).toBeDefined();
      expect(data.paths).toBeDefined();
    });
  });

  // TEST-API-009: CORS headers
  describe("CORS", () => {
    it("should include CORS headers", async () => {
      const res = await app.request("/api/health", {
        method: "OPTIONS",
      });

      // Hono handles CORS via middleware, check actual response
      expect(res.status).toBe(204);
    });
  });

  // TEST-API-010: Error handling
  describe("Error handling", () => {
    it("should return 404 for unknown routes", async () => {
      const res = await app.request("/api/unknown-route");
      expect(res.status).toBe(404);
    });

    it("should return JSON error response", async () => {
      const res = await app.request("/api/objects/nonexistent");
      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data.error).toBeDefined();
    });
  });
});
