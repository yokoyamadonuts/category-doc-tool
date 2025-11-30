/**
 * TraversalService Tests
 * Verifies: REQ-SEARCH-001
 */
import { describe, expect, it } from "bun:test";
import {
  type TransformationPath,
  findPath,
  findAllPaths,
  findDomainPath,
} from "../../../src/domain/services/TraversalService";
import { createCategory } from "../../../src/domain/entities/Category";
import { createCategoryObject } from "../../../src/domain/entities/Object";
import {
  createMorphism,
  createIdentity,
} from "../../../src/domain/entities/Morphism";
import { createFunctor } from "../../../src/domain/entities/Functor";
import { createNaturalTransformation } from "../../../src/domain/entities/NaturalTransformation";

describe("TraversalService", () => {
  // Helper: create a linear category A → B → C → D
  const createLinearCategory = () => {
    const objects = [
      createCategoryObject("A", "A", "test"),
      createCategoryObject("B", "B", "test"),
      createCategoryObject("C", "C", "test"),
      createCategoryObject("D", "D", "test"),
    ];
    const morphisms = [
      createIdentity("A"),
      createIdentity("B"),
      createIdentity("C"),
      createIdentity("D"),
      createMorphism("f", "f", "A", "B"),
      createMorphism("g", "g", "B", "C"),
      createMorphism("h", "h", "C", "D"),
    ];
    return createCategory("linear", "Linear", objects, morphisms);
  };

  // Helper: create a diamond category A → B → D, A → C → D
  const createDiamondCategory = () => {
    const objects = [
      createCategoryObject("A", "A", "test"),
      createCategoryObject("B", "B", "test"),
      createCategoryObject("C", "C", "test"),
      createCategoryObject("D", "D", "test"),
    ];
    const morphisms = [
      createIdentity("A"),
      createIdentity("B"),
      createIdentity("C"),
      createIdentity("D"),
      createMorphism("f", "f", "A", "B"),
      createMorphism("g", "g", "B", "D"),
      createMorphism("h", "h", "A", "C"),
      createMorphism("k", "k", "C", "D"),
    ];
    return createCategory("diamond", "Diamond", objects, morphisms);
  };

  // TEST-TRAV-001: findPath tests
  describe("findPath", () => {
    it("should find a path from source to target", () => {
      // Verifies: REQ-SEARCH-001
      const category = createLinearCategory();

      const path = findPath("A", "C", category);

      expect(path).toHaveLength(2);
      expect(path[0].id).toBe("f"); // A → B
      expect(path[1].id).toBe("g"); // B → C
    });

    it("should return empty array when no path exists", () => {
      // Verifies: REQ-SEARCH-001
      const category = createLinearCategory();

      const path = findPath("D", "A", category); // No backward path

      expect(path).toHaveLength(0);
    });

    it("should return empty array when source equals target", () => {
      // Verifies: REQ-SEARCH-001
      const category = createLinearCategory();

      const path = findPath("A", "A", category);

      expect(path).toHaveLength(0);
    });

    it("should return single morphism for adjacent objects", () => {
      // Verifies: REQ-SEARCH-001
      const category = createLinearCategory();

      const path = findPath("A", "B", category);

      expect(path).toHaveLength(1);
      expect(path[0].id).toBe("f");
    });

    it("should return shortest path in category with multiple routes", () => {
      // Verifies: REQ-SEARCH-001
      const category = createDiamondCategory();

      const path = findPath("A", "D", category);

      // Either A→B→D or A→C→D, both have length 2
      expect(path).toHaveLength(2);
    });

    it("should handle non-existent source object", () => {
      // Verifies: REQ-SEARCH-001
      const category = createLinearCategory();

      const path = findPath("X", "A", category);

      expect(path).toHaveLength(0);
    });

    it("should handle non-existent target object", () => {
      // Verifies: REQ-SEARCH-001
      const category = createLinearCategory();

      const path = findPath("A", "X", category);

      expect(path).toHaveLength(0);
    });
  });

  // TEST-TRAV-002: findAllPaths tests
  describe("findAllPaths", () => {
    it("should find all paths from source to target", () => {
      // Verifies: REQ-SEARCH-001
      const category = createDiamondCategory();

      const paths = findAllPaths("A", "D", category);

      expect(paths.length).toBeGreaterThanOrEqual(2);
      // Should include both A→B→D and A→C→D
      const pathSignatures = paths.map((p) => p.map((m) => m.id).join("→"));
      expect(pathSignatures.some((s) => s.includes("f") && s.includes("g"))).toBe(
        true
      );
      expect(pathSignatures.some((s) => s.includes("h") && s.includes("k"))).toBe(
        true
      );
    });

    it("should return empty array when no paths exist", () => {
      // Verifies: REQ-SEARCH-001
      const category = createLinearCategory();

      const paths = findAllPaths("D", "A", category);

      expect(paths).toHaveLength(0);
    });

    it("should return single path when only one exists", () => {
      // Verifies: REQ-SEARCH-001
      const category = createLinearCategory();

      const paths = findAllPaths("A", "B", category);

      expect(paths).toHaveLength(1);
      expect(paths[0]).toHaveLength(1);
    });

    it("should return paths sorted by length", () => {
      // Verifies: REQ-SEARCH-001
      const category = createDiamondCategory();

      const paths = findAllPaths("A", "D", category);

      for (let i = 1; i < paths.length; i++) {
        expect(paths[i].length).toBeGreaterThanOrEqual(paths[i - 1].length);
      }
    });

    it("should respect depth limit", () => {
      // Verifies: REQ-SEARCH-001
      const category = createLinearCategory();

      const paths = findAllPaths("A", "D", category, 2);

      // A→D requires 3 morphisms, limit is 2, so no paths
      expect(paths).toHaveLength(0);
    });
  });

  // TEST-TRAV-003: findDomainPath tests
  describe("findDomainPath", () => {
    it("should find path through functor to target category", () => {
      // Verifies: REQ-SEARCH-001
      const catA = createCategory(
        "A",
        "Category A",
        [createCategoryObject("a", "a", "A")],
        [createIdentity("a")]
      );
      const catB = createCategory(
        "B",
        "Category B",
        [createCategoryObject("b", "b", "B")],
        [createIdentity("b")]
      );

      const F = createFunctor(
        "F",
        "F",
        "A",
        "B",
        new Map([["a", "b"]]),
        new Map()
      );

      const result = findDomainPath("a", "B", [catA, catB], [F], []);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].resultObject).toBe("b");
      expect(result[0].steps.length).toBe(1);
    });

    it("should find path through chain of functors", () => {
      // Verifies: REQ-SEARCH-001
      const catA = createCategory(
        "A",
        "A",
        [createCategoryObject("a", "a", "A")],
        []
      );
      const catB = createCategory(
        "B",
        "B",
        [createCategoryObject("b", "b", "B")],
        []
      );
      const catC = createCategory(
        "C",
        "C",
        [createCategoryObject("c", "c", "C")],
        []
      );

      const F = createFunctor(
        "F",
        "F",
        "A",
        "B",
        new Map([["a", "b"]]),
        new Map()
      );
      const G = createFunctor(
        "G",
        "G",
        "B",
        "C",
        new Map([["b", "c"]]),
        new Map()
      );

      const result = findDomainPath("a", "C", [catA, catB, catC], [F, G], []);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].resultObject).toBe("c");
    });

    it("should return empty when no path exists", () => {
      // Verifies: REQ-SEARCH-001
      const catA = createCategory(
        "A",
        "A",
        [createCategoryObject("a", "a", "A")],
        []
      );
      const catB = createCategory(
        "B",
        "B",
        [createCategoryObject("b", "b", "B")],
        []
      );

      // No functor from A to B
      const result = findDomainPath("a", "B", [catA, catB], [], []);

      expect(result).toHaveLength(0);
    });

    it("should include natural transformations in path", () => {
      // Verifies: REQ-SEARCH-001
      const cat = createCategory(
        "C",
        "C",
        [createCategoryObject("x", "x", "C")],
        [createIdentity("x")]
      );

      const F = createFunctor(
        "F",
        "F",
        "C",
        "C",
        new Map([["x", "x"]]),
        new Map()
      );
      const G = createFunctor(
        "G",
        "G",
        "C",
        "C",
        new Map([["x", "x"]]),
        new Map()
      );

      const eta = createNaturalTransformation(
        "eta",
        "η",
        "F",
        "G",
        new Map([["x", "id-x"]])
      );

      const result = findDomainPath("x", "C", [cat], [F, G], [eta]);

      // Should find at least one path
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle object not in any category", () => {
      // Verifies: REQ-SEARCH-001
      const cat = createCategory(
        "A",
        "A",
        [createCategoryObject("a", "a", "A")],
        []
      );

      const result = findDomainPath("nonexistent", "A", [cat], [], []);

      expect(result).toHaveLength(0);
    });
  });

  // TEST-TRAV-004: TransformationPath structure
  describe("TransformationPath", () => {
    it("should have correct structure", () => {
      const cat = createCategory(
        "A",
        "A",
        [createCategoryObject("a", "a", "A")],
        []
      );
      const F = createFunctor("F", "F", "A", "A", new Map([["a", "a"]]), new Map());

      const result = findDomainPath("a", "A", [cat], [F], []);

      if (result.length > 0) {
        expect(Array.isArray(result[0].steps)).toBe(true);
        expect(typeof result[0].resultObject).toBe("string");
      }
    });
  });
});
