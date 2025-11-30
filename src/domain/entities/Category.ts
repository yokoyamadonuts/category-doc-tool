/**
 * Category Entity
 * Implements: REQ-CAT-001, REQ-CAT-003
 *
 * Represents a category in category theory.
 * A category consists of objects and morphisms (arrows) between them.
 * This is an immutable value type with no external dependencies.
 *
 * @see tests/domain/Category.test.ts - TEST-CAT-001 to TEST-CAT-007
 */

import type { CategoryObject } from "./Object";
import type { Morphism } from "./Morphism";

/**
 * Immutable data structure representing a category
 */
export type Category = Readonly<{
  id: string;
  name: string;
  objects: ReadonlyArray<CategoryObject>;
  morphisms: ReadonlyArray<Morphism>;
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
 * Creates a new Category with validation
 */
export const createCategory = (
  id: string,
  name: string,
  objects: ReadonlyArray<CategoryObject> = [],
  morphisms: ReadonlyArray<Morphism> = []
): Category => {
  return Object.freeze({
    id: validateNonEmptyString(id, "id"),
    name: validateNonEmptyString(name, "name"),
    objects: Object.freeze([...objects]),
    morphisms: Object.freeze([...morphisms]),
  });
};

// Accessor functions

export const getId = (c: Category): string => c.id;
export const getName = (c: Category): string => c.name;

/**
 * Get a copy of all objects (to maintain immutability)
 */
export const getObjects = (c: Category): CategoryObject[] => [...c.objects];

/**
 * Get a copy of all morphisms (to maintain immutability)
 */
export const getMorphisms = (c: Category): Morphism[] => [...c.morphisms];

/**
 * Find an object by its id
 */
export const getObject = (
  c: Category,
  id: string
): CategoryObject | undefined => {
  return c.objects.find((obj) => obj.id === id);
};

/**
 * Find a morphism by its id
 */
export const getMorphism = (
  c: Category,
  id: string
): Morphism | undefined => {
  return c.morphisms.find((m) => m.id === id);
};

/**
 * Find all morphisms with a given source object
 */
export const getMorphismsBySource = (
  c: Category,
  objectId: string
): Morphism[] => {
  return c.morphisms.filter((m) => m.source === objectId);
};

/**
 * Find all morphisms with a given target object
 */
export const getMorphismsByTarget = (
  c: Category,
  objectId: string
): Morphism[] => {
  return c.morphisms.filter((m) => m.target === objectId);
};

// Backward compatibility
export const Category = {
  create: createCategory,
};
