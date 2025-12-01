/**
 * Turso Connection Manager
 * Implements: REQ-SYS-001
 *
 * Manages Turso/LibSQL database connections with:
 * - Support for both remote Turso and local SQLite
 * - Query execution with parameterized queries
 * - Batch execution
 * - Transaction support
 *
 * @see tests/infrastructure/turso/connection.test.ts
 */

import { createClient, type Client, type InValue } from "@libsql/client";

/**
 * Configuration for Turso connection
 */
export type TursoConnectionConfig = {
  url: string;
  authToken?: string;
  syncUrl?: string;
  syncInterval?: number;
};

/**
 * Query execution result
 */
export type QueryResult = {
  rows: Record<string, unknown>[];
  rowsAffected: number;
  lastInsertRowid?: bigint | number;
};

/**
 * Transaction wrapper for executing queries
 */
export type TransactionExecutor = {
  execute: (sql: string, params?: unknown[]) => Promise<QueryResult>;
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
 * Turso/LibSQL Connection Manager
 */
export class TursoConnection {
  private readonly config: TursoConnectionConfig;
  private client: Client | null = null;
  private connected: boolean = false;

  constructor(config: TursoConnectionConfig) {
    validateNonEmptyString(config.url, "url");
    this.config = config;
  }

  /**
   * Establish connection to Turso/LibSQL
   */
  async connect(): Promise<void> {
    try {
      this.client = createClient({
        url: this.config.url,
        authToken: this.config.authToken,
        syncUrl: this.config.syncUrl,
        syncInterval: this.config.syncInterval,
      });

      // Verify connection by executing a simple query
      await this.client.execute("SELECT 1");

      this.connected = true;
      console.log(`Turso connected successfully to ${this.config.url}`);
    } catch (error) {
      this.connected = false;
      throw new Error(
        `Failed to connect to Turso: ${(error as Error).message}`
      );
    }
  }

  /**
   * Execute a SQL query
   */
  async execute(sql: string, params: unknown[] = []): Promise<QueryResult> {
    if (!this.client || !this.connected) {
      throw new Error("Not connected to Turso. Call connect() first.");
    }

    const result = await this.client.execute({
      sql,
      args: params as InValue[],
    });

    return {
      rows: result.rows.map((row) => {
        const obj: Record<string, unknown> = {};
        for (let i = 0; i < result.columns.length; i++) {
          const columnName = result.columns[i];
          if (columnName !== undefined) {
            obj[columnName] = row[i];
          }
        }
        return obj;
      }),
      rowsAffected: result.rowsAffected,
      lastInsertRowid: result.lastInsertRowid,
    };
  }

  /**
   * Execute multiple SQL statements in batch
   */
  async executeBatch(statements: string[]): Promise<void> {
    if (!this.client || !this.connected) {
      throw new Error("Not connected to Turso. Call connect() first.");
    }

    await this.client.batch(
      statements.map((sql) => ({ sql, args: [] })),
      "write"
    );
  }

  /**
   * Execute statements within a transaction
   */
  async transaction<T>(
    work: (tx: TransactionExecutor) => Promise<T>
  ): Promise<T> {
    if (!this.client || !this.connected) {
      throw new Error("Not connected to Turso. Call connect() first.");
    }

    const tx = await this.client.transaction("write");

    try {
      const executor: TransactionExecutor = {
        execute: async (sql: string, params: unknown[] = []) => {
          const result = await tx.execute({
            sql,
            args: params as InValue[],
          });
          return {
            rows: result.rows.map((row) => {
              const obj: Record<string, unknown> = {};
              for (let i = 0; i < result.columns.length; i++) {
                const columnName = result.columns[i];
                if (columnName !== undefined) {
                  obj[columnName] = row[i];
                }
              }
              return obj;
            }),
            rowsAffected: result.rowsAffected,
            lastInsertRowid: result.lastInsertRowid,
          };
        },
      };

      const result = await work(executor);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    if (this.client) {
      this.client.close();
      this.client = null;
    }
    this.connected = false;
    console.log("Turso connection closed");
  }

  /**
   * Check if connected to Turso
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get the underlying client (for advanced use cases)
   */
  getClient(): Client | null {
    return this.client;
  }
}
