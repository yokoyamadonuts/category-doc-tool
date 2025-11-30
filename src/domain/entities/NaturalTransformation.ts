/**
 * NaturalTransformation Entity
 * Implements: REQ-CAT-004
 *
 * Represents a natural transformation between two functors.
 * For functors F, G: C → D, a natural transformation η: F ⇒ G
 * assigns to each object A in C a morphism η_A: F(A) → G(A) in D.
 * This is an immutable value type with no external dependencies.
 *
 * @see tests/domain/NaturalTransformation.test.ts - TEST-NAT-001 to TEST-NAT-006
 */

/**
 * Immutable data structure representing a natural transformation
 */
export type NaturalTransformation = Readonly<{
  id: string;
  name: string;
  sourceFunctor: string;
  targetFunctor: string;
  components: ReadonlyMap<string, string>; // object id -> morphism id
}>;

/**
 * Validates that a string is non-empty
 */
const validateNonEmptyString = (
  value: string,
  fieldName: string
): string => {
  if (!value || value.trim() === "") {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  return value;
};

/**
 * Creates a new NaturalTransformation with validation
 */
export const createNaturalTransformation = (
  id: string,
  name: string,
  sourceFunctor: string,
  targetFunctor: string,
  components: ReadonlyMap<string, string>
): NaturalTransformation => {
  return Object.freeze({
    id: validateNonEmptyString(id, "id"),
    name: validateNonEmptyString(name, "name"),
    sourceFunctor: validateNonEmptyString(sourceFunctor, "sourceFunctor"),
    targetFunctor: validateNonEmptyString(targetFunctor, "targetFunctor"),
    components: new Map(components),
  });
};

// Accessor functions

export const getId = (nt: NaturalTransformation): string => nt.id;
export const getName = (nt: NaturalTransformation): string => nt.name;
export const getSourceFunctor = (nt: NaturalTransformation): string =>
  nt.sourceFunctor;
export const getTargetFunctor = (nt: NaturalTransformation): string =>
  nt.targetFunctor;

/**
 * Get the component morphism for a given object
 * @param nt The natural transformation
 * @param objectId The object id in the source category
 * @returns The morphism id (η_objectId), or undefined if not defined
 */
export const getComponent = (
  nt: NaturalTransformation,
  objectId: string
): string | undefined => {
  return nt.components.get(objectId);
};

/**
 * Get a copy of all components (to maintain immutability)
 */
export const getAllComponents = (
  nt: NaturalTransformation
): Map<string, string> => {
  return new Map(nt.components);
};

// Backward compatibility
export const NaturalTransformation = {
  create: createNaturalTransformation,
};
