/**
 * Functor Entity
 * Implements: REQ-CAT-003
 *
 * Represents a functor between categories in category theory.
 * A functor F: C → D maps objects and morphisms from category C to category D.
 * This is an immutable value type with no external dependencies.
 *
 * @see tests/domain/Functor.test.ts - TEST-FUNC-001 to TEST-FUNC-006
 */

/**
 * Immutable data structure representing a functor
 */
export type Functor = Readonly<{
  id: string;
  name: string;
  sourceCategory: string;
  targetCategory: string;
  objectMapping: ReadonlyMap<string, string>;
  morphismMapping: ReadonlyMap<string, string>;
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
 * Creates a new Functor with validation
 */
export const createFunctor = (
  id: string,
  name: string,
  sourceCategory: string,
  targetCategory: string,
  objectMapping: ReadonlyMap<string, string>,
  morphismMapping: ReadonlyMap<string, string>
): Functor => {
  return Object.freeze({
    id: validateNonEmptyString(id, "id"),
    name: validateNonEmptyString(name, "name"),
    sourceCategory: validateNonEmptyString(sourceCategory, "sourceCategory"),
    targetCategory: validateNonEmptyString(targetCategory, "targetCategory"),
    objectMapping: new Map(objectMapping),
    morphismMapping: new Map(morphismMapping),
  });
};

// Accessor functions

export const getId = (f: Functor): string => f.id;
export const getName = (f: Functor): string => f.name;
export const getSourceCategory = (f: Functor): string => f.sourceCategory;
export const getTargetCategory = (f: Functor): string => f.targetCategory;

/**
 * Map an object from source category to target category
 */
export const mapObject = (
  f: Functor,
  objectId: string
): string | undefined => {
  return f.objectMapping.get(objectId);
};

/**
 * Map a morphism from source category to target category
 */
export const mapMorphism = (
  f: Functor,
  morphismId: string
): string | undefined => {
  return f.morphismMapping.get(morphismId);
};

/**
 * Get a copy of the object mapping (to maintain immutability)
 */
export const getObjectMapping = (f: Functor): Map<string, string> => {
  return new Map(f.objectMapping);
};

/**
 * Get a copy of the morphism mapping (to maintain immutability)
 */
export const getMorphismMapping = (f: Functor): Map<string, string> => {
  return new Map(f.morphismMapping);
};

// Backward compatibility
export const Functor = {
  create: createFunctor,
};
