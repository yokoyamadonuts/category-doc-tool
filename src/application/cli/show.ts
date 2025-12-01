/**
 * CLI Show Command
 * Implements: REQ-DOC-002
 *
 * Show detailed information about objects, categories, and functors.
 */

import type { CategoryObject } from "../../domain/entities/Object";
import type { Morphism } from "../../domain/entities/Morphism";
import type { Category } from "../../domain/entities/Category";
import type { Functor } from "../../domain/entities/Functor";

// =============================================================================
// Types
// =============================================================================

/**
 * Object show result
 */
export type ObjectShowResult = {
  found: boolean;
  object?: CategoryObject;
  outgoingMorphisms?: Morphism[];
  incomingMorphisms?: Morphism[];
};

/**
 * Category show result
 */
export type CategoryShowResult = {
  found: boolean;
  category?: Category;
  objectCount?: number;
  morphismCount?: number;
  objects?: readonly CategoryObject[];
  morphisms?: readonly Morphism[];
};

/**
 * Mapping entry
 */
export type MappingEntry = {
  source: string;
  target: string;
};

/**
 * Functor show result
 */
export type FunctorShowResult = {
  found: boolean;
  functor?: Functor;
  objectMappings?: MappingEntry[];
  morphismMappings?: MappingEntry[];
};

/**
 * Generic show result
 */
export type ShowResult = ObjectShowResult | CategoryShowResult | FunctorShowResult;

// =============================================================================
// Show Functions
// =============================================================================

/**
 * Show object details with related morphisms
 */
export function showObject(
  object: CategoryObject | null,
  morphisms: Morphism[]
): ObjectShowResult {
  if (!object) {
    return { found: false };
  }

  // Find outgoing morphisms (where this object is the source)
  const outgoingMorphisms = morphisms.filter((m) => m.source === object.id);

  // Find incoming morphisms (where this object is the target)
  const incomingMorphisms = morphisms.filter((m) => m.target === object.id);

  return {
    found: true,
    object,
    outgoingMorphisms,
    incomingMorphisms,
  };
}

/**
 * Show category details with objects and morphisms
 */
export function showCategory(category: Category | null): CategoryShowResult {
  if (!category) {
    return { found: false };
  }

  return {
    found: true,
    category,
    objectCount: category.objects.length,
    morphismCount: category.morphisms.length,
    objects: category.objects,
    morphisms: category.morphisms,
  };
}

/**
 * Show functor details with mappings
 */
export function showFunctor(functor: Functor | null): FunctorShowResult {
  if (!functor) {
    return { found: false };
  }

  // Convert maps to arrays for display
  const objectMappings: MappingEntry[] = Array.from(
    functor.objectMapping.entries()
  ).map(([source, target]) => ({ source, target }));

  const morphismMappings: MappingEntry[] = Array.from(
    functor.morphismMapping.entries()
  ).map(([source, target]) => ({ source, target }));

  return {
    found: true,
    functor,
    objectMappings,
    morphismMappings,
  };
}
