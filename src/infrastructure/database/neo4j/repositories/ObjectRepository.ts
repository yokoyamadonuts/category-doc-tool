/**
 * Neo4j Object Repository
 * Implements: REQ-SYS-001
 *
 * Repository implementation for CategoryObject entities using Neo4j.
 */

import type { IObjectRepository } from "../../../../domain/interfaces/IRepository";
import {
  type CategoryObject,
  createCategoryObject,
} from "../../../../domain/entities/Object";
import { Neo4jConnection } from "../connection";
import { NodeLabels, RelationshipTypes } from "../schema";

/**
 * Neo4j implementation of IObjectRepository
 */
export class ObjectRepository implements IObjectRepository {
  constructor(private readonly connection: Neo4jConnection) {}

  async findAll(): Promise<CategoryObject[]> {
    const result = await this.connection.executeQuery(
      `MATCH (o:${NodeLabels.OBJECT}) RETURN o`
    );

    return result.records.map((record) => this.recordToEntity(record.get("o")));
  }

  async findById(id: string): Promise<CategoryObject | null> {
    const result = await this.connection.executeQuery(
      `MATCH (o:${NodeLabels.OBJECT} {id: $id}) RETURN o`,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    return this.recordToEntity(result.records[0].get("o"));
  }

  async findByCategoryId(categoryId: string): Promise<CategoryObject[]> {
    const result = await this.connection.executeQuery(
      `MATCH (o:${NodeLabels.OBJECT})-[:${RelationshipTypes.BELONGS_TO}]->(c:${NodeLabels.CATEGORY} {id: $categoryId})
       RETURN o`,
      { categoryId }
    );

    return result.records.map((record) => this.recordToEntity(record.get("o")));
  }

  async findByDomain(domain: string): Promise<CategoryObject[]> {
    const result = await this.connection.executeQuery(
      `MATCH (o:${NodeLabels.OBJECT} {domain: $domain}) RETURN o`,
      { domain }
    );

    return result.records.map((record) => this.recordToEntity(record.get("o")));
  }

  async save(obj: CategoryObject): Promise<void> {
    await this.connection.executeQuery(
      `MERGE (o:${NodeLabels.OBJECT} {id: $id})
       SET o.title = $title,
           o.domain = $domain,
           o.metadata = $metadata,
           o.content = $content`,
      {
        id: obj.id,
        title: obj.title,
        domain: obj.domain,
        metadata: JSON.stringify(obj.metadata),
        content: obj.content ?? null,
      }
    );
  }

  async delete(id: string): Promise<void> {
    await this.connection.executeQuery(
      `MATCH (o:${NodeLabels.OBJECT} {id: $id}) DETACH DELETE o`,
      { id }
    );
  }

  /**
   * Convert Neo4j record to CategoryObject entity
   */
  private recordToEntity(record: unknown): CategoryObject {
    const node = record as {
      properties: {
        id: string;
        title: string;
        domain: string;
        metadata?: string;
        content?: string;
      };
    };

    const props = node.properties;
    const metadata = props.metadata ? JSON.parse(props.metadata) : {};

    return createCategoryObject(
      props.id,
      props.title,
      props.domain,
      metadata,
      props.content
    );
  }
}
