/**
 * CompositionService
 * Implements: REQ-CAT-002
 *
 * Pure domain service for morphism and functor composition.
 * No external dependencies - only domain entities.
 *
 * @see tests/domain/services/CompositionService.test.ts - TEST-COMP-001 to TEST-COMP-002
 */

import {
  type Morphism,
  createMorphism,
} from "../entities/Morphism";
import {
  type Functor,
  createFunctor,
} from "../entities/Functor";

/**
 * Compose two morphisms: g ∘ f
 * Returns the composition if f.target === g.source, null otherwise
 *
 * @param f First morphism (applied first)
 * @param g Second morphism (applied second)
 * @returns Composed morphism g∘f or null if not composable
 */
export const composeMorphisms = (
  f: Morphism,
  g: Morphism
): Morphism | null => {
  // Check composability: f.target must equal g.source
  if (f.target !== g.source) {
    return null;
  }

  // Create composed morphism
  return createMorphism(
    `composed-${f.id}-${g.id}`,
    `${g.name}∘${f.name}`,
    f.source,
    g.target,
    { composedFrom: [f.id, g.id] }
  );
};

/**
 * Compose two functors: G ∘ F
 * Returns the composition if F.targetCategory === G.sourceCategory, null otherwise
 *
 * @param F First functor (applied first)
 * @param G Second functor (applied second)
 * @returns Composed functor G∘F or null if not composable
 */
export const composeFunctors = (
  F: Functor,
  G: Functor
): Functor | null => {
  // Check composability: F.targetCategory must equal G.sourceCategory
  if (F.targetCategory !== G.sourceCategory) {
    return null;
  }

  // Compose object mappings: (G∘F)(A) = G(F(A))
  const composedObjectMapping = new Map<string, string>();
  for (const [sourceObj, intermediateObj] of F.objectMapping) {
    const targetObj = G.objectMapping.get(intermediateObj);
    if (targetObj !== undefined) {
      composedObjectMapping.set(sourceObj, targetObj);
    }
  }

  // Compose morphism mappings: (G∘F)(f) = G(F(f))
  const composedMorphismMapping = new Map<string, string>();
  for (const [sourceMorph, intermediateMorph] of F.morphismMapping) {
    const targetMorph = G.morphismMapping.get(intermediateMorph);
    if (targetMorph !== undefined) {
      composedMorphismMapping.set(sourceMorph, targetMorph);
    }
  }

  // Create composed functor
  return createFunctor(
    `composed-${F.id}-${G.id}`,
    `${G.name}∘${F.name}`,
    F.sourceCategory,
    G.targetCategory,
    composedObjectMapping,
    composedMorphismMapping
  );
};
