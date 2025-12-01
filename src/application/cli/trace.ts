/**
 * CLI Trace Command
 * Implements: REQ-SEARCH-001
 *
 * Trace paths within categories and across domains through functors.
 */

import type { Category } from "../../domain/entities/Category";
import type { Morphism } from "../../domain/entities/Morphism";
import type { Functor } from "../../domain/entities/Functor";
import type { NaturalTransformation } from "../../domain/entities/NaturalTransformation";
import {
  findPath,
  findAllPaths,
  findDomainPath,
} from "../../domain/services/TraversalService";

// =============================================================================
// Types
// =============================================================================

/**
 * Trace options
 */
export type TraceOptions = {
  findAll?: boolean;
  maxDepth?: number;
};

/**
 * Trace result within a category
 */
export type TraceResult = {
  source: string;
  target: string;
  found: boolean;
  paths: Morphism[][];
  shortestPath?: Morphism[];
  shortestPathLength?: number;
};

/**
 * Step in a domain path
 */
export type DomainPathStep = {
  type: "functor" | "natural_transformation";
  id: string;
  name: string;
  fromObject?: string;
  toObject?: string;
};

/**
 * Domain path result
 */
export type DomainPath = {
  steps: DomainPathStep[];
  resultObject: string;
  targetCategory: string;
};

/**
 * Domain trace result
 */
export type DomainTraceResult = {
  source: string;
  targetCategory: string;
  found: boolean;
  paths: DomainPath[];
};

// =============================================================================
// Trace Functions
// =============================================================================

/**
 * Trace path within a category
 */
export function tracePath(
  source: string,
  target: string,
  category: Category,
  options: TraceOptions = {}
): TraceResult {
  const { findAll: shouldFindAll = false, maxDepth = 10 } = options;

  // Handle self-path
  if (source === target) {
    // Look for identity morphism
    const identity = category.morphisms.find(
      (m) => m.source === source && m.target === target
    );
    if (identity) {
      return {
        source,
        target,
        found: true,
        paths: [[identity]],
        shortestPath: [identity],
        shortestPathLength: 1,
      };
    }
    // Even without identity, self-path exists trivially
    return {
      source,
      target,
      found: true,
      paths: [[]],
      shortestPath: [],
      shortestPathLength: 0,
    };
  }

  let paths: Morphism[][];

  if (shouldFindAll) {
    paths = findAllPaths(source, target, category, maxDepth);
  } else {
    const singlePath = findPath(source, target, category);
    paths = singlePath.length > 0 ? [singlePath] : [];
  }

  if (paths.length === 0) {
    return {
      source,
      target,
      found: false,
      paths: [],
    };
  }

  // Find shortest path
  const sortedPaths = [...paths].sort((a, b) => a.length - b.length);
  const shortestPath = sortedPaths[0]!;

  return {
    source,
    target,
    found: true,
    paths,
    shortestPath,
    shortestPathLength: shortestPath.length,
  };
}

/**
 * Trace domain path through functors and natural transformations
 */
export function traceDomainPath(
  sourceObject: string,
  targetCategory: string,
  categories: Category[],
  functors: Functor[],
  naturalTransformations: NaturalTransformation[]
): DomainTraceResult {
  // Build category map for lookup (for future use in extended path finding)
  const _categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Find which category the source object belongs to
  let sourceCategory: Category | undefined;
  for (const cat of categories) {
    if (cat.objects.some((obj) => obj.id === sourceObject)) {
      sourceCategory = cat;
      break;
    }
  }

  if (!sourceCategory) {
    return {
      source: sourceObject,
      targetCategory,
      found: false,
      paths: [],
    };
  }

  // If already in target category
  if (sourceCategory.id === targetCategory) {
    return {
      source: sourceObject,
      targetCategory,
      found: true,
      paths: [
        {
          steps: [],
          resultObject: sourceObject,
          targetCategory,
        },
      ],
    };
  }

  // Use TraversalService to find domain paths
  const domainPaths = findDomainPath(
    sourceObject,
    targetCategory,
    categories,
    functors,
    naturalTransformations
  );

  if (domainPaths.length === 0) {
    return {
      source: sourceObject,
      targetCategory,
      found: false,
      paths: [],
    };
  }

  // Convert to DomainPath format
  const paths: DomainPath[] = domainPaths.map((path) => ({
    steps: path.steps.map((step) => {
      if ("objectMapping" in step) {
        // It's a Functor
        const functor = step as Functor;
        return {
          type: "functor" as const,
          id: functor.id,
          name: functor.name,
        };
      } else {
        // It's a NaturalTransformation
        const natTrans = step as NaturalTransformation;
        return {
          type: "natural_transformation" as const,
          id: natTrans.id,
          name: natTrans.name,
        };
      }
    }),
    resultObject: path.resultObject,
    targetCategory,
  }));

  return {
    source: sourceObject,
    targetCategory,
    found: true,
    paths,
  };
}
