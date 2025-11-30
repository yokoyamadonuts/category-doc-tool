/**
 * Neo4j Category Repository
 * Implements: REQ-SYS-001
 *
 * Repository implementation for Category entities using Neo4j.
 */

import type { ICategoryRepository } from "../../../../domain/interfaces/IRepository";
import {
  type Category,
  createCategory,
} from "../../../../domain/entities/Category";
import { createCategoryObject } from "../../../../domain/entities/Object";
import { createMorphism } from "../../../../domain/entities/Morphism";
import { Neo4jConnection } from "../connection";
import { NodeLabels, RelationshipTypes } from "../schema";

/**
 * Neo4j implementation of ICategoryRepository
 */
export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly connection: Neo4jConnection) {}

  async findAll(): Promise<Category[]> {
    const result = await this.connection.executeQuery(
      `MATCH (c:${NodeLabels.CATEGORY}) RETURN c`
    );

    const categories: Category[] = [];
    for (const record of result.records) {
      const cat = await this.loadCategoryWithRelations(record.get("c"));
      categories.push(cat);
    }

    return categories;
  }

  async findById(id: string): Promise<Category | null> {
    const result = await this.connection.executeQuery(
      `MATCH (c:${NodeLabels.CATEGORY} {id: $id}) RETURN c`,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    return this.loadCategoryWithRelations(result.records[0].get("c"));
  }

  async findByName(name: string): Promise<Category | null> {
    const result = await this.connection.executeQuery(
      `MATCH (c:${NodeLabels.CATEGORY} {name: $name}) RETURN c`,
      { name }
    );

    if (result.records.length === 0) {
      return null;
    }

    return this.loadCategoryWithRelations(result.records[0].get("c"));
  }

  async save(category: Category): Promise<void> {
    // Save category node
    await this.connection.executeQuery(
      `MERGE (c:${NodeLabels.CATEGORY} {id: $id})
       SET c.name = $name`,
      {
        id: category.id,
        name: category.name,
      }
    );

    // Save objects and their relationships to category
    for (const obj of category.objects) {
      await this.connection.executeQuery(
        `MERGE (o:${NodeLabels.OBJECT} {id: $objId})
         SET o.title = $title,
             o.domain = $domain,
             o.metadata = $metadata,
             o.content = $content
         WITH o
         MATCH (c:${NodeLabels.CATEGORY} {id: $catId})
         MERGE (o)-[:${RelationshipTypes.BELONGS_TO}]->(c)`,
        {
          objId: obj.id,
          title: obj.title,
          domain: obj.domain,
          metadata: JSON.stringify(obj.metadata),
          content: obj.content ?? null,
          catId: category.id,
        }
      );
    }

    // Save morphisms
    for (const morph of category.morphisms) {
      await this.connection.executeQuery(
        `MATCH (s:${NodeLabels.OBJECT} {id: $source})
         MATCH (t:${NodeLabels.OBJECT} {id: $target})
         MERGE (s)-[m:${RelationshipTypes.MORPHISM} {id: $id}]->(t)
         SET m.name = $name,
             m.metadata = $metadata`,
        {
          id: morph.id,
          name: morph.name,
          source: morph.source,
          target: morph.target,
          metadata: JSON.stringify(morph.metadata),
        }
      );
    }
  }

  async delete(id: string): Promise<void> {
    // Delete relationships and category
    await this.connection.executeQuery(
      `MATCH (c:${NodeLabels.CATEGORY} {id: $id})
       OPTIONAL MATCH (o:${NodeLabels.OBJECT})-[:${RelationshipTypes.BELONGS_TO}]->(c)
       DETACH DELETE c`,
      { id }
    );
  }

  /**
   * Load category with its objects and morphisms
   */
  private async loadCategoryWithRelations(record: unknown): Promise<Category> {
    const node = record as {
      properties: {
        id: string;
        name: string;
      };
    };

    const props = node.properties;

    // Load objects belonging to this category
    const objectsResult = await this.connection.executeQuery(
      `MATCH (o:${NodeLabels.OBJECT})-[:${RelationshipTypes.BELONGS_TO}]->(c:${NodeLabels.CATEGORY} {id: $id})
       RETURN o`,
      { id: props.id }
    );

    const objects = objectsResult.records.map((r) => {
      const objNode = r.get("o") as {
        properties: {
          id: string;
          title: string;
          domain: string;
          metadata?: string;
          content?: string;
        };
      };
      const objProps = objNode.properties;
      const metadata = objProps.metadata ? JSON.parse(objProps.metadata) : {};
      return createCategoryObject(
        objProps.id,
        objProps.title,
        objProps.domain,
        metadata,
        objProps.content
      );
    });

    // Load morphisms between objects in this category
    const objectIds = objects.map((o) => o.id);
    const morphismsResult = await this.connection.executeQuery(
      `MATCH (s:${NodeLabels.OBJECT})-[m:${RelationshipTypes.MORPHISM}]->(t:${NodeLabels.OBJECT})
       WHERE s.id IN $objectIds AND t.id IN $objectIds
       RETURN m, s.id as sourceId, t.id as targetId`,
      { objectIds }
    );

    const morphisms = morphismsResult.records.map((r) => {
      const morphRel = r.get("m") as {
        properties: {
          id: string;
          name: string;
          metadata?: string;
        };
      };
      const morphProps = morphRel.properties;
      const metadata = morphProps.metadata ? JSON.parse(morphProps.metadata) : {};
      return createMorphism(
        morphProps.id,
        morphProps.name,
        r.get("sourceId") as string,
        r.get("targetId") as string,
        metadata
      );
    });

    return createCategory(props.id, props.name, objects, morphisms);
  }
}
