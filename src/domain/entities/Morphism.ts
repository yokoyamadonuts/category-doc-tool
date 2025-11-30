/**
 * Morphism Entity
 * Implements: REQ-CAT-001, REQ-CAT-002
 *
 * Represents a morphism (arrow) in category theory.
 * This is an immutable value type with no external dependencies.
 *
 * @see tests/domain/Morphism.test.ts - TEST-MORPH-001 to TEST-MORPH-006
 */

/**
 * Immutable data structure representing a morphism
 */
export type Morphism = Readonly<{
  id: string;
  name: string;
  source: string;
  target: string;
  metadata: Readonly<Record<string, unknown>>;
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
 * Creates a deep copy of metadata for immutability
 */
const copyMetadata = (
  metadata: Record<string, unknown>
): Readonly<Record<string, unknown>> => {
  return Object.freeze(JSON.parse(JSON.stringify(metadata)));
};

/**
 * Creates a new Morphism with validation
 */
export const createMorphism = (
  id: string,
  name: string,
  source: string,
  target: string,
  metadata: Record<string, unknown> = {}
): Morphism => {
  return Object.freeze({
    id: validateNonEmptyString(id, "id"),
    name: validateNonEmptyString(name, "name"),
    source: validateNonEmptyString(source, "source"),
    target: validateNonEmptyString(target, "target"),
    metadata: copyMetadata(metadata),
  });
};

// Accessor functions

export const getId = (m: Morphism): string => m.id;
export const getName = (m: Morphism): string => m.name;
export const getSource = (m: Morphism): string => m.source;
export const getTarget = (m: Morphism): string => m.target;
export const getMetadata = (m: Morphism): Record<string, unknown> => {
  return JSON.parse(JSON.stringify(m.metadata));
};

/**
 * Compose two morphisms.
 * For f: A → B and g: B → C, returns g∘f: A → C
 *
 * @param f First morphism
 * @param g Second morphism (must have source === f.target)
 * @returns The composed morphism, or null if composition is not possible
 */
export const compose = (f: Morphism, g: Morphism): Morphism | null => {
  if (f.target !== g.source) {
    return null;
  }

  return createMorphism(
    `composed-${f.id}-${g.id}`,
    `${g.name}∘${f.name}`,
    f.source,
    g.target
  );
};

/**
 * Create an identity morphism for an object.
 * The identity morphism has the same source and target.
 *
 * @param objectId The object id for which to create the identity morphism
 * @returns The identity morphism
 */
export const createIdentity = (objectId: string): Morphism => {
  return createMorphism(
    `id-${objectId}`,
    `id_${objectId}`,
    objectId,
    objectId
  );
};

// Backward compatibility
export const Morphism = {
  create: createMorphism,
  identity: createIdentity,
};
