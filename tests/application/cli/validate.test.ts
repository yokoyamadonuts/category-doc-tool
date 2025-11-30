/**
 * CLI Validate Command Tests
 * Verifies: REQ-CAT-002, REQ-CAT-003, REQ-CAT-004
 */
import { describe, expect, it } from "bun:test";
import {
  validateCategories,
  validateFunctors,
  validateNaturalTransformations,
  validateAll,
  type ValidateOptions,
  type ValidateResult,
} from "../../../src/application/cli/validate";
import { createCategory } from "../../../src/domain/entities/Category";
import { createCategoryObject } from "../../../src/domain/entities/Object";
import { createMorphism } from "../../../src/domain/entities/Morphism";
import { createFunctor } from "../../../src/domain/entities/Functor";
import { createNaturalTransformation } from "../../../src/domain/entities/NaturalTransformation";

describe("CLI Validate Command", () => {
  // TEST-VALIDATE-001: Validate categories
  describe("validateCategories", () => {
    it("should validate a well-formed category", () => {
      const objects = [
        createCategoryObject("A", "Object A", "test"),
        createCategoryObject("B", "Object B", "test"),
      ];
      const morphisms = [
        createMorphism("id-A", "id_A", "A", "A"),
        createMorphism("id-B", "id_B", "B", "B"),
        createMorphism("f", "f", "A", "B"),
      ];
      const category = createCategory("cat-1", "Test Category", objects, morphisms);

      const result = validateCategories([category]);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should report error for missing identity morphisms", () => {
      const objects = [
        createCategoryObject("A", "Object A", "test"),
        createCategoryObject("B", "Object B", "test"),
      ];
      const morphisms = [createMorphism("f", "f", "A", "B")];
      const category = createCategory("cat-1", "Test Category", objects, morphisms);

      const result = validateCategories([category]);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes("identity"))).toBe(true);
    });

    it("should report warning for empty category", () => {
      const category = createCategory("empty", "Empty Category", [], []);

      const result = validateCategories([category]);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("empty"))).toBe(true);
    });

    it("should validate multiple categories", () => {
      const cat1 = createCategory(
        "cat-1",
        "Category 1",
        [createCategoryObject("A", "A", "test")],
        [createMorphism("id-A", "id_A", "A", "A")]
      );
      const cat2 = createCategory(
        "cat-2",
        "Category 2",
        [createCategoryObject("B", "B", "test")],
        [createMorphism("id-B", "id_B", "B", "B")]
      );

      const result = validateCategories([cat1, cat2]);

      expect(result.isValid).toBe(true);
      expect(result.categoriesChecked).toBe(2);
    });
  });

  // TEST-VALIDATE-002: Validate functors
  describe("validateFunctors", () => {
    it("should validate a well-formed functor", () => {
      const sourceObjects = [createCategoryObject("A", "A", "test")];
      const sourceMorphisms = [createMorphism("id-A", "id_A", "A", "A")];
      const sourceCategory = createCategory(
        "source",
        "Source",
        sourceObjects,
        sourceMorphisms
      );

      const targetObjects = [createCategoryObject("B", "B", "test")];
      const targetMorphisms = [createMorphism("id-B", "id_B", "B", "B")];
      const targetCategory = createCategory(
        "target",
        "Target",
        targetObjects,
        targetMorphisms
      );

      const functor = createFunctor(
        "F",
        "Functor F",
        "source",
        "target",
        new Map([["A", "B"]]),
        new Map([["id-A", "id-B"]])
      );

      const result = validateFunctors(
        [functor],
        [sourceCategory, targetCategory]
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should report error for invalid source category", () => {
      const functor = createFunctor(
        "F",
        "Functor F",
        "nonexistent",
        "target",
        new Map(),
        new Map()
      );

      const category = createCategory("target", "Target", [], []);

      const result = validateFunctors([functor], [category]);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("source"))).toBe(true);
    });

    it("should report error for invalid target category", () => {
      const functor = createFunctor(
        "F",
        "Functor F",
        "source",
        "nonexistent",
        new Map(),
        new Map()
      );

      const category = createCategory("source", "Source", [], []);

      const result = validateFunctors([functor], [category]);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("target"))).toBe(true);
    });

    it("should validate object mapping coverage", () => {
      const sourceObjects = [
        createCategoryObject("A", "A", "test"),
        createCategoryObject("B", "B", "test"),
      ];
      const sourceCategory = createCategory(
        "source",
        "Source",
        sourceObjects,
        []
      );

      const targetCategory = createCategory("target", "Target", [], []);

      const functor = createFunctor(
        "F",
        "Functor F",
        "source",
        "target",
        new Map([["A", "X"]]), // Missing B mapping
        new Map()
      );

      const result = validateFunctors(
        [functor],
        [sourceCategory, targetCategory]
      );

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  // TEST-VALIDATE-003: Validate natural transformations
  describe("validateNaturalTransformations", () => {
    it("should validate a well-formed natural transformation", () => {
      const sourceCategory = createCategory(
        "C",
        "Category C",
        [createCategoryObject("A", "A", "test")],
        [createMorphism("id-A", "id_A", "A", "A")]
      );

      const functorF = createFunctor(
        "F",
        "F",
        "C",
        "C",
        new Map([["A", "A"]]),
        new Map()
      );

      const functorG = createFunctor(
        "G",
        "G",
        "C",
        "C",
        new Map([["A", "A"]]),
        new Map()
      );

      const natTrans = createNaturalTransformation(
        "eta",
        "η",
        "F",
        "G",
        new Map([["A", "id-A"]])
      );

      const result = validateNaturalTransformations(
        [natTrans],
        [functorF, functorG],
        [sourceCategory]
      );

      expect(result.isValid).toBe(true);
    });

    it("should report error for invalid source functor", () => {
      const natTrans = createNaturalTransformation(
        "eta",
        "η",
        "nonexistent",
        "G",
        new Map()
      );

      const functor = createFunctor("G", "G", "C", "C", new Map(), new Map());

      const result = validateNaturalTransformations([natTrans], [functor], []);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("source"))).toBe(true);
    });

    it("should report error for invalid target functor", () => {
      const natTrans = createNaturalTransformation(
        "eta",
        "η",
        "F",
        "nonexistent",
        new Map()
      );

      const functor = createFunctor("F", "F", "C", "C", new Map(), new Map());

      const result = validateNaturalTransformations([natTrans], [functor], []);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("target"))).toBe(true);
    });
  });

  // TEST-VALIDATE-004: Validate all
  describe("validateAll", () => {
    it("should validate complete configuration", () => {
      const objects = [createCategoryObject("A", "A", "test")];
      const morphisms = [createMorphism("id-A", "id_A", "A", "A")];
      const category = createCategory("C", "Category C", objects, morphisms);

      const functor = createFunctor(
        "F",
        "F",
        "C",
        "C",
        new Map([["A", "A"]]),
        new Map([["id-A", "id-A"]])
      );

      const result = validateAll({
        categories: [category],
        functors: [functor],
        naturalTransformations: [],
      });

      expect(result.isValid).toBe(true);
      expect(result.summary).toBeDefined();
    });

    it("should aggregate errors from all validations", () => {
      const category = createCategory("C", "Category C", [], []);

      const functor = createFunctor(
        "F",
        "F",
        "nonexistent",
        "C",
        new Map(),
        new Map()
      );

      const natTrans = createNaturalTransformation(
        "eta",
        "η",
        "X",
        "Y",
        new Map()
      );

      const result = validateAll({
        categories: [category],
        functors: [functor],
        naturalTransformations: [natTrans],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should return summary with counts", () => {
      const category = createCategory("C", "Category", [], []);

      const result = validateAll({
        categories: [category],
        functors: [],
        naturalTransformations: [],
      });

      expect(result.summary.categoriesChecked).toBe(1);
      expect(result.summary.functorsChecked).toBe(0);
      expect(result.summary.naturalTransformationsChecked).toBe(0);
    });
  });

  // TEST-VALIDATE-005: Output formatting
  describe("result formatting", () => {
    it("should include detailed error messages", () => {
      const objects = [createCategoryObject("A", "A", "test")];
      // Missing identity morphism
      const category = createCategory("C", "Category", objects, []);

      const result = validateCategories([category]);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("A"); // Should mention the object
    });

    it("should include validation timestamp", () => {
      const result = validateAll({
        categories: [],
        functors: [],
        naturalTransformations: [],
      });

      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe("string");
    });
  });
});
