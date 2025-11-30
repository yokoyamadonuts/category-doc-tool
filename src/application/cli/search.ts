/**
 * CLI Search Command
 * Implements: REQ-DOC-002, REQ-SEARCH-001
 *
 * Search objects, functors, and natural transformations.
 */

import type { CategoryObject } from "../../domain/entities/Object";
import type { Functor } from "../../domain/entities/Functor";
import type { NaturalTransformation } from "../../domain/entities/NaturalTransformation";

// =============================================================================
// Types
// =============================================================================

/**
 * Search options
 */
export type SearchOptions = {
  query: string;
  domain?: string;
  limit?: number;
};

/**
 * Search result for objects
 */
export type SearchResult = {
  query: string;
  matches: CategoryObject[];
  totalMatches: number;
  searchTime: number;
};

/**
 * Functor search result
 */
export type FunctorSearchResult = {
  found: boolean;
  mappedTo?: string;
  type?: "object" | "morphism";
  functor?: string;
};

/**
 * Natural transformation search result
 */
export type NaturalTransformationSearchResult = {
  found: boolean;
  component?: string;
  sourceFunctor?: string;
  targetFunctor?: string;
};

// =============================================================================
// Search Functions
// =============================================================================

/**
 * Search objects by keyword
 */
export function searchObjects(
  objects: CategoryObject[],
  options: SearchOptions
): SearchResult {
  const startTime = performance.now();
  const { query, domain, limit = 100 } = options;

  let matches = objects;

  // Filter by domain if specified
  if (domain) {
    matches = matches.filter((obj) => obj.domain === domain);
  }

  // Filter by query
  if (query && query.trim() !== "") {
    const lowerQuery = query.toLowerCase();
    matches = matches.filter((obj) => {
      const searchableText = [
        obj.id,
        obj.title,
        obj.domain,
        obj.content || "",
      ]
        .join(" ")
        .toLowerCase();
      return searchableText.includes(lowerQuery);
    });
  }

  // Apply limit
  const limitedMatches = matches.slice(0, limit);

  const endTime = performance.now();

  return {
    query,
    matches: limitedMatches,
    totalMatches: matches.length,
    searchTime: endTime - startTime,
  };
}

/**
 * Search by functor mapping
 */
export function searchByFunctor(
  functor: Functor,
  sourceId: string
): FunctorSearchResult {
  // Check object mapping first
  const objectMapping = functor.objectMapping.get(sourceId);
  if (objectMapping) {
    return {
      found: true,
      mappedTo: objectMapping,
      type: "object",
      functor: functor.id,
    };
  }

  // Check morphism mapping
  const morphismMapping = functor.morphismMapping.get(sourceId);
  if (morphismMapping) {
    return {
      found: true,
      mappedTo: morphismMapping,
      type: "morphism",
      functor: functor.id,
    };
  }

  return {
    found: false,
  };
}

/**
 * Search by natural transformation component
 */
export function searchByNaturalTransformation(
  natTrans: NaturalTransformation,
  objectId: string
): NaturalTransformationSearchResult {
  const component = natTrans.components.get(objectId);

  if (component) {
    return {
      found: true,
      component,
      sourceFunctor: natTrans.sourceFunctor,
      targetFunctor: natTrans.targetFunctor,
    };
  }

  return {
    found: false,
    sourceFunctor: natTrans.sourceFunctor,
    targetFunctor: natTrans.targetFunctor,
  };
}
