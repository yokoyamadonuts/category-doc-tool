/**
 * NaturalTransformation Entity Tests
 * Verifies: REQ-CAT-004
 */
import { describe, expect, it } from "bun:test";
import {
  type NaturalTransformation,
  createNaturalTransformation,
  getId,
  getName,
  getSourceFunctor,
  getTargetFunctor,
  getComponent,
  getAllComponents,
} from "../../src/domain/entities/NaturalTransformation";

describe("NaturalTransformation Entity", () => {
  // Helper to create test components (object id -> morphism id)
  const createComponents = () =>
    new Map([
      ["obj-A", "morph-eta-A"],
      ["obj-B", "morph-eta-B"],
      ["obj-C", "morph-eta-C"],
    ]);

  // TEST-NAT-001: createNaturalTransformation creates natural transformation with all properties
  describe("createNaturalTransformation", () => {
    it("should create a natural transformation with all required properties", () => {
      // Verifies: REQ-CAT-004
      const components = createComponents();

      const natTrans = createNaturalTransformation(
        "nat-001",
        "eta",
        "functor-F",
        "functor-G",
        components
      );

      expect(getId(natTrans)).toBe("nat-001");
      expect(getName(natTrans)).toBe("eta");
      expect(getSourceFunctor(natTrans)).toBe("functor-F");
      expect(getTargetFunctor(natTrans)).toBe("functor-G");
    });

    it("should create a natural transformation with empty components", () => {
      // Verifies: REQ-CAT-004
      const natTrans = createNaturalTransformation(
        "nat-002",
        "empty",
        "F",
        "G",
        new Map()
      );

      expect(getComponent(natTrans, "any")).toBeUndefined();
    });
  });

  // TEST-NAT-002: Validation tests
  describe("validation", () => {
    it("should throw error when id is empty", () => {
      // Verifies: REQ-CAT-004
      expect(() => {
        createNaturalTransformation("", "eta", "F", "G", new Map());
      }).toThrow("id must be a non-empty string");
    });

    it("should throw error when name is empty", () => {
      // Verifies: REQ-CAT-004
      expect(() => {
        createNaturalTransformation("nat-001", "", "F", "G", new Map());
      }).toThrow("name must be a non-empty string");
    });

    it("should throw error when sourceFunctor is empty", () => {
      // Verifies: REQ-CAT-004
      expect(() => {
        createNaturalTransformation("nat-001", "eta", "", "G", new Map());
      }).toThrow("sourceFunctor must be a non-empty string");
    });

    it("should throw error when targetFunctor is empty", () => {
      // Verifies: REQ-CAT-004
      expect(() => {
        createNaturalTransformation("nat-001", "eta", "F", "", new Map());
      }).toThrow("targetFunctor must be a non-empty string");
    });
  });

  // TEST-NAT-003: Component access tests
  describe("getComponent", () => {
    it("should return component morphism id when it exists", () => {
      // Verifies: REQ-CAT-004
      const components = createComponents();
      const natTrans = createNaturalTransformation(
        "nat-001",
        "eta",
        "F",
        "G",
        components
      );

      expect(getComponent(natTrans, "obj-A")).toBe("morph-eta-A");
      expect(getComponent(natTrans, "obj-B")).toBe("morph-eta-B");
    });

    it("should return undefined when component does not exist", () => {
      // Verifies: REQ-CAT-004
      const natTrans = createNaturalTransformation(
        "nat-001",
        "eta",
        "F",
        "G",
        createComponents()
      );

      expect(getComponent(natTrans, "non-existent")).toBeUndefined();
    });
  });

  // TEST-NAT-004: Get all components
  describe("getAllComponents", () => {
    it("should return a copy of all components", () => {
      // Verifies: REQ-CAT-004
      const components = createComponents();
      const natTrans = createNaturalTransformation(
        "nat-001",
        "eta",
        "F",
        "G",
        components
      );

      const allComponents = getAllComponents(natTrans);

      expect(allComponents.size).toBe(3);
      expect(allComponents.get("obj-A")).toBe("morph-eta-A");
      expect(allComponents.get("obj-B")).toBe("morph-eta-B");
      expect(allComponents.get("obj-C")).toBe("morph-eta-C");
    });

    it("should return empty map when no components exist", () => {
      // Verifies: REQ-CAT-004
      const natTrans = createNaturalTransformation(
        "nat-001",
        "eta",
        "F",
        "G",
        new Map()
      );

      expect(getAllComponents(natTrans).size).toBe(0);
    });
  });

  // TEST-NAT-005: Factory method tests (backward compatibility)
  describe("NaturalTransformation.create", () => {
    it("should create natural transformation with all parameters", () => {
      // Verifies: REQ-CAT-004
      const { NaturalTransformation } = require("../../src/domain/entities/NaturalTransformation");
      const components = createComponents();

      const natTrans = NaturalTransformation.create(
        "nat-003",
        "mu",
        "functor-X",
        "functor-Y",
        components
      );

      expect(getId(natTrans)).toBe("nat-003");
      expect(getName(natTrans)).toBe("mu");
      expect(getSourceFunctor(natTrans)).toBe("functor-X");
      expect(getTargetFunctor(natTrans)).toBe("functor-Y");
      expect(getComponent(natTrans, "obj-A")).toBe("morph-eta-A");
    });
  });

  // TEST-NAT-006: Immutability tests
  describe("immutability", () => {
    it("should not allow modification of components after creation", () => {
      // Verifies: REQ-CAT-004
      const components = createComponents();
      const natTrans = createNaturalTransformation(
        "nat-001",
        "eta",
        "F",
        "G",
        components
      );

      // Modify original map
      components.set("obj-A", "modified");
      components.set("new-obj", "new-morph");

      expect(getComponent(natTrans, "obj-A")).toBe("morph-eta-A");
      expect(getComponent(natTrans, "new-obj")).toBeUndefined();
    });

    it("should return a copy of components to prevent mutation", () => {
      // Verifies: REQ-CAT-004
      const natTrans = createNaturalTransformation(
        "nat-001",
        "eta",
        "F",
        "G",
        createComponents()
      );

      const retrieved = getAllComponents(natTrans);
      retrieved.set("obj-A", "modified");

      expect(getComponent(natTrans, "obj-A")).toBe("morph-eta-A");
    });
  });

  // TEST-NAT-007: Direct property access
  describe("direct property access", () => {
    it("should allow direct property access on the immutable object", () => {
      const natTrans = createNaturalTransformation(
        "nat-direct",
        "Direct",
        "F",
        "G",
        createComponents()
      );

      expect(natTrans.id).toBe("nat-direct");
      expect(natTrans.name).toBe("Direct");
      expect(natTrans.sourceFunctor).toBe("F");
      expect(natTrans.targetFunctor).toBe("G");
    });
  });
});
