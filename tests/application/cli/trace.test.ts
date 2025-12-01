/**
 * CLI Trace Command Tests
 * Verifies: REQ-SEARCH-001
 */
import { describe, expect, it } from "bun:test";
import {
  tracePath,
  traceDomainPath,
} from "../../../src/application/cli/trace";
import { createCategory } from "../../../src/domain/entities/Category";
import { createCategoryObject } from "../../../src/domain/entities/Object";
import { createMorphism } from "../../../src/domain/entities/Morphism";
import { createFunctor } from "../../../src/domain/entities/Functor";

describe("CLI Trace Command", () => {
  // TEST-TRACE-001: Trace path within category
  describe("tracePath", () => {
    it("should find direct morphism path", () => {
      const objects = [
        createCategoryObject("A", "A", "test"),
        createCategoryObject("B", "B", "test"),
      ];
      const morphisms = [createMorphism("f", "f", "A", "B")];
      const category = createCategory("C", "Category", objects, morphisms);

      const result = tracePath("A", "B", category);

      expect(result.found).toBe(true);
      expect(result.paths).toHaveLength(1);
      expect(result.paths[0]).toHaveLength(1);
      expect(result.paths[0][0].id).toBe("f");
    });

    it("should find multi-step path", () => {
      const objects = [
        createCategoryObject("A", "A", "test"),
        createCategoryObject("B", "B", "test"),
        createCategoryObject("C", "C", "test"),
      ];
      const morphisms = [
        createMorphism("f", "f", "A", "B"),
        createMorphism("g", "g", "B", "C"),
      ];
      const category = createCategory("Cat", "Category", objects, morphisms);

      const result = tracePath("A", "C", category);

      expect(result.found).toBe(true);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.shortestPath).toHaveLength(2);
    });

    it("should return not found when no path exists", () => {
      const objects = [
        createCategoryObject("A", "A", "test"),
        createCategoryObject("B", "B", "test"),
      ];
      const category = createCategory("C", "Category", objects, []);

      const result = tracePath("A", "B", category);

      expect(result.found).toBe(false);
      expect(result.paths).toHaveLength(0);
    });

    it("should handle self-path with identity", () => {
      const objects = [createCategoryObject("A", "A", "test")];
      const morphisms = [createMorphism("id-A", "id_A", "A", "A")];
      const category = createCategory("C", "Category", objects, morphisms);

      const result = tracePath("A", "A", category);

      expect(result.found).toBe(true);
    });

    it("should find all paths when requested", () => {
      const objects = [
        createCategoryObject("A", "A", "test"),
        createCategoryObject("B", "B", "test"),
        createCategoryObject("C", "C", "test"),
      ];
      const morphisms = [
        createMorphism("f", "f", "A", "B"),
        createMorphism("g", "g", "B", "C"),
        createMorphism("h", "h", "A", "C"), // Direct path
      ];
      const category = createCategory("Cat", "Category", objects, morphisms);

      const result = tracePath("A", "C", category, { findAll: true });

      expect(result.found).toBe(true);
      expect(result.paths.length).toBeGreaterThanOrEqual(2);
    });
  });

  // TEST-TRACE-002: Trace domain path through functors
  describe("traceDomainPath", () => {
    it("should find path through functor", () => {
      const catA = createCategory(
        "A",
        "Category A",
        [createCategoryObject("x", "x", "test")],
        []
      );
      const catB = createCategory(
        "B",
        "Category B",
        [createCategoryObject("y", "y", "test")],
        []
      );

      const functor = createFunctor(
        "F",
        "F",
        "A",
        "B",
        new Map([["x", "y"]]),
        new Map()
      );

      const result = traceDomainPath("x", "B", [catA, catB], [functor], []);

      expect(result.found).toBe(true);
      expect(result.paths.length).toBeGreaterThan(0);
    });

    it("should find path through multiple functors", () => {
      const catA = createCategory(
        "A",
        "Category A",
        [createCategoryObject("a", "a", "test")],
        []
      );
      const catB = createCategory(
        "B",
        "Category B",
        [createCategoryObject("b", "b", "test")],
        []
      );
      const catC = createCategory(
        "C",
        "Category C",
        [createCategoryObject("c", "c", "test")],
        []
      );

      const functorF = createFunctor(
        "F",
        "F",
        "A",
        "B",
        new Map([["a", "b"]]),
        new Map()
      );
      const functorG = createFunctor(
        "G",
        "G",
        "B",
        "C",
        new Map([["b", "c"]]),
        new Map()
      );

      const result = traceDomainPath(
        "a",
        "C",
        [catA, catB, catC],
        [functorF, functorG],
        []
      );

      expect(result.found).toBe(true);
    });

    it("should return not found when target unreachable", () => {
      const catA = createCategory(
        "A",
        "Category A",
        [createCategoryObject("x", "x", "test")],
        []
      );
      const catB = createCategory("B", "Category B", [], []);

      const result = traceDomainPath("x", "B", [catA, catB], [], []);

      expect(result.found).toBe(false);
    });

    it("should include functor information in path", () => {
      const catA = createCategory(
        "A",
        "Category A",
        [createCategoryObject("x", "x", "test")],
        []
      );
      const catB = createCategory(
        "B",
        "Category B",
        [createCategoryObject("y", "y", "test")],
        []
      );

      const functor = createFunctor(
        "F",
        "Functor F",
        "A",
        "B",
        new Map([["x", "y"]]),
        new Map()
      );

      const result = traceDomainPath("x", "B", [catA, catB], [functor], []);

      expect(result.found).toBe(true);
      if (result.paths.length > 0) {
        const firstPath = result.paths[0];
        expect(firstPath.steps.some((s) => s.type === "functor")).toBe(true);
      }
    });
  });

  // TEST-TRACE-003: Trace result formatting
  describe("result formatting", () => {
    it("should include source and target in result", () => {
      const category = createCategory("C", "Category", [], []);

      const result = tracePath("A", "B", category);

      expect(result.source).toBe("A");
      expect(result.target).toBe("B");
    });

    it("should include shortest path", () => {
      const objects = [
        createCategoryObject("A", "A", "test"),
        createCategoryObject("B", "B", "test"),
      ];
      const morphisms = [createMorphism("f", "f", "A", "B")];
      const category = createCategory("C", "Category", objects, morphisms);

      const result = tracePath("A", "B", category);

      expect(result.shortestPath).toBeDefined();
    });

    it("should report path length", () => {
      const objects = [
        createCategoryObject("A", "A", "test"),
        createCategoryObject("B", "B", "test"),
      ];
      const morphisms = [createMorphism("f", "f", "A", "B")];
      const category = createCategory("C", "Category", objects, morphisms);

      const result = tracePath("A", "B", category);

      expect(result.shortestPathLength).toBe(1);
    });
  });
});
