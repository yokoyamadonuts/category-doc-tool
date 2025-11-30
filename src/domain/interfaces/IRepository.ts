/**
 * Repository Interfaces
 * Implements: REQ-SYS-001
 *
 * Abstract interfaces for data access following Clean Architecture.
 * These interfaces define the contract for persistence operations
 * without specifying implementation details.
 *
 * Implementations will be provided in the infrastructure layer
 * (Neo4j for graph data, Turso for metadata).
 */

import type { CategoryObject } from "../entities/Object";
import type { Morphism } from "../entities/Morphism";
import type { Category } from "../entities/Category";
import type { Functor } from "../entities/Functor";
import type { NaturalTransformation } from "../entities/NaturalTransformation";

/**
 * Repository for CategoryObject entities
 */
export interface IObjectRepository {
  /**
   * Find all objects
   */
  findAll(): Promise<CategoryObject[]>;

  /**
   * Find an object by its id
   */
  findById(id: string): Promise<CategoryObject | null>;

  /**
   * Find all objects belonging to a category
   */
  findByCategoryId(categoryId: string): Promise<CategoryObject[]>;

  /**
   * Find objects by domain
   */
  findByDomain(domain: string): Promise<CategoryObject[]>;

  /**
   * Save an object (create or update)
   */
  save(obj: CategoryObject): Promise<void>;

  /**
   * Delete an object by id
   */
  delete(id: string): Promise<void>;
}

/**
 * Repository for Morphism entities
 */
export interface IMorphismRepository {
  /**
   * Find all morphisms
   */
  findAll(): Promise<Morphism[]>;

  /**
   * Find a morphism by its id
   */
  findById(id: string): Promise<Morphism | null>;

  /**
   * Find morphisms with given source and target
   */
  findBySourceAndTarget(source: string, target: string): Promise<Morphism[]>;

  /**
   * Find all morphisms with given source
   */
  findBySource(source: string): Promise<Morphism[]>;

  /**
   * Find all morphisms with given target
   */
  findByTarget(target: string): Promise<Morphism[]>;

  /**
   * Find a composable path of morphisms from source to target
   */
  findComposablePath(source: string, target: string): Promise<Morphism[]>;

  /**
   * Save a morphism (create or update)
   */
  save(morphism: Morphism): Promise<void>;

  /**
   * Delete a morphism by id
   */
  delete(id: string): Promise<void>;
}

/**
 * Repository for Category entities
 */
export interface ICategoryRepository {
  /**
   * Find all categories
   */
  findAll(): Promise<Category[]>;

  /**
   * Find a category by its id
   */
  findById(id: string): Promise<Category | null>;

  /**
   * Find a category by its name
   */
  findByName(name: string): Promise<Category | null>;

  /**
   * Save a category (create or update)
   */
  save(category: Category): Promise<void>;

  /**
   * Delete a category by id
   */
  delete(id: string): Promise<void>;
}

/**
 * Repository for Functor entities
 */
export interface IFunctorRepository {
  /**
   * Find all functors
   */
  findAll(): Promise<Functor[]>;

  /**
   * Find a functor by its id
   */
  findById(id: string): Promise<Functor | null>;

  /**
   * Find functors with given source category
   */
  findBySourceCategory(categoryId: string): Promise<Functor[]>;

  /**
   * Find functors with given target category
   */
  findByTargetCategory(categoryId: string): Promise<Functor[]>;

  /**
   * Find functors between two categories
   */
  findBetweenCategories(
    sourceCategoryId: string,
    targetCategoryId: string
  ): Promise<Functor[]>;

  /**
   * Save a functor (create or update)
   */
  save(functor: Functor): Promise<void>;

  /**
   * Delete a functor by id
   */
  delete(id: string): Promise<void>;
}

/**
 * Repository for NaturalTransformation entities
 */
export interface INaturalTransformationRepository {
  /**
   * Find all natural transformations
   */
  findAll(): Promise<NaturalTransformation[]>;

  /**
   * Find a natural transformation by its id
   */
  findById(id: string): Promise<NaturalTransformation | null>;

  /**
   * Find natural transformations with given source functor
   */
  findBySourceFunctor(functorId: string): Promise<NaturalTransformation[]>;

  /**
   * Find natural transformations with given target functor
   */
  findByTargetFunctor(functorId: string): Promise<NaturalTransformation[]>;

  /**
   * Find natural transformations between two functors
   */
  findBetweenFunctors(
    sourceFunctorId: string,
    targetFunctorId: string
  ): Promise<NaturalTransformation[]>;

  /**
   * Save a natural transformation (create or update)
   */
  save(natTrans: NaturalTransformation): Promise<void>;

  /**
   * Delete a natural transformation by id
   */
  delete(id: string): Promise<void>;
}

/**
 * Unit of Work pattern for transaction management
 */
export interface IUnitOfWork {
  /**
   * Begin a transaction
   */
  begin(): Promise<void>;

  /**
   * Commit the current transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback the current transaction
   */
  rollback(): Promise<void>;

  /**
   * Get object repository
   */
  readonly objects: IObjectRepository;

  /**
   * Get morphism repository
   */
  readonly morphisms: IMorphismRepository;

  /**
   * Get category repository
   */
  readonly categories: ICategoryRepository;

  /**
   * Get functor repository
   */
  readonly functors: IFunctorRepository;

  /**
   * Get natural transformation repository
   */
  readonly naturalTransformations: INaturalTransformationRepository;
}
