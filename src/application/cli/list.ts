/**
 * CLI List Command
 * Implements: REQ-DOC-002
 *
 * List objects, morphisms, and categories.
 */

import type { CategoryObject } from "../../domain/entities/Object";
import type { Morphism } from "../../domain/entities/Morphism";
import type { Category } from "../../domain/entities/Category";

// =============================================================================
// Types
// =============================================================================

/**
 * List options
 */
export type ListOptions = {
  domain?: string;
  source?: string;
  target?: string;
  format?: "table" | "json";
  limit?: number;
  offset?: number;
};

/**
 * List result for objects
 */
export type ObjectListResult = {
  items: CategoryObject[];
  totalCount: number;
  format: "table" | "json";
};

/**
 * List result for morphisms
 */
export type MorphismListResult = {
  items: Morphism[];
  totalCount: number;
  format: "table" | "json";
};

/**
 * Category summary for listing
 */
export type CategorySummary = {
  id: string;
  name: string;
  objectCount: number;
  morphismCount: number;
};

/**
 * List result for categories
 */
export type CategoryListResult = {
  items: CategorySummary[];
  totalCount: number;
  format: "table" | "json";
};

/**
 * Generic list result
 */
export type ListResult<T> = {
  items: T[];
  totalCount: number;
  format: "table" | "json";
};

// =============================================================================
// List Functions
// =============================================================================

/**
 * List objects with optional filtering
 */
export function listObjects(
  objects: CategoryObject[],
  options: ListOptions = {}
): ObjectListResult {
  const { domain, format = "table", limit, offset = 0 } = options;

  let filtered = objects;

  // Filter by domain
  if (domain) {
    filtered = filtered.filter((obj) => obj.domain === domain);
  }

  const totalCount = filtered.length;

  // Apply pagination
  let paginated = filtered.slice(offset);
  if (limit !== undefined) {
    paginated = paginated.slice(0, limit);
  }

  return {
    items: paginated,
    totalCount,
    format,
  };
}

/**
 * List morphisms with optional filtering
 */
export function listMorphisms(
  morphisms: Morphism[],
  options: ListOptions = {}
): MorphismListResult {
  const { source, target, format = "table", limit, offset = 0 } = options;

  let filtered = morphisms;

  // Filter by source
  if (source) {
    filtered = filtered.filter((m) => m.source === source);
  }

  // Filter by target
  if (target) {
    filtered = filtered.filter((m) => m.target === target);
  }

  const totalCount = filtered.length;

  // Apply pagination
  let paginated = filtered.slice(offset);
  if (limit !== undefined) {
    paginated = paginated.slice(0, limit);
  }

  return {
    items: paginated,
    totalCount,
    format,
  };
}

/**
 * List categories with summary information
 */
export function listCategories(
  categories: Category[],
  options: ListOptions = {}
): CategoryListResult {
  const { format = "table", limit, offset = 0 } = options;

  const summaries: CategorySummary[] = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    objectCount: cat.objects.length,
    morphismCount: cat.morphisms.length,
  }));

  const totalCount = summaries.length;

  // Apply pagination
  let paginated = summaries.slice(offset);
  if (limit !== undefined) {
    paginated = paginated.slice(0, limit);
  }

  return {
    items: paginated,
    totalCount,
    format,
  };
}
