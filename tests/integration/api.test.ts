/**
 * API Integration Tests
 * Verifies: REQ-VIS-001, REQ-VIS-003
 *
 * Tests the complete API workflow with real data through the Hono server.
 */
import { describe, expect, it, beforeAll } from "bun:test";
import { createApp, type DataStore } from "../../src/application/api/server";
import { createCategory } from "../../src/domain/entities/Category";
import { createCategoryObject } from "../../src/domain/entities/Object";
import { createMorphism } from "../../src/domain/entities/Morphism";
import { createFunctor } from "../../src/domain/entities/Functor";
import { createNaturalTransformation } from "../../src/domain/entities/NaturalTransformation";

describe("API Integration Tests", () => {
  // ==========================================================================
  // Test Data Setup
  // ==========================================================================

  const mathObjects = [
    createCategoryObject("set", "Set Theory", "mathematics"),
    createCategoryObject("group", "Group Theory", "mathematics"),
    createCategoryObject("ring", "Ring Theory", "mathematics"),
    createCategoryObject("field", "Field Theory", "mathematics"),
  ];

  const mathMorphisms = [
    createMorphism("set-to-group", "structure", "set", "group"),
    createMorphism("group-to-ring", "addition", "group", "ring"),
    createMorphism("ring-to-field", "division", "ring", "field"),
    createMorphism("set-id", "id_set", "set", "set", { isIdentity: true }),
  ];

  const mathCategory = createCategory("math", "Mathematics", mathObjects, mathMorphisms);

  const csObjects = [
    createCategoryObject("type", "Type Systems", "programming"),
    createCategoryObject("monad", "Monad Patterns", "programming"),
  ];

  const csMorphisms = [createMorphism("type-to-monad", "lift", "type", "monad")];

  const csCategory = createCategory("cs", "Computer Science", csObjects, csMorphisms);

  const testFunctor = createFunctor(
    "F",
    "Math to CS Functor",
    "math",
    "cs",
    new Map([
      ["set", "type"],
      ["group", "monad"],
    ]),
    new Map([["set-to-group", "type-to-monad"]])
  );

  const testNatTrans = createNaturalTransformation(
    "eta",
    "Identity Transform",
    "F",
    "F",
    new Map([["set", "set-id"]])
  );

  const testData: DataStore = {
    categories: [mathCategory, csCategory],
    functors: [testFunctor],
    naturalTransformations: [testNatTrans],
  };

  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    app = createApp(testData);
  });

  // ==========================================================================
  // Helper Functions
  // ==========================================================================

  async function apiGet(path: string): Promise<Response> {
    const req = new Request(`http://localhost${path}`);
    return app.fetch(req);
  }

  async function apiPost(path: string, body: unknown): Promise<Response> {
    const req = new Request(`http://localhost${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return app.fetch(req);
  }

  // ==========================================================================
  // Health Check Tests
  // ==========================================================================

  describe("Health Check", () => {
    it("should return health status", async () => {
      const res = await apiGet("/api/health");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe("ok");
      expect(data.timestamp).toBeDefined();
    });
  });

  // ==========================================================================
  // Objects API Tests
  // ==========================================================================

  describe("Objects API", () => {
    it("should list all objects", async () => {
      const res = await apiGet("/api/objects");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.objects).toBeDefined();
      expect(data.objects.length).toBe(6); // 4 math + 2 cs
    });

    it("should filter objects by domain", async () => {
      const res = await apiGet("/api/objects?domain=mathematics");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.objects.every((o: { domain: string }) => o.domain === "mathematics")).toBe(true);
    });

    it("should get object by id", async () => {
      const res = await apiGet("/api/objects/set");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.object).toBeDefined();
      expect(data.object.id).toBe("set");
      expect(data.object.title).toBe("Set Theory");
      expect(data.outgoingMorphisms).toBeDefined();
      expect(data.incomingMorphisms).toBeDefined();
    });

    it("should return 404 for non-existent object", async () => {
      const res = await apiGet("/api/objects/non-existent");
      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data.error).toContain("not found");
    });
  });

  // ==========================================================================
  // Morphisms API Tests
  // ==========================================================================

  describe("Morphisms API", () => {
    it("should list all morphisms", async () => {
      const res = await apiGet("/api/morphisms");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.morphisms).toBeDefined();
      expect(data.morphisms.length).toBe(5); // 4 math + 1 cs
    });

    it("should filter morphisms by source", async () => {
      const res = await apiGet("/api/morphisms?source=set");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.morphisms.every((m: { source: string }) => m.source === "set")).toBe(true);
    });

    it("should filter morphisms by target", async () => {
      const res = await apiGet("/api/morphisms?target=group");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.morphisms.every((m: { target: string }) => m.target === "group")).toBe(true);
    });

    it("should get morphism by id", async () => {
      const res = await apiGet("/api/morphisms/set-to-group");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.morphism).toBeDefined();
      expect(data.morphism.id).toBe("set-to-group");
      expect(data.morphism.source).toBe("set");
      expect(data.morphism.target).toBe("group");
    });

    it("should return 404 for non-existent morphism", async () => {
      const res = await apiGet("/api/morphisms/non-existent");
      expect(res.status).toBe(404);
    });
  });

  // ==========================================================================
  // Categories API Tests
  // ==========================================================================

  describe("Categories API", () => {
    it("should list all categories", async () => {
      const res = await apiGet("/api/categories");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.categories).toBeDefined();
      expect(data.categories.length).toBe(2);
      expect(data.categories.map((c: { id: string }) => c.id).sort()).toEqual(["cs", "math"]);
    });

    it("should include object and morphism counts", async () => {
      const res = await apiGet("/api/categories");
      const data = await res.json();

      const mathCat = data.categories.find((c: { id: string }) => c.id === "math");
      expect(mathCat.objectCount).toBe(4);
      expect(mathCat.morphismCount).toBe(4);
    });

    it("should get category by id with full details", async () => {
      const res = await apiGet("/api/categories/math");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.category).toBeDefined();
      expect(data.category.id).toBe("math");
      expect(data.category.objects).toHaveLength(4);
      expect(data.category.morphisms).toHaveLength(4);
    });

    it("should return 404 for non-existent category", async () => {
      const res = await apiGet("/api/categories/non-existent");
      expect(res.status).toBe(404);
    });
  });

  // ==========================================================================
  // Functors API Tests
  // ==========================================================================

  describe("Functors API", () => {
    it("should list all functors", async () => {
      const res = await apiGet("/api/functors");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.functors).toBeDefined();
      expect(data.functors.length).toBe(1);
      expect(data.functors[0].id).toBe("F");
    });

    it("should get functor by id with mappings", async () => {
      const res = await apiGet("/api/functors/F");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.functor).toBeDefined();
      expect(data.functor.sourceCategory).toBe("math");
      expect(data.functor.targetCategory).toBe("cs");
      expect(data.functor.objectMapping).toBeDefined();
      expect(data.functor.morphismMapping).toBeDefined();
    });

    it("should return 404 for non-existent functor", async () => {
      const res = await apiGet("/api/functors/non-existent");
      expect(res.status).toBe(404);
    });
  });

  // ==========================================================================
  // Natural Transformations API Tests
  // ==========================================================================

  describe("Natural Transformations API", () => {
    it("should list all natural transformations", async () => {
      const res = await apiGet("/api/natural-transformations");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.naturalTransformations).toBeDefined();
      expect(data.naturalTransformations.length).toBe(1);
    });

    it("should get natural transformation by id", async () => {
      const res = await apiGet("/api/natural-transformations/eta");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.naturalTransformation).toBeDefined();
      expect(data.naturalTransformation.name).toBe("Identity Transform");
      expect(data.naturalTransformation.components).toBeDefined();
    });

    it("should return 404 for non-existent natural transformation", async () => {
      const res = await apiGet("/api/natural-transformations/non-existent");
      expect(res.status).toBe(404);
    });
  });

  // ==========================================================================
  // Graph API Tests
  // ==========================================================================

  describe("Graph API", () => {
    it("should return graph data for visualization", async () => {
      const res = await apiGet("/api/graph");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.nodes).toBeDefined();
      expect(data.edges).toBeDefined();
      expect(data.nodes.length).toBe(6); // All objects
      expect(data.edges.length).toBe(5); // All morphisms
    });

    it("should filter graph by category", async () => {
      const res = await apiGet("/api/graph?category=math");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.nodes.length).toBe(4); // Math objects only
      expect(data.edges.length).toBe(4); // Math morphisms only
    });

    it("should include node metadata", async () => {
      const res = await apiGet("/api/graph");
      const data = await res.json();

      const setNode = data.nodes.find((n: { id: string }) => n.id === "set");
      expect(setNode).toBeDefined();
      expect(setNode.label).toBe("Set Theory");
      expect(setNode.type).toBe("object");
      expect(setNode.domain).toBe("mathematics");
      expect(setNode.categoryId).toBe("math");
    });

    it("should include edge metadata", async () => {
      const res = await apiGet("/api/graph");
      const data = await res.json();

      const edge = data.edges.find((e: { id: string }) => e.id === "set-to-group");
      expect(edge).toBeDefined();
      expect(edge.source).toBe("set");
      expect(edge.target).toBe("group");
      expect(edge.label).toBe("structure");
      expect(edge.type).toBe("morphism");
    });
  });

  // ==========================================================================
  // Validate API Tests
  // ==========================================================================

  describe("Validate API", () => {
    it("should validate the complete structure", async () => {
      const res = await apiPost("/api/validate", {});
      expect(res.status).toBe(200);

      const data = await res.json();
      // Validation may report warnings about missing identity morphisms
      // but the core structure should be checked
      expect(data.summary).toBeDefined();
      expect(data.summary.categoriesChecked).toBe(2);
      expect(data.summary.functorsChecked).toBe(1);
      expect(data.errors).toBeDefined();
      expect(data.warnings).toBeDefined();
    });

    it("should return validation errors and warnings", async () => {
      const res = await apiPost("/api/validate", {});
      const data = await res.json();

      expect(data.errors).toBeDefined();
      expect(data.warnings).toBeDefined();
      expect(Array.isArray(data.errors)).toBe(true);
      expect(Array.isArray(data.warnings)).toBe(true);
    });
  });

  // ==========================================================================
  // Trace API Tests
  // ==========================================================================

  describe("Trace API", () => {
    it("should trace path between objects", async () => {
      const res = await apiPost("/api/trace", {
        source: "set",
        target: "field",
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.found).toBe(true);
      expect(data.paths.length).toBeGreaterThan(0);
      expect(data.shortestPath).toBeDefined();
    });

    it("should return shortest path info", async () => {
      const res = await apiPost("/api/trace", {
        source: "set",
        target: "field",
      });
      const data = await res.json();

      expect(data.shortestPathLength).toBe(3); // set -> group -> ring -> field
      expect(data.shortestPath.length).toBe(3);
    });

    it("should handle no path found", async () => {
      const res = await apiPost("/api/trace", {
        source: "field",
        target: "set",
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.found).toBe(false);
      expect(data.paths).toHaveLength(0);
    });

    it("should require source and target", async () => {
      const res = await apiPost("/api/trace", { source: "set" });
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toContain("Missing");
    });

    it("should handle category not found", async () => {
      const res = await apiPost("/api/trace", {
        source: "non-existent",
        target: "field",
      });
      expect(res.status).toBe(404);
    });

    it("should trace with explicit categoryId", async () => {
      const res = await apiPost("/api/trace", {
        source: "set",
        target: "group",
        categoryId: "math",
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.found).toBe(true);
    });
  });

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe("Error Handling", () => {
    it("should return 404 for unknown routes", async () => {
      const res = await apiGet("/api/unknown-endpoint");
      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data.error).toBe("Not found");
    });

    it("should handle malformed JSON in POST requests", async () => {
      const req = new Request("http://localhost/api/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not valid json",
      });
      const res = await app.fetch(req);
      // Hono returns 500 for JSON parse errors by default
      expect([400, 500]).toContain(res.status);
    });
  });

  // ==========================================================================
  // Full Workflow Test
  // ==========================================================================

  describe("Full API Workflow", () => {
    it("should support complete exploration workflow", async () => {
      // 1. Get list of categories
      const catRes = await apiGet("/api/categories");
      const catData = await catRes.json();
      expect(catData.categories.length).toBeGreaterThan(0);

      const mathId = catData.categories.find((c: { name: string }) => c.name === "Mathematics").id;

      // 2. Get category details
      const catDetailRes = await apiGet(`/api/categories/${mathId}`);
      const catDetail = await catDetailRes.json();
      expect(catDetail.category.objects.length).toBeGreaterThan(0);

      const firstObjId = catDetail.category.objects[0].id;

      // 3. Get object details
      const objRes = await apiGet(`/api/objects/${firstObjId}`);
      const objData = await objRes.json();
      expect(objData.object).toBeDefined();

      // 4. Get graph for visualization
      const graphRes = await apiGet(`/api/graph?category=${mathId}`);
      const graphData = await graphRes.json();
      expect(graphData.nodes.length).toBeGreaterThan(0);

      // 5. Validate the structure
      const validateRes = await apiPost("/api/validate", {});
      const validateData = await validateRes.json();
      expect(validateData.summary).toBeDefined();
      expect(validateData.summary.categoriesChecked).toBeGreaterThan(0);

      // 6. Trace a path
      if (catDetail.category.objects.length >= 2) {
        const traceRes = await apiPost("/api/trace", {
          source: catDetail.category.objects[0].id,
          target: catDetail.category.objects[1].id,
          categoryId: mathId,
        });
        expect(traceRes.status).toBe(200);
      }
    });
  });
});
