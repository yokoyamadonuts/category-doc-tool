/**
 * CLI Validate Command
 * Implements: REQ-CAT-002, REQ-CAT-003, REQ-CAT-004
 *
 * Validate category structures and mathematical axioms.
 */

import type { Category } from "../../domain/entities/Category";
import type { Functor } from "../../domain/entities/Functor";
import type { NaturalTransformation } from "../../domain/entities/NaturalTransformation";
import {
  verifyCategory,
  verifyFunctor,
  verifyNaturalTransformation,
} from "../../domain/services/VerificationService";

// =============================================================================
// Types
// =============================================================================

/**
 * Options for validation
 */
export type ValidateOptions = {
  verbose?: boolean;
};

/**
 * Result of category validation
 */
export type CategoryValidateResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  categoriesChecked: number;
};

/**
 * Result of functor validation
 */
export type FunctorValidateResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  functorsChecked: number;
};

/**
 * Result of natural transformation validation
 */
export type NaturalTransformationValidateResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  naturalTransformationsChecked: number;
};

/**
 * Complete validation result
 */
export type ValidateResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    categoriesChecked: number;
    functorsChecked: number;
    naturalTransformationsChecked: number;
    totalErrors: number;
    totalWarnings: number;
  };
  timestamp: string;
};

/**
 * Input for validateAll
 */
export type ValidateAllInput = {
  categories: Category[];
  functors: Functor[];
  naturalTransformations: NaturalTransformation[];
};

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate categories
 */
export function validateCategories(
  categories: Category[],
  options: ValidateOptions = {}
): CategoryValidateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const category of categories) {
    // Check for empty category
    if (category.objects.length === 0 && category.morphisms.length === 0) {
      warnings.push(`Category '${category.id}' is empty`);
      continue;
    }

    // Verify category axioms
    const result = verifyCategory(category);

    if (!result.isValid) {
      errors.push(...result.errors.map((e) => `[${category.id}] ${e}`));
    }
    warnings.push(...result.warnings.map((w) => `[${category.id}] ${w}`));
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    categoriesChecked: categories.length,
  };
}

/**
 * Validate functors
 */
export function validateFunctors(
  functors: Functor[],
  categories: Category[],
  options: ValidateOptions = {}
): FunctorValidateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  for (const functor of functors) {
    // Check source category exists
    const sourceCategory = categoryMap.get(functor.sourceCategory);
    if (!sourceCategory) {
      errors.push(
        `Functor '${functor.id}' has invalid source category '${functor.sourceCategory}'`
      );
      continue;
    }

    // Check target category exists
    const targetCategory = categoryMap.get(functor.targetCategory);
    if (!targetCategory) {
      errors.push(
        `Functor '${functor.id}' has invalid target category '${functor.targetCategory}'`
      );
      continue;
    }

    // Verify functor axioms
    const result = verifyFunctor(functor, sourceCategory, targetCategory);

    if (!result.isValid) {
      errors.push(...result.errors.map((e) => `[${functor.id}] ${e}`));
    }
    warnings.push(...result.warnings.map((w) => `[${functor.id}] ${w}`));

    // Check object mapping coverage
    const mappedObjects = new Set(functor.objectMapping.keys());
    for (const obj of sourceCategory.objects) {
      if (!mappedObjects.has(obj.id)) {
        warnings.push(
          `Functor '${functor.id}' does not map object '${obj.id}'`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    functorsChecked: functors.length,
  };
}

/**
 * Validate natural transformations
 */
export function validateNaturalTransformations(
  naturalTransformations: NaturalTransformation[],
  functors: Functor[],
  categories: Category[],
  options: ValidateOptions = {}
): NaturalTransformationValidateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const functorMap = new Map(functors.map((f) => [f.id, f]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  for (const natTrans of naturalTransformations) {
    // Check source functor exists
    const sourceFunctor = functorMap.get(natTrans.sourceFunctor);
    if (!sourceFunctor) {
      errors.push(
        `NaturalTransformation '${natTrans.id}' has invalid source functor '${natTrans.sourceFunctor}'`
      );
      continue;
    }

    // Check target functor exists
    const targetFunctor = functorMap.get(natTrans.targetFunctor);
    if (!targetFunctor) {
      errors.push(
        `NaturalTransformation '${natTrans.id}' has invalid target functor '${natTrans.targetFunctor}'`
      );
      continue;
    }

    // Get source category for naturality check
    const sourceCategory = categoryMap.get(sourceFunctor.sourceCategory);
    if (sourceCategory) {
      // Verify natural transformation axioms
      const result = verifyNaturalTransformation(
        natTrans,
        sourceFunctor,
        targetFunctor,
        sourceCategory
      );

      if (!result.isValid) {
        errors.push(...result.errors.map((e) => `[${natTrans.id}] ${e}`));
      }
      warnings.push(...result.warnings.map((w) => `[${natTrans.id}] ${w}`));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    naturalTransformationsChecked: naturalTransformations.length,
  };
}

/**
 * Validate all structures
 */
export function validateAll(
  input: ValidateAllInput,
  options: ValidateOptions = {}
): ValidateResult {
  const { categories, functors, naturalTransformations } = input;

  // Validate each type
  const categoryResult = validateCategories(categories, options);
  const functorResult = validateFunctors(functors, categories, options);
  const natTransResult = validateNaturalTransformations(
    naturalTransformations,
    functors,
    categories,
    options
  );

  // Aggregate results
  const errors = [
    ...categoryResult.errors,
    ...functorResult.errors,
    ...natTransResult.errors,
  ];

  const warnings = [
    ...categoryResult.warnings,
    ...functorResult.warnings,
    ...natTransResult.warnings,
  ];

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      categoriesChecked: categoryResult.categoriesChecked,
      functorsChecked: functorResult.functorsChecked,
      naturalTransformationsChecked:
        natTransResult.naturalTransformationsChecked,
      totalErrors: errors.length,
      totalWarnings: warnings.length,
    },
    timestamp: new Date().toISOString(),
  };
}
