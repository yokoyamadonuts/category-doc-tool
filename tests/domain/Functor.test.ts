/**
 * Functor Entity Tests
 * Verifies: REQ-CAT-003
 */
import { describe, expect, it } from "bun:test";
import {
  type Functor,
  createFunctor,
  getId,
  getName,
  getSourceCategory,
  getTargetCategory,
  mapObject,
  mapMorphism,
  getObjectMapping,
  getMorphismMapping,
} from "../../src/domain/entities/Functor";

describe("Functor Entity", () => {
  // Helper to create test object mapping
  const createObjectMappingData = () =>
    new Map([
      ["obj-A1", "obj-B1"],
      ["obj-A2", "obj-B2"],
      ["obj-A3", "obj-B3"],
    ]);

  // Helper to create test morphism mapping
  const createMorphismMappingData = () =>
    new Map([
      ["morph-A1", "morph-B1"],
      ["morph-A2", "morph-B2"],
    ]);

  // TEST-FUNC-001: createFunctor creates functor with all properties
  describe("createFunctor", () => {
    it("should create a functor with all required properties", () => {
      // Verifies: REQ-CAT-003
      const objectMapping = createObjectMappingData();
      const morphismMapping = createMorphismMappingData();

      const functor = createFunctor(
        "func-001",
        "F",
        "category-A",
        "category-B",
        objectMapping,
        morphismMapping
      );

      expect(getId(functor)).toBe("func-001");
      expect(getName(functor)).toBe("F");
      expect(getSourceCategory(functor)).toBe("category-A");
      expect(getTargetCategory(functor)).toBe("category-B");
    });

    it("should create a functor with empty mappings", () => {
      // Verifies: REQ-CAT-003
      const functor = createFunctor(
        "func-002",
        "Empty",
        "cat-A",
        "cat-B",
        new Map(),
        new Map()
      );

      expect(mapObject(functor, "any")).toBeUndefined();
      expect(mapMorphism(functor, "any")).toBeUndefined();
    });
  });

  // TEST-FUNC-002: Validation tests
  describe("validation", () => {
    it("should throw error when id is empty", () => {
      // Verifies: REQ-CAT-003
      expect(() => {
        createFunctor("", "F", "A", "B", new Map(), new Map());
      }).toThrow("id must be a non-empty string");
    });

    it("should throw error when name is empty", () => {
      // Verifies: REQ-CAT-003
      expect(() => {
        createFunctor("func-001", "", "A", "B", new Map(), new Map());
      }).toThrow("name must be a non-empty string");
    });

    it("should throw error when sourceCategory is empty", () => {
      // Verifies: REQ-CAT-003
      expect(() => {
        createFunctor("func-001", "F", "", "B", new Map(), new Map());
      }).toThrow("sourceCategory must be a non-empty string");
    });

    it("should throw error when targetCategory is empty", () => {
      // Verifies: REQ-CAT-003
      expect(() => {
        createFunctor("func-001", "F", "A", "", new Map(), new Map());
      }).toThrow("targetCategory must be a non-empty string");
    });
  });

  // TEST-FUNC-003: Mapping tests
  describe("mapObject", () => {
    it("should return mapped object id when mapping exists", () => {
      // Verifies: REQ-CAT-003
      const objectMapping = createObjectMappingData();
      const functor = createFunctor(
        "func-001",
        "F",
        "A",
        "B",
        objectMapping,
        new Map()
      );

      expect(mapObject(functor, "obj-A1")).toBe("obj-B1");
      expect(mapObject(functor, "obj-A2")).toBe("obj-B2");
    });

    it("should return undefined when object mapping does not exist", () => {
      // Verifies: REQ-CAT-003
      const functor = createFunctor(
        "func-001",
        "F",
        "A",
        "B",
        createObjectMappingData(),
        new Map()
      );

      expect(mapObject(functor, "non-existent")).toBeUndefined();
    });
  });

  describe("mapMorphism", () => {
    it("should return mapped morphism id when mapping exists", () => {
      // Verifies: REQ-CAT-003
      const morphismMapping = createMorphismMappingData();
      const functor = createFunctor(
        "func-001",
        "F",
        "A",
        "B",
        new Map(),
        morphismMapping
      );

      expect(mapMorphism(functor, "morph-A1")).toBe("morph-B1");
      expect(mapMorphism(functor, "morph-A2")).toBe("morph-B2");
    });

    it("should return undefined when morphism mapping does not exist", () => {
      // Verifies: REQ-CAT-003
      const functor = createFunctor(
        "func-001",
        "F",
        "A",
        "B",
        new Map(),
        createMorphismMappingData()
      );

      expect(mapMorphism(functor, "non-existent")).toBeUndefined();
    });
  });

  // TEST-FUNC-004: Factory method tests (backward compatibility)
  describe("Functor.create", () => {
    it("should create functor with all parameters", () => {
      // Verifies: REQ-CAT-003
      const { Functor } = require("../../src/domain/entities/Functor");
      const objectMapping = createObjectMappingData();
      const morphismMapping = createMorphismMappingData();

      const functor = Functor.create(
        "func-003",
        "G",
        "cat-X",
        "cat-Y",
        objectMapping,
        morphismMapping
      );

      expect(getId(functor)).toBe("func-003");
      expect(getName(functor)).toBe("G");
      expect(getSourceCategory(functor)).toBe("cat-X");
      expect(getTargetCategory(functor)).toBe("cat-Y");
      expect(mapObject(functor, "obj-A1")).toBe("obj-B1");
    });
  });

  // TEST-FUNC-005: Immutability tests
  describe("immutability", () => {
    it("should not allow modification of object mapping after creation", () => {
      // Verifies: REQ-CAT-003
      const objectMapping = createObjectMappingData();
      const functor = createFunctor(
        "func-001",
        "F",
        "A",
        "B",
        objectMapping,
        new Map()
      );

      // Modify original map
      objectMapping.set("obj-A1", "modified");
      objectMapping.set("new-obj", "new-target");

      expect(mapObject(functor, "obj-A1")).toBe("obj-B1");
      expect(mapObject(functor, "new-obj")).toBeUndefined();
    });

    it("should not allow modification of morphism mapping after creation", () => {
      // Verifies: REQ-CAT-003
      const morphismMapping = createMorphismMappingData();
      const functor = createFunctor(
        "func-001",
        "F",
        "A",
        "B",
        new Map(),
        morphismMapping
      );

      // Modify original map
      morphismMapping.set("morph-A1", "modified");
      morphismMapping.set("new-morph", "new-target");

      expect(mapMorphism(functor, "morph-A1")).toBe("morph-B1");
      expect(mapMorphism(functor, "new-morph")).toBeUndefined();
    });
  });

  // TEST-FUNC-006: Get all mappings
  describe("getObjectMapping and getMorphismMapping", () => {
    it("should return a copy of object mapping", () => {
      // Verifies: REQ-CAT-003
      const objectMapping = createObjectMappingData();
      const functor = createFunctor(
        "func-001",
        "F",
        "A",
        "B",
        objectMapping,
        new Map()
      );

      const retrieved = getObjectMapping(functor);
      retrieved.set("obj-A1", "modified");

      expect(mapObject(functor, "obj-A1")).toBe("obj-B1");
    });

    it("should return a copy of morphism mapping", () => {
      // Verifies: REQ-CAT-003
      const morphismMapping = createMorphismMappingData();
      const functor = createFunctor(
        "func-001",
        "F",
        "A",
        "B",
        new Map(),
        morphismMapping
      );

      const retrieved = getMorphismMapping(functor);
      retrieved.set("morph-A1", "modified");

      expect(mapMorphism(functor, "morph-A1")).toBe("morph-B1");
    });
  });

  // TEST-FUNC-007: Direct property access
  describe("direct property access", () => {
    it("should allow direct property access on the immutable object", () => {
      const functor = createFunctor(
        "func-direct",
        "Direct",
        "A",
        "B",
        createObjectMappingData(),
        createMorphismMappingData()
      );

      expect(functor.id).toBe("func-direct");
      expect(functor.name).toBe("Direct");
      expect(functor.sourceCategory).toBe("A");
      expect(functor.targetCategory).toBe("B");
    });
  });
});
