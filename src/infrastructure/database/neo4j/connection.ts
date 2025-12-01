/**
 * Neo4j Connection Manager
 * Implements: REQ-SYS-001
 *
 * Manages Neo4j database connections with:
 * - Connection pooling
 * - Retry logic with exponential backoff
 * - Query execution
 * - Proper resource cleanup
 *
 * @see tests/infrastructure/neo4j/connection.test.ts
 */

import neo4j, {
  type Driver,
  type Session,
  type Record as Neo4jRecord,
} from "neo4j-driver";

/**
 * Configuration for Neo4j connection
 */
export type Neo4jConnectionConfig = {
  uri: string;
  username: string;
  password: string;
  database?: string;
  maxRetries?: number;
  retryDelayMs?: number;
};

/**
 * Query result wrapper
 */
export type QueryResult = {
  records: Array<{
    get: (key: string) => unknown;
    toObject: () => Record<string, unknown>;
  }>;
  summary: {
    counters: {
      nodesCreated: () => number;
      nodesDeleted: () => number;
      relationshipsCreated: () => number;
      relationshipsDeleted: () => number;
    };
  };
};

/**
 * Validates that a string is non-empty
 */
const validateNonEmptyString = (value: string, fieldName: string): void => {
  if (!value || value.trim() === "") {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
};

/**
 * Sleep for a specified duration
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Neo4j Connection Manager
 */
export class Neo4jConnection {
  private readonly config: Neo4jConnectionConfig;
  private driver: Driver | null = null;
  private connected: boolean = false;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;

  constructor(config: Neo4jConnectionConfig) {
    validateNonEmptyString(config.uri, "uri");
    validateNonEmptyString(config.username, "username");
    validateNonEmptyString(config.password, "password");

    this.config = config;
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelayMs = config.retryDelayMs ?? 1000;
  }

  /**
   * Establish connection to Neo4j with retry logic
   */
  async connect(): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.driver = neo4j.driver(
          this.config.uri,
          neo4j.auth.basic(this.config.username, this.config.password)
        );

        // Verify connectivity
        await this.driver.verifyConnectivity();
        this.connected = true;
        console.log(`Neo4j connected successfully to ${this.config.uri}`);
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `Neo4j connection attempt ${attempt}/${this.maxRetries} failed: ${lastError.message}`
        );

        if (attempt < this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
          console.log(`Retrying in ${delay}ms...`);
          await sleep(delay);
        }
      }
    }

    this.connected = false;
    throw new Error(
      `Failed to connect to Neo4j after ${this.maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Execute a Cypher query
   */
  async executeQuery(
    cypher: string,
    params: Record<string, unknown> = {}
  ): Promise<QueryResult> {
    if (!this.driver || !this.connected) {
      throw new Error("Not connected to Neo4j. Call connect() first.");
    }

    const session: Session = this.driver.session({
      database: this.config.database,
    });

    try {
      const result = await session.run(cypher, params);
      const summary = result.summary;
      const updates = summary.counters.updates();

      return {
        records: result.records.map((record: Neo4jRecord) => ({
          get: (key: string) => record.get(key),
          toObject: () => record.toObject(),
        })),
        summary: {
          counters: {
            nodesCreated: () => updates.nodesCreated,
            nodesDeleted: () => updates.nodesDeleted,
            relationshipsCreated: () => updates.relationshipsCreated,
            relationshipsDeleted: () => updates.relationshipsDeleted,
          },
        },
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Execute a query within a transaction
   */
  async executeInTransaction<T>(
    work: (tx: { run: (cypher: string, params?: Record<string, unknown>) => Promise<unknown> }) => Promise<T>
  ): Promise<T> {
    if (!this.driver || !this.connected) {
      throw new Error("Not connected to Neo4j. Call connect() first.");
    }

    const session: Session = this.driver.session({
      database: this.config.database,
    });

    try {
      // Type assertion needed due to neo4j-driver type complexity
      const result = await session.executeWrite(work as Parameters<typeof session.executeWrite>[0]);
      return result as T;
    } finally {
      await session.close();
    }
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
    }
    this.connected = false;
    console.log("Neo4j connection closed");
  }

  /**
   * Check if connected to Neo4j
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get the underlying driver (for advanced use cases)
   */
  getDriver(): Driver | null {
    return this.driver;
  }
}
