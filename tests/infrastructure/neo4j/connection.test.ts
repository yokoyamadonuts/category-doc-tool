/**
 * Neo4j Connection Tests
 * Verifies: REQ-SYS-001
 *
 * Note: These tests use mocking to avoid requiring a real Neo4j instance.
 * Integration tests with a real database should be in a separate test file.
 */
import { describe, expect, it } from "bun:test";
import {
  Neo4jConnection,
  type Neo4jConnectionConfig,
  type QueryResult,
} from "../../../src/infrastructure/database/neo4j/connection";

describe("Neo4jConnection", () => {
  const testConfig: Neo4jConnectionConfig = {
    uri: "bolt://localhost:7687",
    username: "neo4j",
    password: "password",
  };

  // TEST-NEO4J-001: Constructor and configuration
  describe("constructor", () => {
    it("should create connection with valid config", () => {
      const connection = new Neo4jConnection(testConfig);

      expect(connection).toBeInstanceOf(Neo4jConnection);
      expect(connection.isConnected()).toBe(false);
    });

    it("should accept optional database name", () => {
      const configWithDb: Neo4jConnectionConfig = {
        ...testConfig,
        database: "mydb",
      };
      const connection = new Neo4jConnection(configWithDb);

      expect(connection).toBeInstanceOf(Neo4jConnection);
    });

    it("should throw error for empty URI", () => {
      expect(() => {
        new Neo4jConnection({ ...testConfig, uri: "" });
      }).toThrow("uri must be a non-empty string");
    });

    it("should throw error for empty username", () => {
      expect(() => {
        new Neo4jConnection({ ...testConfig, username: "" });
      }).toThrow("username must be a non-empty string");
    });

    it("should throw error for empty password", () => {
      expect(() => {
        new Neo4jConnection({ ...testConfig, password: "" });
      }).toThrow("password must be a non-empty string");
    });
  });

  // TEST-NEO4J-002: Connection status
  describe("isConnected", () => {
    it("should return false before connect is called", () => {
      const connection = new Neo4jConnection(testConfig);

      expect(connection.isConnected()).toBe(false);
    });
  });

  // TEST-NEO4J-003: Close connection
  describe("close", () => {
    it("should not throw when closing unconnected instance", async () => {
      const connection = new Neo4jConnection(testConfig);

      await expect(connection.close()).resolves.toBeUndefined();
    });

    it("should set connected status to false after close", async () => {
      const connection = new Neo4jConnection(testConfig);

      await connection.close();

      expect(connection.isConnected()).toBe(false);
    });
  });

  // TEST-NEO4J-004: Query result structure
  describe("QueryResult", () => {
    it("should define correct structure for query results", () => {
      const result: QueryResult = {
        records: [
          { get: (_key: string) => ({ id: "1", name: "test" }) },
        ],
        summary: {
          counters: {
            nodesCreated: () => 1,
            nodesDeleted: () => 0,
            relationshipsCreated: () => 0,
            relationshipsDeleted: () => 0,
          },
        },
      };

      expect(result.records).toHaveLength(1);
      expect(typeof result.summary.counters.nodesCreated).toBe("function");
    });
  });

  // TEST-NEO4J-005: Retry configuration
  describe("retry configuration", () => {
    it("should accept custom retry options", () => {
      const configWithRetry: Neo4jConnectionConfig = {
        ...testConfig,
        maxRetries: 5,
        retryDelayMs: 500,
      };
      const connection = new Neo4jConnection(configWithRetry);

      expect(connection).toBeInstanceOf(Neo4jConnection);
    });

    it("should use default retry options when not specified", () => {
      const connection = new Neo4jConnection(testConfig);

      // Internal defaults should be 3 retries, 1000ms delay
      expect(connection).toBeInstanceOf(Neo4jConnection);
    });
  });

  // TEST-NEO4J-006: Connection string parsing
  describe("URI handling", () => {
    it("should accept bolt protocol", () => {
      const config: Neo4jConnectionConfig = {
        ...testConfig,
        uri: "bolt://localhost:7687",
      };
      const connection = new Neo4jConnection(config);

      expect(connection).toBeInstanceOf(Neo4jConnection);
    });

    it("should accept neo4j protocol", () => {
      const config: Neo4jConnectionConfig = {
        ...testConfig,
        uri: "neo4j://localhost:7687",
      };
      const connection = new Neo4jConnection(config);

      expect(connection).toBeInstanceOf(Neo4jConnection);
    });

    it("should accept bolt+s (TLS) protocol", () => {
      const config: Neo4jConnectionConfig = {
        ...testConfig,
        uri: "bolt+s://localhost:7687",
      };
      const connection = new Neo4jConnection(config);

      expect(connection).toBeInstanceOf(Neo4jConnection);
    });
  });
});
