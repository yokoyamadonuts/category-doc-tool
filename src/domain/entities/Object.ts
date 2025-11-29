/**
 * CategoryObject Entity
 * Implements: REQ-DOC-001, REQ-DOC-002
 *
 * Represents an object in category theory (a document in CatDoc).
 * This is an immutable value type with no external dependencies.
 *
 * @see tests/domain/Object.test.ts - TEST-OBJ-001 to TEST-OBJ-005
 */

/**
 * Immutable data structure representing a category object
 */
export type CategoryObject = Readonly<{
  id: string;
  title: string;
  domain: string;
  metadata: Readonly<Record<string, unknown>>;
  content: string | undefined;
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
 * Creates a new CategoryObject with validation
 */
export const createCategoryObject = (
  id: string,
  title: string,
  domain: string,
  metadata: Record<string, unknown> = {},
  content?: string
): CategoryObject => {
  return Object.freeze({
    id: validateNonEmptyString(id, "id"),
    title: validateNonEmptyString(title, "title"),
    domain: validateNonEmptyString(domain, "domain"),
    metadata: copyMetadata(metadata),
    content,
  });
};

// Accessor functions for consistency and potential future logic

/**
 * Get the unique identifier
 */
export const getId = (obj: CategoryObject): string => obj.id;

/**
 * Get the title
 */
export const getTitle = (obj: CategoryObject): string => obj.title;

/**
 * Get the domain this object belongs to
 */
export const getDomain = (obj: CategoryObject): string => obj.domain;

/**
 * Get a copy of the metadata (to maintain immutability)
 */
export const getMetadata = (
  obj: CategoryObject
): Record<string, unknown> => {
  return JSON.parse(JSON.stringify(obj.metadata));
};

/**
 * Get the content
 */
export const getContent = (obj: CategoryObject): string | undefined =>
  obj.content;

// Re-export class-like interface for backward compatibility
export const CategoryObject = {
  create: createCategoryObject,
};
