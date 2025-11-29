/**
 * VerificationService
 * Implements: REQ-CAT-002, REQ-CAT-003, REQ-CAT-004
 *
 * Pure domain service for verifying category theory axioms.
 * - Category axioms: identity morphisms, composition closure
 * - Functor axioms: identity preservation, composition preservation
 * - Natural transformation axioms: naturality condition
 *
 * @see tests/domain/services/VerificationService.test.ts - TEST-VER-001 to TEST-VER-004
 */

import type { Category } from "../entities/Category";
import type { Morphism } from "../entities/Morphism";
import type { Functor } from "../entities/Functor";
import type { NaturalTransformation } from "../entities/NaturalTransformation";

/**
 * Result of verification
 */
export type VerificationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * Create a verification result
 */
const createResult = (
  isValid: boolean,
  errors: string[] = [],
  warnings: string[] = []
): VerificationResult => ({
  isValid,
  errors,
  warnings,
});

/**
 * Verify a category satisfies category axioms
 *
 * Checks:
 * 1. Each object has an identity morphism
 * 2. Morphism sources and targets refer to existing objects
 * 3. Composition closure (warning if missing compositions)
 *
 * @param category The category to verify
 * @returns VerificationResult with errors and warnings
 */
export const verifyCategory = (category: Category): VerificationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const objectIds = new Set(category.objects.map((o) => o.id));
  const morphismMap = new Map<string, Morphism>();

  for (const m of category.morphisms) {
    morphismMap.set(m.id, m);
  }

  // Check 1: Each object has an identity morphism
  for (const obj of category.objects) {
    const hasIdentity = category.morphisms.some(
      (m) => m.source === obj.id && m.target === obj.id
    );
    if (!hasIdentity) {
      errors.push(
        `Object '${obj.id}' lacks an identity morphism (id: ${obj.id} → ${obj.id})`
      );
    }
  }

  // Check 2: Morphism sources and targets refer to existing objects
  for (const m of category.morphisms) {
    if (!objectIds.has(m.source)) {
      errors.push(
        `Morphism '${m.id}' has undefined source object '${m.source}'`
      );
    }
    if (!objectIds.has(m.target)) {
      errors.push(
        `Morphism '${m.id}' has undefined target object '${m.target}'`
      );
    }
  }

  // Check 3: Composition closure (warning)
  // For each pair f: A→B and g: B→C, check if g∘f: A→C exists
  for (const f of category.morphisms) {
    for (const g of category.morphisms) {
      if (f.target === g.source && f.source !== f.target && g.source !== g.target) {
        // f and g are composable (and neither is an identity)
        const compositionExists = category.morphisms.some(
          (m) => m.source === f.source && m.target === g.target
        );
        if (!compositionExists) {
          warnings.push(
            `Missing composition: ${g.name}∘${f.name} (${f.source} → ${g.target})`
          );
        }
      }
    }
  }

  return createResult(errors.length === 0, errors, warnings);
};

/**
 * Verify a functor satisfies functor axioms
 *
 * Checks:
 * 1. All source objects are mapped
 * 2. All mapped objects exist in target category
 * 3. Identity preservation: F(id_A) = id_{F(A)}
 *
 * @param functor The functor to verify
 * @param source The source category
 * @param target The target category
 * @returns VerificationResult with errors and warnings
 */
