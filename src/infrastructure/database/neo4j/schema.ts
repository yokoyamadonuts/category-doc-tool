/**
 * Neo4j Schema Definitions
 * Implements: REQ-SYS-001
 *
 * Defines the graph database schema for CatDoc:
 * - Node labels for entities
 * - Relationship types for morphisms and mappings
 * - Index and constraint creation queries
 */

import { Neo4jConnection } from "./connection";

// =============================================================================
// Node Labels
// =============================================================================

/**
 * Node labels for graph entities
 */
export const NodeLabels = {
  /** Category theory object (document) */
  OBJECT: "Object",
  /** Category containing objects and morphisms */
  CATEGORY: "Category",
  /** Functor mapping between categories */
  FUNCTOR: "Functor",
  /** Natural transformation between functors */
  NATURAL_TRANSFORMATION: "NaturalTransformation",
} as const;

export type NodeLabel = (typeof NodeLabels)[keyof typeof NodeLabels];

// =============================================================================
// Relationship Types
// =============================================================================

/**
 * Relationship types for graph edges
 */
export const RelationshipTypes = {
  /** Morphism between objects: (Object)-[:MORPHISM]->(Object) */
  MORPHISM: "MORPHISM",
  /** Identity morphism: (Object)-[:IDENTITY]->(Object) same node */
  IDENTITY: "IDENTITY",
  /** Composed morphism reference */
  COMPOSED_FROM: "COMPOSED_FROM",
  /** Object belongs to category: (Object)-[:BELONGS_TO]->(Category) */
  BELONGS_TO: "BELONGS_TO",
  /** Functor maps object: (Functor)-[:MAPS_OBJECT {from, to}]->(Category) */
  MAPS_OBJECT: "MAPS_OBJECT",
  /** Functor maps morphism: (Functor)-[:MAPS_MORPHISM {from, to}]->(Category) */
  MAPS_MORPHISM: "MAPS_MORPHISM",
  /** Functor source category: (Functor)-[:FROM_CATEGORY]->(Category) */
  FROM_CATEGORY: "FROM_CATEGORY",
  /** Functor target category: (Functor)-[:TO_CATEGORY]->(Category) */
  TO_CATEGORY: "TO_CATEGORY",
  /** Natural transformation component: (NaturalTransformation)-[:COMPONENT {objectId}]->(Morphism) */
  COMPONENT: "COMPONENT",
  /** Natural transformation source functor */
  SOURCE_FUNCTOR: "SOURCE_FUNCTOR",
  /** Natural transformation target functor */
  TARGET_FUNCTOR: "TARGET_FUNCTOR",
} as const;

export type RelationshipType =
  (typeof RelationshipTypes)[keyof typeof RelationshipTypes];

// =============================================================================
// Index Creation Queries
// =============================================================================

/**
 * Get Cypher queries for creating indexes
 */
export const getIndexCreationQueries = (): string[] => [
  // Object indexes
  `CREATE INDEX object_id_index IF NOT EXISTS FOR (o:${NodeLabels.OBJECT}) ON (o.id)`,
  `CREATE INDEX object_domain_index IF NOT EXISTS FOR (o:${NodeLabels.OBJECT}) ON (o.domain)`,
  `CREATE INDEX object_title_index IF NOT EXISTS FOR (o:${NodeLabels.OBJECT}) ON (o.title)`,

  // Category indexes
  `CREATE INDEX category_id_index IF NOT EXISTS FOR (c:${NodeLabels.CATEGORY}) ON (c.id)`,
  `CREATE INDEX category_name_index IF NOT EXISTS FOR (c:${NodeLabels.CATEGORY}) ON (c.name)`,

  // Functor indexes
  `CREATE INDEX functor_id_index IF NOT EXISTS FOR (f:${NodeLabels.FUNCTOR}) ON (f.id)`,
  `CREATE INDEX functor_source_index IF NOT EXISTS FOR (f:${NodeLabels.FUNCTOR}) ON (f.sourceCategory)`,
  `CREATE INDEX functor_target_index IF NOT EXISTS FOR (f:${NodeLabels.FUNCTOR}) ON (f.targetCategory)`,

  // NaturalTransformation indexes
  `CREATE INDEX nat_trans_id_index IF NOT EXISTS FOR (n:${NodeLabels.NATURAL_TRANSFORMATION}) ON (n.id)`,
  `CREATE INDEX nat_trans_source_functor_index IF NOT EXISTS FOR (n:${NodeLabels.NATURAL_TRANSFORMATION}) ON (n.sourceFunctor)`,
  `CREATE INDEX nat_trans_target_functor_index IF NOT EXISTS FOR (n:${NodeLabels.NATURAL_TRANSFORMATION}) ON (n.targetFunctor)`,
];

