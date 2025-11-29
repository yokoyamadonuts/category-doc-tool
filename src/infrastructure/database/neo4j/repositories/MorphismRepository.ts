/**
 * Neo4j Morphism Repository
 * Implements: REQ-SYS-001
 *
 * Repository implementation for Morphism entities using Neo4j.
 * Morphisms are stored as relationships between Object nodes.
 */

import type { IMorphismRepository } from "../../../../domain/interfaces/IRepository";
import {
  type Morphism,
  createMorphism,
} from "../../../../domain/entities/Morphism";
import { Neo4jConnection } from "../connection";
import { NodeLabels, RelationshipTypes } from "../schema";

/**
 * Neo4j implementation of IMorphismRepository
 */
export class MorphismRepository implements IMorphismRepository {
  constructor(private readonly connection: Neo4jConnection) {}

  async findAll(): Promise<Morphism[]> {
    const result = await this.connection.executeQuery(
      `MATCH (s:${NodeLabels.OBJECT})-[m:${RelationshipTypes.MORPHISM}]->(t:${NodeLabels.OBJECT})
       RETURN m, s.id as sourceId, t.id as targetId`
    );

    return result.records.map((record) =>
      this.recordToEntity(
        record.get("m"),
        record.get("sourceId") as string,
        record.get("targetId") as string
      )
    );
  }

  async findById(id: string): Promise<Morphism | null> {
    const result = await this.connection.executeQuery(
      `MATCH (s:${NodeLabels.OBJECT})-[m:${RelationshipTypes.MORPHISM} {id: $id}]->(t:${NodeLabels.OBJECT})
       RETURN m, s.id as sourceId, t.id as targetId`,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    const record = result.records[0];
    return this.recordToEntity(
      record.get("m"),
      record.get("sourceId") as string,
      record.get("targetId") as string
    );
  }

  async findBySourceAndTarget(
    source: string,
    target: string
  ): Promise<Morphism[]> {
    const result = await this.connection.executeQuery(
      `MATCH (s:${NodeLabels.OBJECT} {id: $source})-[m:${RelationshipTypes.MORPHISM}]->(t:${NodeLabels.OBJECT} {id: $target})
       RETURN m, s.id as sourceId, t.id as targetId`,
      { source, target }
    );

    return result.records.map((record) =>
      this.recordToEntity(
        record.get("m"),
        record.get("sourceId") as string,
        record.get("targetId") as string
      )
    );
  }

  async findBySource(source: string): Promise<Morphism[]> {
    const result = await this.connection.executeQuery(
      `MATCH (s:${NodeLabels.OBJECT} {id: $source})-[m:${RelationshipTypes.MORPHISM}]->(t:${NodeLabels.OBJECT})
       RETURN m, s.id as sourceId, t.id as targetId`,
      { source }
    );

    return result.records.map((record) =>
      this.recordToEntity(
        record.get("m"),
        record.get("sourceId") as string,
        record.get("targetId") as string
      )
    );
  }

  async findByTarget(target: string): Promise<Morphism[]> {
    const result = await this.connection.executeQuery(
      `MATCH (s:${NodeLabels.OBJECT})-[m:${RelationshipTypes.MORPHISM}]->(t:${NodeLabels.OBJECT} {id: $target})
       RETURN m, s.id as sourceId, t.id as targetId`,
      { target }
    );

    return result.records.map((record) =>
      this.recordToEntity(
        record.get("m"),
        record.get("sourceId") as string,
        record.get("targetId") as string
      )
    );
  }

  async findComposablePath(source: string, target: string): Promise<Morphism[]> {
    const result = await this.connection.executeQuery(
      `MATCH path = shortestPath(
         (s:${NodeLabels.OBJECT} {id: $source})-[:${RelationshipTypes.MORPHISM}*]->(t:${NodeLabels.OBJECT} {id: $target})
       )
       UNWIND relationships(path) as m
       WITH m, startNode(m) as sn, endNode(m) as tn
       RETURN m, sn.id as sourceId, tn.id as targetId`,
      { source, target }
    );

    return result.records.map((record) =>
      this.recordToEntity(
        record.get("m"),
        record.get("sourceId") as string,
        record.get("targetId") as string
      )
    );
  }

  async save(morphism: Morphism): Promise<void> {
    await this.connection.executeQuery(
      `MATCH (s:${NodeLabels.OBJECT} {id: $source})
       MATCH (t:${NodeLabels.OBJECT} {id: $target})
       MERGE (s)-[m:${RelationshipTypes.MORPHISM} {id: $id}]->(t)
       SET m.name = $name,
           m.metadata = $metadata`,
      {
        id: morphism.id,
        name: morphism.name,
        source: morphism.source,
        target: morphism.target,
        metadata: JSON.stringify(morphism.metadata),
      }
    );
  }

  async delete(id: string): Promise<void> {
    await this.connection.executeQuery(
      `MATCH ()-[m:${RelationshipTypes.MORPHISM} {id: $id}]->()
       DELETE m`,
      { id }
    );
  }

  /**
   * Convert Neo4j relationship to Morphism entity
   */
  private recordToEntity(
    record: unknown,
    sourceId: string,
    targetId: string
  ): Morphism {
    const rel = record as {
      properties: {
        id: string;
        name: string;
        metadata?: string;
      };
    };

    const props = rel.properties;
    const metadata = props.metadata ? JSON.parse(props.metadata) : {};

    return createMorphism(props.id, props.name, sourceId, targetId, metadata);
  }
}