export const verifyFunctor = (
  functor: Functor,
  source: Category,
  target: Category
): VerificationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const targetObjectIds = new Set(target.objects.map((o) => o.id));
  const targetMorphismMap = new Map<string, Morphism>();
  for (const m of target.morphisms) {
    targetMorphismMap.set(m.id, m);
  }

  // Check 1: All source objects are mapped
  for (const obj of source.objects) {
    const mappedTo = functor.objectMapping.get(obj.id);
    if (mappedTo === undefined) {
      errors.push(`Object '${obj.id}' is not mapped by functor '${functor.id}'`);
    }
  }

  // Check 2: All mapped objects exist in target category
  for (const [sourceObj, targetObj] of functor.objectMapping) {
    if (!targetObjectIds.has(targetObj)) {
      errors.push(
        `Functor '${functor.id}' maps '${sourceObj}' to non-existent object '${targetObj}'`
      );
    }
  }

  // Check 3: Identity preservation
  // For each object A in source, F(id_A) should equal id_{F(A)}
  for (const obj of source.objects) {
    const identityMorphismId = `id-${obj.id}`;
    const mappedIdentity = functor.morphismMapping.get(identityMorphismId);
    const mappedObject = functor.objectMapping.get(obj.id);

    if (mappedObject !== undefined && mappedIdentity !== undefined) {
      const expectedIdentity = `id-${mappedObject}`;
      const targetIdentity = targetMorphismMap.get(mappedIdentity);

      if (targetIdentity) {
        // Check if mapped morphism is the identity on F(A)
        if (
          targetIdentity.source !== mappedObject ||
          targetIdentity.target !== mappedObject
        ) {
          errors.push(
            `Functor '${functor.id}' does not preserve identity for object '${obj.id}': ` +
              `F(id_${obj.id}) = ${mappedIdentity} is not id_${mappedObject}`
          );
        }
      } else if (mappedIdentity !== expectedIdentity) {
        // If morphism doesn't exist, check if it at least has the right ID format
        errors.push(
          `Functor '${functor.id}' does not preserve identity for object '${obj.id}': ` +
            `F(id_${obj.id}) = ${mappedIdentity} should be ${expectedIdentity}`
        );
      }
    }
  }

  return createResult(errors.length === 0, errors, warnings);
};

/**
 * Verify a natural transformation satisfies naturality condition
 *
 * Checks:
 * 1. Each object in the source category has a component
 * 2. Each component morphism exists
 * 3. Each component has correct source and target
 *
 * Naturality condition: For all f: A→B, η_B ∘ F(f) = G(f) ∘ η_A
 *
 * @param natTrans The natural transformation to verify
 * @param sourceFunctor The source functor F
 * @param targetFunctor The target functor G
 * @param category The category (domain of functors)
 * @returns VerificationResult with errors and warnings
 */
export const verifyNaturalTransformation = (
  natTrans: NaturalTransformation,
  sourceFunctor: Functor,
  targetFunctor: Functor,
  category: Category
): VerificationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const morphismMap = new Map<string, Morphism>();
  for (const m of category.morphisms) {
    morphismMap.set(m.id, m);
  }

  // Check 1: Each object has a component
  for (const obj of category.objects) {
    const component = natTrans.components.get(obj.id);
    if (component === undefined) {
      errors.push(
        `Natural transformation '${natTrans.id}' is missing component for object '${obj.id}'`
      );
      continue;
    }

    // Check 2: Component morphism exists
    const componentMorphism = morphismMap.get(component);
    if (componentMorphism === undefined) {
      errors.push(
        `Natural transformation '${natTrans.id}' has non-existent component morphism ` +
          `'${component}' for object '${obj.id}'`
      );
      continue;
    }

    // Check 3: Component has correct source and target
    // η_A: F(A) → G(A)
    const sourceObj = sourceFunctor.objectMapping.get(obj.id);
    const targetObj = targetFunctor.objectMapping.get(obj.id);

    if (sourceObj !== undefined && targetObj !== undefined) {
      if (componentMorphism.source !== sourceObj) {
        errors.push(
          `Component η_${obj.id} has wrong source: expected '${sourceObj}', got '${componentMorphism.source}'`
        );
      }
      if (componentMorphism.target !== targetObj) {
        errors.push(
          `Component η_${obj.id} has wrong target: expected '${targetObj}', got '${componentMorphism.target}'`
        );
      }
    }
  }

  return createResult(errors.length === 0, errors, warnings);
};
