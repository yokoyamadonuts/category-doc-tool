/**
 * TraversalService
 * Implements: REQ-SEARCH-001
 *
 * Pure domain service for path finding in categories.
 * - Find morphism paths between objects
 * - Find transformation paths through functors and natural transformations
 *
 * @see tests/domain/services/TraversalService.test.ts - TEST-TRAV-001 to TEST-TRAV-004
 */

import type { Category } from "../entities/Category";
import type { Morphism } from "../entities/Morphism";
import type { Functor } from "../entities/Functor";
import type { NaturalTransformation } from "../entities/NaturalTransformation";

/**
 * Represents a path through functors and natural transformations
 */
export type TransformationPath = {
  steps: Array<Functor | NaturalTransformation>;
  resultObject: string;
};

/**
 * Maximum depth for path searches to prevent infinite loops
 */
const MAX_DEPTH = 10;

/**
 * Find a path from source to target object using BFS
 *
 * @param source Source object id
 * @param target Target object id
 * @param category The category to search in
 * @returns Array of morphisms forming the path, empty if no path exists
 */
export const findPath = (
  source: string,
  target: string,
  category: Category
): Morphism[] => {
  // Same source and target - no path needed
  if (source === target) {
    return [];
  }

  // Check if source and target exist
  const objectIds = new Set(category.objects.map((o) => o.id));
  if (!objectIds.has(source) || !objectIds.has(target)) {
    return [];
  }

  // Build adjacency list of non-identity morphisms
  const adjacency = new Map<string, Morphism[]>();
  for (const obj of category.objects) {
    adjacency.set(obj.id, []);
  }
  for (const m of category.morphisms) {
    // Skip identity morphisms
    if (m.source !== m.target) {
      adjacency.get(m.source)?.push(m);
    }
  }

  // BFS to find shortest path
  const visited = new Set<string>();
  const queue: Array<{ objectId: string; path: Morphism[] }> = [
    { objectId: source, path: [] },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.objectId === target) {
      return current.path;
    }

    if (visited.has(current.objectId)) {
      continue;
    }
    visited.add(current.objectId);

    const outgoing = adjacency.get(current.objectId) || [];
    for (const morphism of outgoing) {
      if (!visited.has(morphism.target)) {
        queue.push({
          objectId: morphism.target,
          path: [...current.path, morphism],
        });
      }
    }
  }

  return [];
};

/**
 * Find all paths from source to target object
 *
 * @param source Source object id
 * @param target Target object id
 * @param category The category to search in
 * @param maxDepth Maximum path length (default: MAX_DEPTH)
 * @returns Array of paths, each path is an array of morphisms. Sorted by length.
 */
export const findAllPaths = (
  source: string,
  target: string,
  category: Category,
  maxDepth: number = MAX_DEPTH
): Morphism[][] => {
  // Same source and target - no paths
  if (source === target) {
    return [];
  }

  // Check if source and target exist
  const objectIds = new Set(category.objects.map((o) => o.id));
  if (!objectIds.has(source) || !objectIds.has(target)) {
    return [];
  }

  // Build adjacency list of non-identity morphisms
  const adjacency = new Map<string, Morphism[]>();
  for (const obj of category.objects) {
    adjacency.set(obj.id, []);
  }
  for (const m of category.morphisms) {
    if (m.source !== m.target) {
      adjacency.get(m.source)?.push(m);
    }
  }

  const allPaths: Morphism[][] = [];

  // DFS to find all paths
  const dfs = (current: string, path: Morphism[], visited: Set<string>) => {
    if (path.length > maxDepth) {
      return;
    }

    if (current === target) {
      allPaths.push([...path]);
      return;
    }

    const outgoing = adjacency.get(current) || [];
    for (const morphism of outgoing) {
      if (!visited.has(morphism.target)) {
        visited.add(morphism.target);
        path.push(morphism);
        dfs(morphism.target, path, visited);
        path.pop();
        visited.delete(morphism.target);
      }
    }
  };

  const visited = new Set<string>([source]);
  dfs(source, [], visited);

  // Sort by path length
  allPaths.sort((a, b) => a.length - b.length);

  return allPaths;
};

/**
 * Find transformation paths from an object to a target category
 * through functors and natural transformations
 *
 * @param sourceObj Source object id
 * @param targetCat Target category id
 * @param categories All available categories
 * @param functors All available functors
 * @param natTransforms All available natural transformations
 * @returns Array of transformation paths
 */
export const findDomainPath = (
  sourceObj: string,
  targetCat: string,
  categories: Category[],
  functors: Functor[],
  natTransforms: NaturalTransformation[]
): TransformationPath[] => {
  const paths: TransformationPath[] = [];

  // Find which category contains the source object
  let sourceCategory: Category | undefined;
  for (const cat of categories) {
    if (cat.objects.some((o) => o.id === sourceObj)) {
      sourceCategory = cat;
      break;
    }
  }

  if (!sourceCategory) {
    return [];
  }

  // If source object is already in target category
  if (sourceCategory.id === targetCat) {
    paths.push({
      steps: [],
      resultObject: sourceObj,
    });
  }

  // Build functor graph: category id → [functors from this category]
  const functorGraph = new Map<string, Functor[]>();
  for (const f of functors) {
    if (!functorGraph.has(f.sourceCategory)) {
      functorGraph.set(f.sourceCategory, []);
    }
    functorGraph.get(f.sourceCategory)!.push(f);
  }

  // BFS through functors
  const visited = new Set<string>();
  const queue: Array<{
    categoryId: string;
    objectId: string;
    steps: Array<Functor | NaturalTransformation>;
  }> = [
    {
      categoryId: sourceCategory.id,
      objectId: sourceObj,
      steps: [],
    },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const stateKey = `${current.categoryId}:${current.objectId}`;

    if (visited.has(stateKey)) {
      continue;
    }
    visited.add(stateKey);

    // Check if we've reached the target category
    if (current.categoryId === targetCat && current.steps.length > 0) {
      paths.push({
        steps: [...current.steps],
        resultObject: current.objectId,
      });
      continue;
    }

    // Depth limit
    if (current.steps.length >= MAX_DEPTH) {
      continue;
    }

    // Explore functors from current category
    const outgoingFunctors = functorGraph.get(current.categoryId) || [];
    for (const functor of outgoingFunctors) {
      const mappedObj = functor.objectMapping.get(current.objectId);
      if (mappedObj !== undefined) {
        queue.push({
          categoryId: functor.targetCategory,
          objectId: mappedObj,
          steps: [...current.steps, functor],
        });
      }
    }

    // Explore natural transformations
    // Natural transformations don't change category, but can change the functor view
    for (const natTrans of natTransforms) {
      const component = natTrans.components.get(current.objectId);
      if (component !== undefined) {
        // Natural transformation keeps us in the same category but adds a step
        // This is mainly for tracking the transformation path
        const newSteps = [...current.steps, natTrans];
        if (current.categoryId === targetCat) {
          paths.push({
            steps: newSteps,
            resultObject: current.objectId,
          });
        }
      }
    }
  }

  // Sort by number of steps
  paths.sort((a, b) => a.steps.length - b.steps.length);

  return paths;
};
