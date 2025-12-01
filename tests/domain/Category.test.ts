/**
 * Category Entity Tests
 * Verifies: REQ-CAT-001, REQ-CAT-003
 */
import { describe, expect, it } from "bun:test";
import {
  createCategory,
  getId,
  getName,
  getObjects,
  getMorphisms,
  getObject,
  getMorphism,
  getMorphismsBySource,
  getMorphismsByTarget,
} from "../../src/domain/entities/Category";
import { createCategoryObject } from "../../src/domain/entities/Object";
import { createMorphism } from "../../src/domain/entities/Morphism";

describe("Category Entity", () => {
  // Helper to create test objects
  const createTestObjects = () => [
    createCategoryObject("obj-001", "Object A", "test-domain"),
    createCategoryObject("obj-002", "Object B", "test-domain"),
    createCategoryObject("obj-003", "Object C", "test-domain"),
  ];

  // Helper to create test morphisms
  const createTestMorphisms = () => [
    createMorphism("morph-001", "f", "obj-001", "obj-002"),
    createMorphism("morph-002", "g", "obj-002", "obj-003"),
  ];

  // TEST-CAT-001: createCategory creates category with all properties
  describe("createCategory", () => {
    it("should create a category with all required properties", () => {
      // Verifies: REQ-CAT-001
      const objects = createTestObjects();
      const morphisms = createTestMorphisms();

      const category = createCategory(
        "cat-001",
        "Test Category",
        objects,
        morphisms
      );

      expect(getId(category)).toBe("cat-001");
      expect(getName(category)).toBe("Test Category");
      expect(getObjects(category)).toHaveLength(3);
      expect(getMorphisms(category)).toHaveLength(2);
    });

    it("should create a category with empty objects and morphisms", () => {
      // Verifies: REQ-CAT-001
      const category = createCategory("cat-002", "Empty Category", [], []);

      expect(getObjects(category)).toHaveLength(0);
      expect(getMorphisms(category)).toHaveLength(0);
    });
  });

  // TEST-CAT-002: Validation tests
  describe("validation", () => {
    it("should throw error when id is empty", () => {
      // Verifies: REQ-CAT-001
      expect(() => {
        createCategory("", "Name", [], []);
      }).toThrow("id must be a non-empty string");
    });

    it("should throw error when name is empty", () => {
      // Verifies: REQ-CAT-001
      expect(() => {
        createCategory("cat-001", "", [], []);
      }).toThrow("name must be a non-empty string");
    });
  });

  // TEST-CAT-003: Object lookup tests
  describe("getObject", () => {
    it("should return object by id when it exists", () => {
      // Verifies: REQ-CAT-003
      const objects = createTestObjects();
      const category = createCategory("cat-001", "Test", objects, []);

      const found = getObject(category, "obj-002");

      expect(found).toBeDefined();
      expect(found!.id).toBe("obj-002");
      expect(found!.title).toBe("Object B");
    });

    it("should return undefined when object does not exist", () => {
      // Verifies: REQ-CAT-003
      const category = createCategory("cat-001", "Test", createTestObjects(), []);

      const found = getObject(category, "non-existent");

      expect(found).toBeUndefined();
    });
  });

  // TEST-CAT-004: Morphism lookup tests
  describe("getMorphism", () => {
    it("should return morphism by id when it exists", () => {
      // Verifies: REQ-CAT-003
      const morphisms = createTestMorphisms();
      const category = createCategory("cat-001", "Test", [], morphisms);

      const found = getMorphism(category, "morph-001");

      expect(found).toBeDefined();
      expect(found!.id).toBe("morph-001");
      expect(found!.name).toBe("f");
    });

    it("should return undefined when morphism does not exist", () => {
      // Verifies: REQ-CAT-003
      const category = createCategory(
        "cat-001",
        "Test",
        [],
        createTestMorphisms()
      );

      const found = getMorphism(category, "non-existent");

      expect(found).toBeUndefined();
    });
  });

  // TEST-CAT-005: Morphism lookup by source/target
  describe("getMorphismsBySource", () => {
    it("should return all morphisms with given source", () => {
      // Verifies: REQ-CAT-003
      const morphisms = [
        createMorphism("m1", "f1", "A", "B"),
        createMorphism("m2", "f2", "A", "C"),
        createMorphism("m3", "g", "B", "C"),
      ];
      const category = createCategory("cat-001", "Test", [], morphisms);

      const found = getMorphismsBySource(category, "A");

      expect(found).toHaveLength(2);
      expect(found.map((m) => m.id)).toContain("m1");
      expect(found.map((m) => m.id)).toContain("m2");
    });

    it("should return empty array when no morphisms have given source", () => {
      // Verifies: REQ-CAT-003
      const category = createCategory(
        "cat-001",
        "Test",
        [],
        createTestMorphisms()
      );

      const found = getMorphismsBySource(category, "non-existent");

      expect(found).toHaveLength(0);
    });
  });

  describe("getMorphismsByTarget", () => {
    it("should return all morphisms with given target", () => {
      // Verifies: REQ-CAT-003
      const morphisms = [
        createMorphism("m1", "f1", "A", "C"),
        createMorphism("m2", "f2", "B", "C"),
        createMorphism("m3", "g", "A", "B"),
      ];
      const category = createCategory("cat-001", "Test", [], morphisms);

      const found = getMorphismsByTarget(category, "C");

      expect(found).toHaveLength(2);
      expect(found.map((m) => m.id)).toContain("m1");
      expect(found.map((m) => m.id)).toContain("m2");
    });

    it("should return empty array when no morphisms have given target", () => {
      // Verifies: REQ-CAT-003
      const category = createCategory(
        "cat-001",
        "Test",
        [],
        createTestMorphisms()
      );

      const found = getMorphismsByTarget(category, "non-existent");

      expect(found).toHaveLength(0);
    });
  });

  // TEST-CAT-006: Factory method tests (backward compatibility)
  describe("Category.create", () => {
    it("should create category with all parameters", () => {
      // Verifies: REQ-CAT-001
      const { Category } = require("../../src/domain/entities/Category");
      const objects = createTestObjects();
      const morphisms = createTestMorphisms();

      const category = Category.create("cat-003", "Factory", objects, morphisms);

      expect(getId(category)).toBe("cat-003");
      expect(getName(category)).toBe("Factory");
      expect(getObjects(category)).toHaveLength(3);
      expect(getMorphisms(category)).toHaveLength(2);
    });

    it("should create category with default empty arrays when not provided", () => {
      // Verifies: REQ-CAT-001
      const { Category } = require("../../src/domain/entities/Category");
      const category = Category.create("cat-004", "Minimal");

      expect(getObjects(category)).toHaveLength(0);
      expect(getMorphisms(category)).toHaveLength(0);
    });
  });

  // TEST-CAT-007: Immutability tests
  describe("immutability", () => {
    it("should return a copy of objects array to prevent mutation", () => {
      // Verifies: REQ-CAT-001
      const objects = createTestObjects();
      const category = createCategory("cat-001", "Test", objects, []);

      const retrieved = getObjects(category);
      retrieved.push(createCategoryObject("new", "New", "domain"));

      expect(getObjects(category)).toHaveLength(3);
    });

    it("should return a copy of morphisms array to prevent mutation", () => {
      // Verifies: REQ-CAT-001
      const morphisms = createTestMorphisms();
      const category = createCategory("cat-001", "Test", [], morphisms);

      const retrieved = getMorphisms(category);
      retrieved.push(createMorphism("new", "new", "a", "b"));

      expect(getMorphisms(category)).toHaveLength(2);
    });

    it("should not allow modification of original arrays after creation", () => {
      // Verifies: REQ-CAT-001
      const objects = createTestObjects();
      const morphisms = createTestMorphisms();
      const category = createCategory("cat-001", "Test", objects, morphisms);

      // Original arrays are mutable, but category should have copies
      (objects as any[]).push(createCategoryObject("new", "New", "domain"));
      (morphisms as any[]).push(createMorphism("new", "new", "a", "b"));

      expect(getObjects(category)).toHaveLength(3);
      expect(getMorphisms(category)).toHaveLength(2);
    });
  });

  // TEST-CAT-008: Direct property access
  describe("direct property access", () => {
    it("should allow direct property access on the immutable object", () => {
      const category = createCategory(
        "cat-direct",
        "Direct Access",
        createTestObjects(),
        createTestMorphisms()
      );

      expect(category.id).toBe("cat-direct");
      expect(category.name).toBe("Direct Access");
      expect(category.objects.length).toBe(3);
      expect(category.morphisms.length).toBe(2);
    });
  });
});