// =============================================================================
// Constraint Creation Queries
// =============================================================================

/**
 * Get Cypher queries for creating uniqueness constraints
 */
export const getConstraintCreationQueries = (): string[] => [
  // Unique ID constraints
  `CREATE CONSTRAINT object_id_unique IF NOT EXISTS FOR (o:${NodeLabels.OBJECT}) REQUIRE o.id IS UNIQUE`,
  `CREATE CONSTRAINT category_id_unique IF NOT EXISTS FOR (c:${NodeLabels.CATEGORY}) REQUIRE c.id IS UNIQUE`,
  `CREATE CONSTRAINT functor_id_unique IF NOT EXISTS FOR (f:${NodeLabels.FUNCTOR}) REQUIRE f.id IS UNIQUE`,
  `CREATE CONSTRAINT nat_trans_id_unique IF NOT EXISTS FOR (n:${NodeLabels.NATURAL_TRANSFORMATION}) REQUIRE n.id IS UNIQUE`,
];

// =============================================================================
// Schema Initialization
// =============================================================================

/**
 * Initialize Neo4j schema with indexes and constraints
 */
export const initializeSchema = async (
  connection: Neo4jConnection
): Promise<void> => {
  console.log("Initializing Neo4j schema...");

  // Create constraints first (they implicitly create indexes)
  const constraintQueries = getConstraintCreationQueries();
  for (const query of constraintQueries) {
    try {
      await connection.executeQuery(query);
      console.log(`  ✓ Created constraint`);
    } catch (_error) {
      // Constraint may already exist
      console.log(`  - Constraint already exists or skipped`);
    }
  }

  // Create additional indexes
  const indexQueries = getIndexCreationQueries();
  for (const query of indexQueries) {
    try {
      await connection.executeQuery(query);
      console.log(`  ✓ Created index`);
    } catch (_error) {
      // Index may already exist
      console.log(`  - Index already exists or skipped`);
    }
  }

  console.log("Neo4j schema initialization complete.");
};

/**
 * Drop all schema elements (for testing/reset)
 */
export const dropSchema = async (
  connection: Neo4jConnection
): Promise<void> => {
  console.log("Dropping Neo4j schema...");

  // Drop all constraints
  const constraintQueries = getConstraintCreationQueries().map((q) =>
    q.replace("CREATE", "DROP").replace(" IF NOT EXISTS", " IF EXISTS")
  );
  for (const query of constraintQueries) {
    try {
      await connection.executeQuery(query);
    } catch {
      // Ignore errors
    }
  }

  // Drop all indexes
  const indexQueries = getIndexCreationQueries().map((q) =>
    q.replace("CREATE", "DROP").replace(" IF NOT EXISTS", " IF EXISTS")
  );
  for (const query of indexQueries) {
    try {
      await connection.executeQuery(query);
    } catch {
      // Ignore errors
    }
  }

  console.log("Neo4j schema dropped.");
};

/**
 * Clear all data (for testing)
 */
export const clearAllData = async (
  connection: Neo4jConnection
): Promise<void> => {
  console.log("Clearing all Neo4j data...");
  await connection.executeQuery("MATCH (n) DETACH DELETE n");
  console.log("All data cleared.");
};
