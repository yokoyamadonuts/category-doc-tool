/**
 * CLI Search Command Tests
 * Verifies: REQ-DOC-002, REQ-SEARCH-001
 */
import { describe, expect, it } from "bun:test";
import {
  searchObjects,
  searchByFunctor,
  searchByNaturalTransformation,
} from "../../../src/application/cli/search";
import { createCategoryObject } from "../../../src/domain/entities/Object";
import { createFunctor } from "../../../src/domain/entities/Functor";
import { createNaturalTransformation } from "../../../src/domain/entities/NaturalTransformation";

describe("CLI Search Command", () => {
  // TEST-SEARCH-001: Search objects by keyword
  describe("searchObjects", () => {
    const testObjects = [
      createCategoryObject("obj-1", "Introduction to Categories", "math", {
        author: "Alice",
      }),
      createCategoryObject("obj-2", "Functors and Mappings", "math", {
        author: "Bob",
      }),
      createCategoryObject("obj-3", "Natural Transformations", "math", {
        author: "Alice",
      }),
      createCategoryObject("obj-4", "Programming Basics", "programming", {
        author: "Charlie",
      }),
    ];

    it("should search by title keyword", () => {
      const result = searchObjects(testObjects, { query: "Categories" });

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].id).toBe("obj-1");
    });

    it("should search case-insensitively", () => {
      const result = searchObjects(testObjects, { query: "functors" });

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].id).toBe("obj-2");
    });

    it("should return multiple matches", () => {
      const result = searchObjects(testObjects, { query: "math" });

      expect(result.matches.length).toBeGreaterThan(1);
    });

    it("should filter by domain", () => {
      const result = searchObjects(testObjects, {
        query: "",
        domain: "programming",
      });

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].domain).toBe("programming");
    });

    it("should return empty for no matches", () => {
      const result = searchObjects(testObjects, { query: "xyz123" });

      expect(result.matches).toHaveLength(0);
    });

    it("should search by id", () => {
      const result = searchObjects(testObjects, { query: "obj-3" });

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].id).toBe("obj-3");
    });

    it("should include match count in result", () => {
      const result = searchObjects(testObjects, { query: "math" });

      expect(result.totalMatches).toBe(result.matches.length);
    });
  });

  // TEST-SEARCH-002: Search by functor mapping
  describe("searchByFunctor", () => {
    const functor = createFunctor(
      "F",
      "Functor F",
      "source",
      "target",
      new Map([
        ["A", "X"],
        ["B", "Y"],
        ["C", "Z"],
      ]),
      new Map([
        ["f", "g"],
        ["h", "i"],
      ])
    );

    it("should find object mapping by source object", () => {
      const result = searchByFunctor(functor, "A");

      expect(result.found).toBe(true);
      expect(result.mappedTo).toBe("X");
      expect(result.type).toBe("object");
    });

    it("should find morphism mapping", () => {
      const result = searchByFunctor(functor, "f");

      expect(result.found).toBe(true);
      expect(result.mappedTo).toBe("g");
      expect(result.type).toBe("morphism");
    });

    it("should return not found for unknown id", () => {
      const result = searchByFunctor(functor, "unknown");

      expect(result.found).toBe(false);
      expect(result.mappedTo).toBeUndefined();
    });

    it("should prefer object mapping over morphism", () => {
      const ambiguousFunctor = createFunctor(
        "F",
        "F",
        "s",
        "t",
        new Map([["x", "obj-mapped"]]),
        new Map([["x", "morph-mapped"]])
      );

      const result = searchByFunctor(ambiguousFunctor, "x");

      expect(result.found).toBe(true);
      expect(result.mappedTo).toBe("obj-mapped");
      expect(result.type).toBe("object");
    });
  });

  // TEST-SEARCH-003: Search by natural transformation
  describe("searchByNaturalTransformation", () => {
    const natTrans = createNaturalTransformation(
      "eta",
      "η",
      "F",
      "G",
      new Map([
        ["A", "morph-A"],
        ["B", "morph-B"],
      ])
    );

    it("should find component by object", () => {
      const result = searchByNaturalTransformation(natTrans, "A");

      expect(result.found).toBe(true);
      expect(result.component).toBe("morph-A");
    });

    it("should return not found for unknown object", () => {
      const result = searchByNaturalTransformation(natTrans, "C");

      expect(result.found).toBe(false);
    });

    it("should include source and target functors", () => {
      const result = searchByNaturalTransformation(natTrans, "A");

      expect(result.sourceFunctor).toBe("F");
      expect(result.targetFunctor).toBe("G");
    });
  });

  // TEST-SEARCH-004: Search result formatting
  describe("result formatting", () => {
    it("should include search query in result", () => {
      const result = searchObjects([], { query: "test query" });

      expect(result.query).toBe("test query");
    });

    it("should include search time", () => {
      const result = searchObjects([], { query: "test" });

      expect(result.searchTime).toBeDefined();
      expect(typeof result.searchTime).toBe("number");
    });
  });
});
