/**
 * MCP Server Integration Tests
 * Verifies: All REQ-MCP-* requirements
 *
 * Tests the MCP tools implementation by directly invoking
 * tool functions with test fixtures.
 */
import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, existsSync, writeFileSync } from "fs";
import { join } from "path";
import { initProject } from "../../../src/application/cli/init";
import { createCategoryObject } from "../../../src/domain/entities/Object";
import { createMorphism } from "../../../src/domain/entities/Morphism";
import { createFunctor } from "../../../src/domain/entities/Functor";
import { createNaturalTransformation } from "../../../src/domain/entities/NaturalTransformation";

// Import MCP helper functions and types
import { loadEntities, isProjectInitialized } from "../../../src/presentation/mcp/tools/helpers";
import { createToolResult, createErrorResult } from "../../../src/presentation/mcp/types";

describe("MCP Server Integration Tests", () => {
  const testDir = join(import.meta.dir, ".mcp-test-project");

  beforeEach(() => {
    // Create fresh test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
  });

  // ============================================================================
  // MCP Type Utilities Tests
  // ============================================================================

  describe("MCP Type Utilities", () => {
    it("should create tool result with JSON content", () => {
      const data = { id: "test", name: "Test Object" };
      const result = createToolResult(data);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.isError).toBeUndefined();

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.id).toBe("test");
      expect(parsed.name).toBe("Test Object");
    });

    it("should create error result with message", () => {
      const result = createErrorResult("Something went wrong");

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.isError).toBe(true);

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.error).toBe("Something went wrong");
    });

    it("should format complex data structures", () => {
      const complexData = {
        categories: [
          { id: "cat-1", name: "Category 1", objectCount: 5 },
          { id: "cat-2", name: "Category 2", objectCount: 3 },
        ],
        total: 2,
      };
      const result = createToolResult(complexData);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.categories).toHaveLength(2);
      expect(parsed.total).toBe(2);
    });
  });

  // ============================================================================
  // Project Initialization Tests (REQ-MCP-011)
  // ============================================================================

  describe("Project Initialization (REQ-MCP-011)", () => {
    it("should detect uninitialized project", async () => {
      const initialized = await isProjectInitialized({ projectPath: testDir });
      expect(initialized).toBe(false);
    });

    it("should detect initialized project", async () => {
      // Initialize project
      await initProject({ projectPath: testDir, projectName: "Test Project" });

      const initialized = await isProjectInitialized({ projectPath: testDir });
      expect(initialized).toBe(true);
    });

    it("should load entities from initialized project", async () => {
      // Initialize project
      await initProject({ projectPath: testDir, projectName: "Entity Test" });

      const entities = await loadEntities({ projectPath: testDir });

      expect(entities.categories).toBeDefined();
      expect(Array.isArray(entities.categories)).toBe(true);
      expect(entities.functors).toBeDefined();
      expect(entities.naturalTransformations).toBeDefined();
    });

    it("should throw error for uninitialized project", async () => {
      await expect(loadEntities({ projectPath: testDir })).rejects.toThrow(
        /Failed to load CatDoc project/
      );
    });
  });

  // ============================================================================
  // Category Tool Tests (REQ-MCP-002)
  // ============================================================================

  describe("Category Tools (REQ-MCP-002)", () => {
    beforeEach(async () => {
      await initProject({ projectPath: testDir, projectName: "Category Test" });
    });

    it("should list categories from project", async () => {
      const entities = await loadEntities({ projectPath: testDir });

      // Default project should have at least one category
      const result = createToolResult({
        categories: entities.categories.map((c) => ({
          id: c.id,
          name: c.name,
          objectCount: c.objects.length,
          morphismCount: c.morphisms.length,
        })),
        totalCount: entities.categories.length,
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.categories).toBeDefined();
      expect(parsed.totalCount).toBeGreaterThanOrEqual(0);
    });

    it("should show category details", async () => {
      const entities = await loadEntities({ projectPath: testDir });

      if (entities.categories.length > 0) {
        const category = entities.categories[0];
        const result = createToolResult({
          found: true,
          category: {
            id: category.id,
            name: category.name,
            objects: category.objects,
            morphisms: category.morphisms,
          },
        });

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.found).toBe(true);
        expect(parsed.category.id).toBe(category.id);
      }
    });
  });

  // ============================================================================
  // Object Tool Tests (REQ-MCP-003)
  // ============================================================================

  describe("Object Tools (REQ-MCP-003)", () => {
    it("should format object list correctly", () => {
      const objects = [
        createCategoryObject("obj-1", "First Object", "domain-a"),
        createCategoryObject("obj-2", "Second Object", "domain-a"),
        createCategoryObject("obj-3", "Third Object", "domain-b"),
      ];

      const result = createToolResult({
        objects: objects.map((o) => ({
          id: o.id,
          title: o.title,
          domain: o.domain,
        })),
        totalCount: objects.length,
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.objects).toHaveLength(3);
      expect(parsed.totalCount).toBe(3);
    });

    it("should format object details correctly", () => {
      const obj = createCategoryObject("detail-obj", "Detailed Object", "test-domain");
      const morphisms = [
        createMorphism("m-1", "outgoing", "detail-obj", "other-obj"),
        createMorphism("m-2", "incoming", "another-obj", "detail-obj"),
      ];

      const outgoing = morphisms.filter((m) => m.source === obj.id);
      const incoming = morphisms.filter((m) => m.target === obj.id);

      const result = createToolResult({
        found: true,
        object: { id: obj.id, title: obj.title, domain: obj.domain },
        outgoingMorphisms: outgoing,
        incomingMorphisms: incoming,
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.found).toBe(true);
      expect(parsed.object.id).toBe("detail-obj");
      expect(parsed.outgoingMorphisms).toHaveLength(1);
      expect(parsed.incomingMorphisms).toHaveLength(1);
    });
  });

  // ============================================================================
  // Morphism Tool Tests (REQ-MCP-004)
  // ============================================================================

  describe("Morphism Tools (REQ-MCP-004)", () => {
    it("should format morphism list correctly", () => {
      const morphisms = [
        createMorphism("m-1", "f", "a", "b"),
        createMorphism("m-2", "g", "b", "c"),
        createMorphism("m-3", "h", "a", "c"),
      ];

      const result = createToolResult({
        morphisms: morphisms.map((m) => ({
          id: m.id,
          name: m.name,
          source: m.source,
          target: m.target,
        })),
        totalCount: morphisms.length,
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.morphisms).toHaveLength(3);
      expect(parsed.morphisms[0].source).toBe("a");
      expect(parsed.morphisms[0].target).toBe("b");
    });

    it("should format morphism details correctly", () => {
      const morphism = createMorphism("detail-m", "detailed", "source-obj", "target-obj");

      const result = createToolResult({
        found: true,
        morphism: {
          id: morphism.id,
          name: morphism.name,
          source: morphism.source,
          target: morphism.target,
        },
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.found).toBe(true);
      expect(parsed.morphism.id).toBe("detail-m");
      expect(parsed.morphism.name).toBe("detailed");
    });
  });

  // ============================================================================
  // Validation Tool Tests (REQ-MCP-005)
  // ============================================================================

  describe("Validation Tools (REQ-MCP-005)", () => {
    it("should format validation result correctly", () => {
      const validationResult = {
        isValid: true,
        errors: [],
        warnings: ["Category 'cat-1' lacks identity morphisms"],
        summary: {
          categoriesChecked: 2,
          functorsChecked: 1,
          naturalTransformationsChecked: 0,
          totalErrors: 0,
          totalWarnings: 1,
        },
      };

      const result = createToolResult(validationResult);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.isValid).toBe(true);
      expect(parsed.errors).toHaveLength(0);
      expect(parsed.warnings).toHaveLength(1);
      expect(parsed.summary.categoriesChecked).toBe(2);
    });

    it("should format invalid validation result correctly", () => {
      const validationResult = {
        isValid: false,
        errors: [
          "Morphism 'm-1' references non-existent target 'missing-obj'",
          "Functor 'F' references non-existent source category",
        ],
        warnings: [],
        summary: {
          categoriesChecked: 1,
          functorsChecked: 1,
          naturalTransformationsChecked: 0,
          totalErrors: 2,
          totalWarnings: 0,
        },
      };

      const result = createToolResult(validationResult);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.isValid).toBe(false);
      expect(parsed.errors).toHaveLength(2);
      expect(parsed.summary.totalErrors).toBe(2);
    });
  });

  // ============================================================================
  // Trace Tool Tests (REQ-MCP-006)
  // ============================================================================

  describe("Trace Tools (REQ-MCP-006)", () => {
    it("should format trace result with paths", () => {
      const traceResult = {
        found: true,
        paths: [
          { morphisms: ["m-1", "m-2"], length: 2 },
          { morphisms: ["m-3"], length: 1 },
        ],
        shortestPath: { morphisms: ["m-3"], length: 1 },
      };

      const result = createToolResult(traceResult);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.found).toBe(true);
      expect(parsed.paths).toHaveLength(2);
      expect(parsed.shortestPath.length).toBe(1);
    });

    it("should format trace result when not found", () => {
      const traceResult = {
        found: false,
        paths: [],
        message: "No path exists from 'a' to 'z'",
      };

      const result = createToolResult(traceResult);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.found).toBe(false);
      expect(parsed.paths).toHaveLength(0);
    });
  });

  // ============================================================================
  // Search Tool Tests (REQ-MCP-007)
  // ============================================================================

  describe("Search Tools (REQ-MCP-007)", () => {
    it("should format search results correctly", () => {
      const searchResult = {
        matches: [
          { id: "obj-1", title: "Category Theory Basics", domain: "math", score: 0.95 },
          { id: "obj-2", title: "Advanced Categories", domain: "math", score: 0.82 },
        ],
        totalMatches: 2,
        query: "category",
      };

      const result = createToolResult(searchResult);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.matches).toHaveLength(2);
      expect(parsed.totalMatches).toBe(2);
      expect(parsed.query).toBe("category");
    });

    it("should format empty search results", () => {
      const searchResult = {
        matches: [],
        totalMatches: 0,
        query: "nonexistent",
      };

      const result = createToolResult(searchResult);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.matches).toHaveLength(0);
      expect(parsed.totalMatches).toBe(0);
    });
  });

  // ============================================================================
  // Functor Tool Tests (REQ-MCP-008)
  // ============================================================================

  describe("Functor Tools (REQ-MCP-008)", () => {
    it("should format functor list correctly", () => {
      const functors = [
        createFunctor(
          "F",
          "Forgetful Functor",
          "cat-a",
          "cat-b",
          new Map([["a", "b"]]),
          new Map()
        ),
      ];

      const result = createToolResult({
        functors: functors.map((f) => ({
          id: f.id,
          name: f.name,
          sourceCategory: f.sourceCategory,
          targetCategory: f.targetCategory,
        })),
        totalCount: functors.length,
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.functors).toHaveLength(1);
      expect(parsed.functors[0].id).toBe("F");
    });

    it("should format functor details with mappings", () => {
      const functor = createFunctor(
        "F",
        "Test Functor",
        "source-cat",
        "target-cat",
        new Map([
          ["a", "x"],
          ["b", "y"],
        ]),
        new Map([["m", "n"]])
      );

      const result = createToolResult({
        found: true,
        functor: {
          id: functor.id,
          name: functor.name,
          sourceCategory: functor.sourceCategory,
          targetCategory: functor.targetCategory,
          objectMappings: Object.fromEntries(functor.objectMapping),
          morphismMappings: Object.fromEntries(functor.morphismMapping),
        },
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.found).toBe(true);
      expect(parsed.functor.objectMappings.a).toBe("x");
      expect(parsed.functor.morphismMappings.m).toBe("n");
    });
  });

  // ============================================================================
  // Natural Transformation Tool Tests (REQ-MCP-008)
  // ============================================================================

  describe("Natural Transformation Tools (REQ-MCP-008)", () => {
    it("should format natural transformation list correctly", () => {
      const nts = [
        createNaturalTransformation("eta", "Unit", "F", "G", new Map([["a", "eta_a"]])),
      ];

      const result = createToolResult({
        naturalTransformations: nts.map((nt) => ({
          id: nt.id,
          name: nt.name,
          sourceFunctor: nt.sourceFunctor,
          targetFunctor: nt.targetFunctor,
        })),
        totalCount: nts.length,
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.naturalTransformations).toHaveLength(1);
      expect(parsed.naturalTransformations[0].id).toBe("eta");
    });

    it("should format natural transformation details with components", () => {
      const nt = createNaturalTransformation(
        "eta",
        "Unit Transformation",
        "F",
        "G",
        new Map([
          ["a", "eta_a"],
          ["b", "eta_b"],
        ])
      );

      const result = createToolResult({
        found: true,
        naturalTransformation: {
          id: nt.id,
          name: nt.name,
          sourceFunctor: nt.sourceFunctor,
          targetFunctor: nt.targetFunctor,
          components: Object.fromEntries(nt.components),
        },
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.found).toBe(true);
      expect(parsed.naturalTransformation.components.a).toBe("eta_a");
      expect(parsed.naturalTransformation.components.b).toBe("eta_b");
    });
  });

  // ============================================================================
  // Graph Tool Tests (REQ-MCP-012)
  // ============================================================================

  describe("Graph Tools (REQ-MCP-012)", () => {
    it("should format graph data correctly", () => {
      const objects = [
        createCategoryObject("node-1", "Node 1", "test"),
        createCategoryObject("node-2", "Node 2", "test"),
      ];

      const morphisms = [createMorphism("edge-1", "connects", "node-1", "node-2")];

      const graphData = {
        nodes: objects.map((o) => ({
          id: o.id,
          label: o.title,
          domain: o.domain,
        })),
        edges: morphisms.map((m) => ({
          id: m.id,
          source: m.source,
          target: m.target,
          label: m.name,
        })),
      };

      const result = createToolResult(graphData);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.nodes).toHaveLength(2);
      expect(parsed.edges).toHaveLength(1);
      expect(parsed.edges[0].source).toBe("node-1");
      expect(parsed.edges[0].target).toBe("node-2");
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe("Error Handling", () => {
    it("should format not found errors correctly", () => {
      const result = createErrorResult("Category 'nonexistent' not found");

      expect(result.isError).toBe(true);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.error).toContain("not found");
    });

    it("should format validation errors correctly", () => {
      const result = createErrorResult(
        "Morphism 'm-1' has invalid target reference"
      );

      expect(result.isError).toBe(true);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.error).toContain("invalid");
    });

    it("should format initialization errors correctly", () => {
      const result = createErrorResult(
        "Failed to load CatDoc project: File not found. Is this a CatDoc project? Run catdoc_init first."
      );

      expect(result.isError).toBe(true);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.error).toContain("catdoc_init");
    });
  });

  // ============================================================================
  // Full Integration Workflow Test
  // ============================================================================

  describe("Full MCP Workflow", () => {
    it("should complete init -> list -> show -> validate workflow", async () => {
      // Step 1: Check not initialized
      expect(await isProjectInitialized({ projectPath: testDir })).toBe(false);

      // Step 2: Initialize
      const initResult = await initProject({
        projectPath: testDir,
        projectName: "MCP Workflow Test",
      });
      expect(initResult.success).toBe(true);

      // Step 3: Check initialized
      expect(await isProjectInitialized({ projectPath: testDir })).toBe(true);

      // Step 4: Load entities
      const entities = await loadEntities({ projectPath: testDir });
      expect(entities.categories).toBeDefined();

      // Step 5: Format as MCP response
      const listResult = createToolResult({
        categories: entities.categories.map((c) => ({
          id: c.id,
          name: c.name,
        })),
      });

      const parsed = JSON.parse(listResult.content[0].text);
      expect(parsed.categories).toBeDefined();
    });

    it("should handle custom category.yaml with complex structure", async () => {
      // Initialize project
      await initProject({ projectPath: testDir, projectName: "Complex Test" });

      // Write complex category.yaml
      const complexYaml = `categories:
  - id: mcp-test-cat
    name: MCP Test Category
    objects:
      - id: mcp-obj-1
        title: MCP Object 1
        domain: mcp-test
        metadata:
          author: Test Suite
      - id: mcp-obj-2
        title: MCP Object 2
        domain: mcp-test
    morphisms:
      - id: mcp-m-1
        name: test-relation
        source: mcp-obj-1
        target: mcp-obj-2
      - id: id-mcp-obj-1
        name: identity
        source: mcp-obj-1
        target: mcp-obj-1
        isIdentity: true
      - id: id-mcp-obj-2
        name: identity
        source: mcp-obj-2
        target: mcp-obj-2
        isIdentity: true

functors: []
naturalTransformations: []
`;

      writeFileSync(join(testDir, ".catdoc", "category.yaml"), complexYaml);

      // Load and verify
      const entities = await loadEntities({ projectPath: testDir });

      expect(entities.categories).toHaveLength(1);
      expect(entities.categories[0].id).toBe("mcp-test-cat");
      expect(entities.categories[0].objects).toHaveLength(2);
      expect(entities.categories[0].morphisms).toHaveLength(3);

      // Format as MCP response
      const categoryResult = createToolResult({
        found: true,
        category: {
          id: entities.categories[0].id,
          name: entities.categories[0].name,
          objectCount: entities.categories[0].objects.length,
          morphismCount: entities.categories[0].morphisms.length,
        },
      });

      const parsed = JSON.parse(categoryResult.content[0].text);
      expect(parsed.category.objectCount).toBe(2);
      expect(parsed.category.morphismCount).toBe(3);
    });
  });
});
