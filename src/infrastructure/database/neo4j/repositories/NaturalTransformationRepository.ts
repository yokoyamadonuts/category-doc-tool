/**
 * Neo4j NaturalTransformation Repository
 * Implements: REQ-SYS-001
 *
 * Repository implementation for NaturalTransformation entities using Neo4j.
 * Components are stored as JSON properties on the NaturalTransformation node.
 */

import type { INaturalTransformationRepository } from "../../../../domain/interfaces/IRepository";
import {
  type NaturalTransformation,
  createNaturalTransformation,
} from "../../../../domain/entities/NaturalTransformation";
import { Neo4jConnection } from "../connection";
import { NodeLabels, RelationshipTypes } from "../schema";

/**
 * Neo4j implementation of INaturalTransformationRepository
 */
export class NaturalTransformationRepository
  implements INaturalTransformationRepository
{
  constructor(private readonly connection: Neo4jConnection) {}

  async findAll(): Promise<NaturalTransformation[]> {
    const result = await this.connection.executeQuery(
      `MATCH (n:${NodeLabels.NATURAL_TRANSFORMATION}) RETURN n`
    );

    return result.records.map((record) => this.recordToEntity(record.get("n")));
  }

  async findById(id: string): Promise<NaturalTransformation | null> {
    const result = await this.connection.executeQuery(
      `MATCH (n:${NodeLabels.NATURAL_TRANSFORMATION} {id: $id}) RETURN n`,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    return this.recordToEntity(result.records[0].get("n"));
  }

  async findBySourceFunctor(functorId: string): Promise<NaturalTransformation[]> {
    const result = await this.connection.executeQuery(
      `MATCH (n:${NodeLabels.NATURAL_TRANSFORMATION} {sourceFunctor: $functorId})
       RETURN n`,
      { functorId }
    );

    return result.records.map((record) => this.recordToEntity(record.get("n")));
  }

  async findByTargetFunctor(functorId: string): Promise<NaturalTransformation[]> {
    const result = await this.connection.executeQuery(
      `MATCH (n:${NodeLabels.NATURAL_TRANSFORMATION} {targetFunctor: $functorId})
       RETURN n`,
      { functorId }
    );

    return result.records.map((record) => this.recordToEntity(record.get("n")));
  }

  async findBetweenFunctors(
    sourceFunctorId: string,
    targetFunctorId: string
  ): Promise<NaturalTransformation[]> {
    const result = await this.connection.executeQuery(
      `MATCH (n:${NodeLabels.NATURAL_TRANSFORMATION} {sourceFunctor: $source, targetFunctor: $target})
       RETURN n`,
      { source: sourceFunctorId, target: targetFunctorId }
    );

    return result.records.map((record) => this.recordToEntity(record.get("n")));
  }

  async save(natTrans: NaturalTransformation): Promise<void> {
    // Convert Map to JSON-serializable object
    const componentsObj: Record<string, string> = {};
    for (const [key, value] of natTrans.components) {
      componentsObj[key] = value;
    }

    await this.connection.executeQuery(
      `MERGE (n:${NodeLabels.NATURAL_TRANSFORMATION} {id: $id})
       SET n.name = $name,
           n.sourceFunctor = $sourceFunctor,
           n.targetFunctor = $targetFunctor,
           n.components = $components`,
      {
        id: natTrans.id,
        name: natTrans.name,
        sourceFunctor: natTrans.sourceFunctor,
        targetFunctor: natTrans.targetFunctor,
        components: JSON.stringify(componentsObj),
      }
    );

    // Create relationships to functors
    await this.connection.executeQuery(
      `MATCH (n:${NodeLabels.NATURAL_TRANSFORMATION} {id: $id})
       MATCH (sf:${NodeLabels.FUNCTOR} {id: $sourceFunctor})
       MATCH (tf:${NodeLabels.FUNCTOR} {id: $targetFunctor})
       MERGE (n)-[:${RelationshipTypes.SOURCE_FUNCTOR}]->(sf)
       MERGE (n)-[:${RelationshipTypes.TARGET_FUNCTOR}]->(tf)`,
      {
        id: natTrans.id,
        sourceFunctor: natTrans.sourceFunctor,
        targetFunctor: natTrans.targetFunctor,
      }
    );
  }

  async delete(id: string): Promise<void> {
    await this.connection.executeQuery(
      `MATCH (n:${NodeLabels.NATURAL_TRANSFORMATION} {id: $id}) DETACH DELETE n`,
      { id }
    );
  }

  /**
   * Convert Neo4j record to NaturalTransformation entity
   */
  private recordToEntity(record: unknown): NaturalTransformation {
    const node = record as {
      properties: {
        id: string;
        name: string;
        sourceFunctor: string;
        targetFunctor: string;
        components?: string;
      };
    };

    const props = node.properties;

    const componentsObj = props.components ? JSON.parse(props.components) : {};
    const components = new Map<string, string>(Object.entries(componentsObj));

    return createNaturalTransformation(
      props.id,
      props.name,
      props.sourceFunctor,
      props.targetFunctor,
      components
    );
  }
}
