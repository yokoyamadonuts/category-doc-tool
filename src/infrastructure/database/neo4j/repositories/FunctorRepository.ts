/**
 * Neo4j Functor Repository
 * Implements: REQ-SYS-001
 *
 * Repository implementation for Functor entities using Neo4j.
 * Mappings are stored as JSON properties on the Functor node.
 */

import type { IFunctorRepository } from "../../../../domain/interfaces/IRepository";
import {
  type Functor,
  createFunctor,
} from "../../../../domain/entities/Functor";
import { Neo4jConnection } from "../connection";
import { NodeLabels, RelationshipTypes } from "../schema";

/**
 * Neo4j implementation of IFunctorRepository
 */
export class FunctorRepository implements IFunctorRepository {
  constructor(private readonly connection: Neo4jConnection) {}

  async findAll(): Promise<Functor[]> {
    const result = await this.connection.executeQuery(
      `MATCH (f:${NodeLabels.FUNCTOR}) RETURN f`
    );

    return result.records.map((record) => this.recordToEntity(record.get("f")));
  }

  async findById(id: string): Promise<Functor | null> {
    const result = await this.connection.executeQuery(
      `MATCH (f:${NodeLabels.FUNCTOR} {id: $id}) RETURN f`,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    return this.recordToEntity(result.records[0].get("f"));
  }

  async findBySourceCategory(categoryId: string): Promise<Functor[]> {
    const result = await this.connection.executeQuery(
      `MATCH (f:${NodeLabels.FUNCTOR} {sourceCategory: $categoryId}) RETURN f`,
      { categoryId }
    );

    return result.records.map((record) => this.recordToEntity(record.get("f")));
  }

  async findByTargetCategory(categoryId: string): Promise<Functor[]> {
    const result = await this.connection.executeQuery(
      `MATCH (f:${NodeLabels.FUNCTOR} {targetCategory: $categoryId}) RETURN f`,
      { categoryId }
    );

    return result.records.map((record) => this.recordToEntity(record.get("f")));
  }

  async findBetweenCategories(
    sourceCategoryId: string,
    targetCategoryId: string
  ): Promise<Functor[]> {
    const result = await this.connection.executeQuery(
      `MATCH (f:${NodeLabels.FUNCTOR} {sourceCategory: $source, targetCategory: $target})
       RETURN f`,
      { source: sourceCategoryId, target: targetCategoryId }
    );

    return result.records.map((record) => this.recordToEntity(record.get("f")));
  }

  async save(functor: Functor): Promise<void> {
    // Convert Maps to JSON-serializable objects
    const objectMappingObj: Record<string, string> = {};
    for (const [key, value] of functor.objectMapping) {
      objectMappingObj[key] = value;
    }

    const morphismMappingObj: Record<string, string> = {};
    for (const [key, value] of functor.morphismMapping) {
      morphismMappingObj[key] = value;
    }

    await this.connection.executeQuery(
      `MERGE (f:${NodeLabels.FUNCTOR} {id: $id})
       SET f.name = $name,
           f.sourceCategory = $sourceCategory,
           f.targetCategory = $targetCategory,
           f.objectMapping = $objectMapping,
           f.morphismMapping = $morphismMapping`,
      {
        id: functor.id,
        name: functor.name,
        sourceCategory: functor.sourceCategory,
        targetCategory: functor.targetCategory,
        objectMapping: JSON.stringify(objectMappingObj),
        morphismMapping: JSON.stringify(morphismMappingObj),
      }
    );

    // Create relationships to categories
    await this.connection.executeQuery(
      `MATCH (f:${NodeLabels.FUNCTOR} {id: $id})
       MATCH (sc:${NodeLabels.CATEGORY} {id: $sourceCategory})
       MATCH (tc:${NodeLabels.CATEGORY} {id: $targetCategory})
       MERGE (f)-[:${RelationshipTypes.FROM_CATEGORY}]->(sc)
       MERGE (f)-[:${RelationshipTypes.TO_CATEGORY}]->(tc)`,
      {
        id: functor.id,
        sourceCategory: functor.sourceCategory,
        targetCategory: functor.targetCategory,
      }
    );
  }

  async delete(id: string): Promise<void> {
    await this.connection.executeQuery(
      `MATCH (f:${NodeLabels.FUNCTOR} {id: $id}) DETACH DELETE f`,
      { id }
    );
  }

  /**
   * Convert Neo4j record to Functor entity
   */
  private recordToEntity(record: unknown): Functor {
    const node = record as {
      properties: {
        id: string;
        name: string;
        sourceCategory: string;
        targetCategory: string;
        objectMapping?: string;
        morphismMapping?: string;
      };
    };

    const props = node.properties;

    const objectMappingObj = props.objectMapping
      ? JSON.parse(props.objectMapping)
      : {};
    const morphismMappingObj = props.morphismMapping
      ? JSON.parse(props.morphismMapping)
      : {};

    const objectMapping = new Map<string, string>(
      Object.entries(objectMappingObj)
    );
    const morphismMapping = new Map<string, string>(
      Object.entries(morphismMappingObj)
    );

    return createFunctor(
      props.id,
      props.name,
      props.sourceCategory,
      props.targetCategory,
      objectMapping,
      morphismMapping
    );
  }
}
