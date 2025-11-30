/**
 * Morphism Entity Tests
 * Verifies: REQ-CAT-001, REQ-CAT-002
 */
import { describe, expect, it } from "bun:test";
import {
  type Morphism,
  createMorphism,
  createIdentity,
  compose,
  getId,
  getName,
  getSource,
  getTarget,
  getMetadata,
} from "../../src/domain/entities/Morphism";

describe("Morphism Entity", () => {
  // TEST-MORPH-001: createMorphism creates morphism with all properties
  describe("createMorphism", () => {
    it("should create a morphism with all required properties", () => {
      // Verifies: REQ-CAT-001
      const morphism = createMorphism(
        "morph-001",
        "depends-on",
        "obj-001",
        "obj-002",
        { type: "dependency" }
      );

      expect(getId(morphism)).toBe("morph-001");
      expect(getName(morphism)).toBe("depends-on");
      expect(getSource(morphism)).toBe("obj-001");
      expect(getTarget(morphism)).toBe("obj-002");
      expect(getMetadata(morphism)).toEqual({ type: "dependency" });
    });

    it("should create a morphism with default empty metadata", () => {
      // Verifies: REQ-CAT-001
      const morphism = createMorphism(
        "morph-002",
        "relates-to",
        "obj-003",
        "obj-004"
      );

      expect(getMetadata(morphism)).toEqual({});
    });
  });

  // TEST-MORPH-002: Validation tests
  describe("validation", () => {
    it("should throw error when id is empty", () => {
      // Verifies: REQ-CAT-001
      expect(() => {
        createMorphism("", "name", "source", "target");
      }).toThrow("id must be a non-empty string");
    });

    it("should throw error when name is empty", () => {
      // Verifies: REQ-CAT-001
      expect(() => {
        createMorphism("morph-001", "", "source", "target");
      }).toThrow("name must be a non-empty string");
    });

    it("should throw error when source is empty", () => {
      // Verifies: REQ-CAT-001
      expect(() => {
        createMorphism("morph-001", "name", "", "target");
      }).toThrow("source must be a non-empty string");
    });

    it("should throw error when target is empty", () => {
      // Verifies: REQ-CAT-001
      expect(() => {
        createMorphism("morph-001", "name", "source", "");
      }).toThrow("target must be a non-empty string");
    });
  });

  // TEST-MORPH-003: Composition tests
  describe("compose", () => {
    it("should compose two morphisms when target matches source", () => {
      // Verifies: REQ-CAT-002
      const f = createMorphism("f", "f", "A", "B");
      const g = createMorphism("g", "g", "B", "C");

      const composed = compose(f, g);

      expect(composed).not.toBeNull();
      expect(getId(composed!)).toBe("composed-f-g");
      expect(getName(composed!)).toBe("g∘f");
      expect(getSource(composed!)).toBe("A");
      expect(getTarget(composed!)).toBe("C");
    });

    it("should return null when target does not match source", () => {
      // Verifies: REQ-CAT-002
      const f = createMorphism("f", "f", "A", "B");
      const g = createMorphism("g", "g", "C", "D"); // B != C

      const composed = compose(f, g);

      expect(composed).toBeNull();
    });

    it("should compose with identity morphism correctly", () => {
      // Verifies: REQ-CAT-002
      const f = createMorphism("f", "f", "A", "B");
      const idB = createIdentity("B");

      const composed = compose(f, idB);

      expect(composed).not.toBeNull();
      expect(getSource(composed!)).toBe("A");
      expect(getTarget(composed!)).toBe("B");
    });

    it("should allow identity morphism to compose from left", () => {
      // Verifies: REQ-CAT-002
      const idA = createIdentity("A");
      const f = createMorphism("f", "f", "A", "B");

      const composed = compose(idA, f);

      expect(composed).not.toBeNull();
      expect(getSource(composed!)).toBe("A");
      expect(getTarget(composed!)).toBe("B");
    });
  });

  // TEST-MORPH-004: Factory method tests (backward compatibility)
  describe("Morphism.create", () => {
    it("should create morphism with all parameters", () => {
      // Verifies: REQ-CAT-001
      const { Morphism } = require("../../src/domain/entities/Morphism");
      const morphism = Morphism.create(
        "morph-003",
        "implements",
        "spec-001",
        "impl-001",
        { verified: true }
      );

      expect(getId(morphism)).toBe("morph-003");
      expect(getName(morphism)).toBe("implements");
      expect(getSource(morphism)).toBe("spec-001");
      expect(getTarget(morphism)).toBe("impl-001");
      expect(getMetadata(morphism)).toEqual({ verified: true });
    });

    it("should create morphism with default metadata when not provided", () => {
      // Verifies: REQ-CAT-001
      const { Morphism } = require("../../src/domain/entities/Morphism");
      const morphism = Morphism.create("morph-004", "links", "a", "b");

      expect(getMetadata(morphism)).toEqual({});
    });
  });

  // TEST-MORPH-005: Identity morphism tests
  describe("createIdentity", () => {
    it("should create an identity morphism for an object", () => {
      // Verifies: REQ-CAT-002
      const identity = createIdentity("obj-001");

      expect(getId(identity)).toBe("id-obj-001");
      expect(getName(identity)).toBe("id_obj-001");
      expect(getSource(identity)).toBe("obj-001");
      expect(getTarget(identity)).toBe("obj-001");
    });

    it("should satisfy identity law: f ∘ id = f (source matches)", () => {
      // Verifies: REQ-CAT-002
      const idA = createIdentity("A");
      const f = createMorphism("f", "f", "A", "B");

      const composed = compose(idA, f);

      expect(composed).not.toBeNull();
      expect(getSource(composed!)).toBe("A");
      expect(getTarget(composed!)).toBe("B");
    });

    it("should satisfy identity law: id ∘ f = f (target matches)", () => {
      // Verifies: REQ-CAT-002
      const f = createMorphism("f", "f", "A", "B");
      const idB = createIdentity("B");

      const composed = compose(f, idB);

      expect(composed).not.toBeNull();
      expect(getSource(composed!)).toBe("A");
      expect(getTarget(composed!)).toBe("B");
    });
  });

  // TEST-MORPH-006: Immutability tests
  describe("immutability", () => {
    it("should return a copy of metadata to prevent mutation", () => {
      // Verifies: REQ-CAT-001
      const morphism = createMorphism("m", "m", "a", "b", { key: "value" });

      const metadata = getMetadata(morphism);
      metadata.key = "modified";

      expect(getMetadata(morphism).key).toBe("value");
    });

    it("should not allow modification of original metadata after creation", () => {
      // Verifies: REQ-CAT-001
      const originalMetadata = { key: "original" };
      const morphism = createMorphism("m", "m", "a", "b", originalMetadata);

      originalMetadata.key = "modified";

      expect(getMetadata(morphism).key).toBe("original");
    });
  });

  // TEST-MORPH-007: Direct property access
  describe("direct property access", () => {
    it("should allow direct property access on the immutable object", () => {
      const m = createMorphism("m-001", "test", "A", "B", { prop: "value" });

      expect(m.id).toBe("m-001");
      expect(m.name).toBe("test");
      expect(m.source).toBe("A");
      expect(m.target).toBe("B");
    });
  });
});
