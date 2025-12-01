/**
 * CLI List Command Tests
 * Verifies: REQ-DOC-002
 */
import { describe, expect, it } from "bun:test";
import {
  listObjects,
  listMorphisms,
  listCategories,
} from "../../../src/application/cli/list";
import { createCategory } from "../../../src/domain/entities/Category";
import { createCategoryObject } from "../../../src/domain/entities/Object";
import { createMorphism } from "../../../src/domain/entities/Morphism";

describe("CLI List Command", () => {
  // TEST-LIST-001: List objects
  describe("listObjects", () => {
    const testObjects = [
      createCategoryObject("obj-1", "First Object", "domain-a"),
      createCategoryObject("obj-2", "Second Object", "domain-a"),
      createCategoryObject("obj-3", "Third Object", "domain-b"),
    ];

    it("should list all objects", () => {
      const result = listObjects(testObjects);

      expect(result.items).toHaveLength(3);
      expect(result.totalCount).toBe(3);
    });

    it("should filter by domain", () => {
      const result = listObjects(testObjects, { domain: "domain-a" });

      expect(result.items).toHaveLength(2);
      expect(result.items.every((obj) => obj.domain === "domain-a")).toBe(true);
    });

    it("should format as table", () => {
      const result = listObjects(testObjects, { format: "table" });

      expect(result.format).toBe("table");
      expect(result.items).toHaveLength(3);
    });

    it("should format as json", () => {
      const result = listObjects(testObjects, { format: "json" });

      expect(result.format).toBe("json");
    });

    it("should handle empty list", () => {
      const result = listObjects([]);

      expect(result.items).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it("should apply limit", () => {
      const result = listObjects(testObjects, { limit: 2 });

      expect(result.items).toHaveLength(2);
      expect(result.totalCount).toBe(3);
    });

    it("should apply offset", () => {
      const result = listObjects(testObjects, { offset: 1 });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBe("obj-2");
    });
  });

  // TEST-LIST-002: List morphisms
  describe("listMorphisms", () => {
    const testMorphisms = [
      createMorphism("m-1", "f", "A", "B"),
      createMorphism("m-2", "g", "B", "C"),
      createMorphism("m-3", "h", "A", "C"),
    ];

    it("should list all morphisms", () => {
      const result = listMorphisms(testMorphisms);

      expect(result.items).toHaveLength(3);
    });

    it("should filter by source", () => {
      const result = listMorphisms(testMorphisms, { source: "A" });

      expect(result.items).toHaveLength(2);
      expect(result.items.every((m) => m.source === "A")).toBe(true);
    });

    it("should filter by target", () => {
      const result = listMorphisms(testMorphisms, { target: "C" });

      expect(result.items).toHaveLength(2);
      expect(result.items.every((m) => m.target === "C")).toBe(true);
    });

    it("should filter by source and target", () => {
      const result = listMorphisms(testMorphisms, { source: "A", target: "C" });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe("m-3");
    });
  });

  // TEST-LIST-003: List categories
  describe("listCategories", () => {
    const testCategories = [
      createCategory("cat-1", "Category One", [], []),
      createCategory(
        "cat-2",
        "Category Two",
        [createCategoryObject("obj", "Obj", "test")],
        []
      ),
    ];

    it("should list all categories", () => {
      const result = listCategories(testCategories);

      expect(result.items).toHaveLength(2);
    });

    it("should include object and morphism counts", () => {
      const result = listCategories(testCategories);

      expect(result.items[0].objectCount).toBe(0);
      expect(result.items[1].objectCount).toBe(1);
    });
  });
});
