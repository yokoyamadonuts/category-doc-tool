/**
 * VerificationService Tests
 * Verifies: REQ-CAT-002, REQ-CAT-003, REQ-CAT-004
 */
import { describe, expect, it } from "bun:test";
import {
  type VerificationResult,
  verifyCategory,
  verifyFunctor,
  verifyNaturalTransformation,
} from "../../../src/domain/services/VerificationService";
import { createCategory } from "../../../src/domain/entities/Category";
import { createCategoryObject } from "../../../src/domain/entities/Object";
import {
  createMorphism,
  createIdentity,
} from "../../../src/domain/entities/Morphism";
import { createFunctor } from "../../../src/domain/entities/Functor";
import { createNaturalTransformation } from "../../../src/domain/entities/NaturalTransformation";

describe("VerificationService", () => {
  // Helper: create a simple category with identity morphisms
  const createSimpleCategory = () => {
    const objects = [
      createCategoryObject("A", "Object A", "test"),
      createCategoryObject("B", "Object B", "test"),
      createCategoryObject("C", "Object C", "test"),
    ];
    const morphisms = [
      createIdentity("A"),
      createIdentity("B"),
      createIdentity("C"),
      createMorphism("f", "f", "A", "B"),
      createMorphism("g", "g", "B", "C"),
      createMorphism("gf", "g∘f", "A", "C"), // Composition included
    ];
    return createCategory("cat-1", "Simple Category", objects, morphisms);
  };

  // TEST-VER-001: verifyCategory - valid category
  describe("verifyCategory", () => {
    it("should return valid for a category with identity morphisms", () => {
      // Verifies: REQ-CAT-002
      const category = createSimpleCategory();

      const result = verifyCategory(category);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should report error when object lacks identity morphism", () => {
      // Verifies: REQ-CAT-002
      const objects = [
        createCategoryObject("A", "Object A", "test"),
        createCategoryObject("B", "Object B", "test"),
      ];
      const morphisms = [
        createIdentity("A"),
        // Missing identity for B
        createMorphism("f", "f", "A", "B"),
      ];
      const category = createCategory("cat-1", "Test", objects, morphisms);

      const result = verifyCategory(category);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("B"))).toBe(true);
      expect(result.errors.some((e) => e.includes("identity"))).toBe(true);
    });

    it("should report warning for missing composition morphism", () => {
      // Verifies: REQ-CAT-002
      const objects = [
        createCategoryObject("A", "Object A", "test"),
        createCategoryObject("B", "Object B", "test"),
        createCategoryObject("C", "Object C", "test"),
      ];
      const morphisms = [
        createIdentity("A"),
        createIdentity("B"),
        createIdentity("C"),
        createMorphism("f", "f", "A", "B"),
        createMorphism("g", "g", "B", "C"),
        // Missing g∘f: A → C
      ];
      const category = createCategory("cat-1", "Test", objects, morphisms);

      const result = verifyCategory(category);

      // This may be a warning rather than an error (composition closure)
      expect(result.warnings.some((w) => w.includes("composition"))).toBe(true);
    });

    it("should validate empty category as valid", () => {
      // Verifies: REQ-CAT-002
      const category = createCategory("empty", "Empty", [], []);

      const result = verifyCategory(category);

      expect(result.isValid).toBe(true);
    });

    it("should report error for morphism with undefined source object", () => {
      // Verifies: REQ-CAT-002
      const objects = [createCategoryObject("A", "Object A", "test")];
      const morphisms = [
        createIdentity("A"),
        createMorphism("f", "f", "X", "A"), // X doesn't exist
      ];
      const category = createCategory("cat-1", "Test", objects, morphisms);

      const result = verifyCategory(category);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("X"))).toBe(true);
    });

    it("should report error for morphism with undefined target object", () => {
      // Verifies: REQ-CAT-002
      const objects = [createCategoryObject("A", "Object A", "test")];
      const morphisms = [
        createIdentity("A"),
        createMorphism("f", "f", "A", "Y"), // Y doesn't exist
      ];
      const category = createCategory("cat-1", "Test", objects, morphisms);

      const result = verifyCategory(category);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("Y"))).toBe(true);
    });
  });

  // TEST-VER-002: verifyFunctor tests
  describe("verifyFunctor", () => {
    it("should return valid for a correct functor", () => {
      // Verifies: REQ-CAT-003
      const sourceObjs = [
        createCategoryObject("A", "A", "src"),
        createCategoryObject("B", "B", "src"),
      ];
      const sourceMorphs = [
        createIdentity("A"),
        createIdentity("B"),
        createMorphism("f", "f", "A", "B"),
      ];
      const source = createCategory("src", "Source", sourceObjs, sourceMorphs);

      const targetObjs = [
        createCategoryObject("A'", "A'", "tgt"),
        createCategoryObject("B'", "B'", "tgt"),
      ];
      const targetMorphs = [
        createIdentity("A'"),
        createIdentity("B'"),
        createMorphism("f'", "f'", "A'", "B'"),
      ];
      const target = createCategory("tgt", "Target", targetObjs, targetMorphs);

      const functor = createFunctor(
        "F",
        "F",
        "src",
        "tgt",
        new Map([
          ["A", "A'"],
          ["B", "B'"],
        ]),
        new Map([
          ["id-A", "id-A'"],
          ["id-B", "id-B'"],
          ["f", "f'"],
        ])
      );

      const result = verifyFunctor(functor, source, target);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should report error when object mapping is incomplete", () => {
      // Verifies: REQ-CAT-003
      const source = createCategory(
        "src",
        "Source",
        [createCategoryObject("A", "A", "src")],
        [createIdentity("A")]
      );
      const target = createCategory("tgt", "Target", [], []);
      const functor = createFunctor(
        "F",
        "F",
        "src",
        "tgt",
        new Map(), // A not mapped
        new Map()
      );

      const result = verifyFunctor(functor, source, target);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("A"))).toBe(true);
    });

    it("should report error when mapped object does not exist in target", () => {
      // Verifies: REQ-CAT-003
      const source = createCategory(
        "src",
        "Source",
        [createCategoryObject("A", "A", "src")],
        [createIdentity("A")]
      );
      const target = createCategory("tgt", "Target", [], []);
      const functor = createFunctor(
        "F",
        "F",
        "src",
        "tgt",
        new Map([["A", "NonExistent"]]),
        new Map()
      );

      const result = verifyFunctor(functor, source, target);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("NonExistent"))).toBe(true);
    });

    it("should report error when identity preservation fails", () => {
      // Verifies: REQ-CAT-003
      const source = createCategory(
        "src",
        "Source",
        [createCategoryObject("A", "A", "src")],
        [createIdentity("A")]
      );
      const target = createCategory(
        "tgt",
        "Target",
        [createCategoryObject("A'", "A'", "tgt")],
        [createIdentity("A'")]
      );
      const functor = createFunctor(
        "F",
        "F",
        "src",
        "tgt",
        new Map([["A", "A'"]]),
        new Map([["id-A", "some-other-morphism"]]) // Not identity
      );

      const result = verifyFunctor(functor, source, target);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("identity"))).toBe(true);
    });
  });

  // TEST-VER-003: verifyNaturalTransformation tests
  describe("verifyNaturalTransformation", () => {
    it("should return valid for a correct natural transformation", () => {
      // Verifies: REQ-CAT-004
      const objects = [
        createCategoryObject("A", "A", "cat"),
        createCategoryObject("B", "B", "cat"),
      ];
      const morphisms = [
        createIdentity("A"),
        createIdentity("B"),
        createMorphism("f", "f", "A", "B"),
      ];
      const category = createCategory("cat", "Cat", objects, morphisms);

      const F = createFunctor(
        "F",
        "F",
        "cat",
        "cat",
        new Map([
          ["A", "A"],
          ["B", "B"],
        ]),
        new Map([["f", "f"]])
      );
      const G = createFunctor(
        "G",
        "G",
        "cat",
        "cat",
        new Map([
          ["A", "A"],
          ["B", "B"],
        ]),
        new Map([["f", "f"]])
      );

      // Natural transformation with components η_A and η_B
      const eta = createNaturalTransformation(
        "eta",
        "η",
        "F",
        "G",
        new Map([
          ["A", "id-A"],
          ["B", "id-B"],
        ])
      );

      const result = verifyNaturalTransformation(eta, F, G, category);

      expect(result.isValid).toBe(true);
    });

    it("should report error when component is missing for object", () => {
      // Verifies: REQ-CAT-004
      const objects = [
        createCategoryObject("A", "A", "cat"),
        createCategoryObject("B", "B", "cat"),
      ];
      const morphisms = [createIdentity("A"), createIdentity("B")];
      const category = createCategory("cat", "Cat", objects, morphisms);

      const F = createFunctor(
        "F",
        "F",
        "cat",
        "cat",
        new Map([
          ["A", "A"],
          ["B", "B"],
        ]),
        new Map()
      );
      const G = createFunctor(
        "G",
        "G",
        "cat",
        "cat",
        new Map([
          ["A", "A"],
          ["B", "B"],
        ]),
        new Map()
      );

      const eta = createNaturalTransformation(
        "eta",
        "η",
        "F",
        "G",
        new Map([["A", "id-A"]]) // Missing component for B
      );

      const result = verifyNaturalTransformation(eta, F, G, category);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("B"))).toBe(true);
    });

    it("should report error when component morphism does not exist", () => {
      // Verifies: REQ-CAT-004
      const objects = [createCategoryObject("A", "A", "cat")];
      const morphisms = [createIdentity("A")];
      const category = createCategory("cat", "Cat", objects, morphisms);

      const F = createFunctor(
        "F",
        "F",
        "cat",
        "cat",
        new Map([["A", "A"]]),
        new Map()
      );
      const G = createFunctor(
        "G",
        "G",
        "cat",
        "cat",
        new Map([["A", "A"]]),
        new Map()
      );

      const eta = createNaturalTransformation(
        "eta",
        "η",
        "F",
        "G",
        new Map([["A", "non-existent-morphism"]])
      );

      const result = verifyNaturalTransformation(eta, F, G, category);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("non-existent"))).toBe(true);
    });

    it("should report error when component has wrong source", () => {
      // Verifies: REQ-CAT-004
      const objects = [
        createCategoryObject("A", "A", "cat"),
        createCategoryObject("B", "B", "cat"),
      ];
      const morphisms = [
        createIdentity("A"),
        createIdentity("B"),
        createMorphism("wrong", "wrong", "B", "A"), // B -> A, not F(A) -> G(A)
      ];
      const category = createCategory("cat", "Cat", objects, morphisms);

      const F = createFunctor(
        "F",
        "F",
        "cat",
        "cat",
        new Map([
          ["A", "A"],
          ["B", "B"],
        ]),
        new Map()
      );
      const G = createFunctor(
        "G",
        "G",
        "cat",
        "cat",
        new Map([
          ["A", "A"],
          ["B", "B"],
        ]),
        new Map()
      );

      const eta = createNaturalTransformation(
        "eta",
        "η",
        "F",
        "G",
        new Map([
          ["A", "wrong"], // wrong morphism, should be F(A) -> G(A) = A -> A
          ["B", "id-B"],
        ])
      );

      const result = verifyNaturalTransformation(eta, F, G, category);

      expect(result.isValid).toBe(false);
    });
  });

  // TEST-VER-004: VerificationResult structure
  describe("VerificationResult", () => {
    it("should have correct structure with all fields", () => {
      const category = createSimpleCategory();
      const result = verifyCategory(category);

      expect(typeof result.isValid).toBe("boolean");
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });
});
