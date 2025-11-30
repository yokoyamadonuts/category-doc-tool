/**
 * CLI Show Command Tests
 * Verifies: REQ-DOC-002
 */
import { describe, expect, it } from "bun:test";
import {
  showObject,
  showCategory,
  showFunctor,
  type ShowResult,
} from "../../../src/application/cli/show";
import { createCategory } from "../../../src/domain/entities/Category";
import { createCategoryObject } from "../../../src/domain/entities/Object";
import { createMorphism } from "../../../src/domain/entities/Morphism";
import { createFunctor } from "../../../src/domain/entities/Functor";

describe("CLI Show Command", () => {
  // TEST-SHOW-001: Show object details
  describe("showObject", () => {
    const testObject = createCategoryObject(
      "obj-1",
      "Test Object",
      "test-domain",
      { author: "Test Author", tags: ["tag1", "tag2"] },
      "This is the content of the test object."
    );

    const testMorphisms = [
      createMorphism("m-1", "f", "obj-1", "obj-2"),
      createMorphism("m-2", "g", "obj-0", "obj-1"),
      createMorphism("m-3", "h", "obj-x", "obj-y"),
    ];

    it("should show object details", () => {
      const result = showObject(testObject, testMorphisms);

      expect(result.found).toBe(true);
      expect(result.object).toBeDefined();
      expect(result.object!.id).toBe("obj-1");
      expect(result.object!.title).toBe("Test Object");
      expect(result.object!.domain).toBe("test-domain");
    });

    it("should include metadata", () => {
      const result = showObject(testObject, testMorphisms);

      expect(result.object!.metadata?.author).toBe("Test Author");
      expect(result.object!.metadata?.tags).toEqual(["tag1", "tag2"]);
    });

    it("should include content preview", () => {
      const result = showObject(testObject, testMorphisms);

      expect(result.object!.content).toBe(
        "This is the content of the test object."
      );
    });

    it("should show outgoing morphisms", () => {
      const result = showObject(testObject, testMorphisms);

      expect(result.outgoingMorphisms).toHaveLength(1);
      expect(result.outgoingMorphisms![0].id).toBe("m-1");
    });

    it("should show incoming morphisms", () => {
      const result = showObject(testObject, testMorphisms);

      expect(result.incomingMorphisms).toHaveLength(1);
      expect(result.incomingMorphisms![0].id).toBe("m-2");
    });

    it("should handle object without morphisms", () => {
      const result = showObject(testObject, []);

      expect(result.found).toBe(true);
      expect(result.outgoingMorphisms).toHaveLength(0);
      expect(result.incomingMorphisms).toHaveLength(0);
    });
  });

  // TEST-SHOW-002: Show category details
  describe("showCategory", () => {
    const testCategory = createCategory(
      "cat-1",
      "Test Category",
      [
        createCategoryObject("A", "Object A", "test"),
        createCategoryObject("B", "Object B", "test"),
      ],
      [
        createMorphism("f", "f", "A", "B"),
        createMorphism("id-A", "id_A", "A", "A"),
      ]
    );

    it("should show category details", () => {
      const result = showCategory(testCategory);

      expect(result.found).toBe(true);
      expect(result.category).toBeDefined();
      expect(result.category!.id).toBe("cat-1");
      expect(result.category!.name).toBe("Test Category");
    });

    it("should include object count", () => {
      const result = showCategory(testCategory);

      expect(result.objectCount).toBe(2);
    });

    it("should include morphism count", () => {
      const result = showCategory(testCategory);

      expect(result.morphismCount).toBe(2);
    });

    it("should list objects", () => {
      const result = showCategory(testCategory);

      expect(result.objects).toHaveLength(2);
      expect(result.objects![0].id).toBe("A");
    });

    it("should list morphisms", () => {
      const result = showCategory(testCategory);

      expect(result.morphisms).toHaveLength(2);
    });
  });

  // TEST-SHOW-003: Show functor details
  describe("showFunctor", () => {
    const testFunctor = createFunctor(
      "F",
      "Test Functor",
      "source-cat",
      "target-cat",
      new Map([
        ["A", "X"],
        ["B", "Y"],
      ]),
      new Map([["f", "g"]])
    );

    it("should show functor details", () => {
      const result = showFunctor(testFunctor);

      expect(result.found).toBe(true);
      expect(result.functor).toBeDefined();
      expect(result.functor!.id).toBe("F");
      expect(result.functor!.name).toBe("Test Functor");
    });

    it("should show source and target categories", () => {
      const result = showFunctor(testFunctor);

      expect(result.functor!.sourceCategory).toBe("source-cat");
      expect(result.functor!.targetCategory).toBe("target-cat");
    });

    it("should show object mappings", () => {
      const result = showFunctor(testFunctor);

      expect(result.objectMappings).toHaveLength(2);
      expect(result.objectMappings).toContainEqual({
        source: "A",
        target: "X",
      });
    });

    it("should show morphism mappings", () => {
      const result = showFunctor(testFunctor);

      expect(result.morphismMappings).toHaveLength(1);
      expect(result.morphismMappings).toContainEqual({
        source: "f",
        target: "g",
      });
    });
  });

  // TEST-SHOW-004: Not found handling
  describe("not found handling", () => {
    it("should handle null object", () => {
      const result = showObject(null as any, []);

      expect(result.found).toBe(false);
    });

    it("should handle null category", () => {
      const result = showCategory(null as any);

      expect(result.found).toBe(false);
    });

    it("should handle null functor", () => {
      const result = showFunctor(null as any);

      expect(result.found).toBe(false);
    });
  });
});
