/**
 * Turso Connection Tests
 * Verifies: REQ-SYS-001
 */
import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import {
  TursoConnection,
  type TursoConnectionConfig,
} from "../../../src/infrastructure/database/turso/connection";
import { existsSync, unlinkSync } from "fs";

describe("TursoConnection", () => {
  const testDbPath = "/tmp/test-catdoc.db";

  // Clean up test database before/after tests
  beforeEach(() => {
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  afterEach(() => {
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  // TEST-TURSO-001: Constructor and configuration
  describe("constructor", () => {
    it("should create connection with local file URL", () => {
      const config: TursoConnectionConfig = {
        url: `file:${testDbPath}`,
      };
      const connection = new TursoConnection(config);

      expect(connection).toBeInstanceOf(TursoConnection);
      expect(connection.isConnected()).toBe(false);
    });

    it("should create connection with remote URL and auth token", () => {
      const config: TursoConnectionConfig = {
        url: "libsql://example.turso.io",
        authToken: "test-token",
      };
      const connection = new TursoConnection(config);

      expect(connection).toBeInstanceOf(TursoConnection);
    });

    it("should throw error for empty URL", () => {
      expect(() => {
        new TursoConnection({ url: "" });
      }).toThrow("url must be a non-empty string");
    });
  });

  // TEST-TURSO-002: Connection lifecycle
  describe("connect and close", () => {
    it("should connect to local SQLite database", async () => {
      const connection = new TursoConnection({ url: `file:${testDbPath}` });

      await connection.connect();

      expect(connection.isConnected()).toBe(true);

      await connection.close();
      expect(connection.isConnected()).toBe(false);
    });

    it("should not throw when closing unconnected instance", async () => {
      const connection = new TursoConnection({ url: `file:${testDbPath}` });

      await expect(connection.close()).resolves.toBeUndefined();
    });
  });

  // TEST-TURSO-003: Query execution
  describe("execute", () => {
    it("should execute CREATE TABLE query", async () => {
      const connection = new TursoConnection({ url: `file:${testDbPath}` });
      await connection.connect();

      const result = await connection.execute(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)"
      );

      expect(result.rowsAffected).toBe(0);

      await connection.close();
    });

    it("should execute INSERT and return affected rows", async () => {
      const connection = new TursoConnection({ url: `file:${testDbPath}` });
      await connection.connect();

      await connection.execute(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)"
      );
      const result = await connection.execute(
        "INSERT INTO test (name) VALUES (?)",
        ["test-value"]
      );

      expect(result.rowsAffected).toBe(1);
      expect(result.lastInsertRowid).toBeDefined();

      await connection.close();
    });

    it("should execute SELECT and return rows", async () => {
      const connection = new TursoConnection({ url: `file:${testDbPath}` });
      await connection.connect();

      await connection.execute(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)"
      );
      await connection.execute("INSERT INTO test (name) VALUES (?)", ["value1"]);
      await connection.execute("INSERT INTO test (name) VALUES (?)", ["value2"]);

      const result = await connection.execute("SELECT * FROM test");

      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toHaveProperty("name", "value1");
      expect(result.rows[1]).toHaveProperty("name", "value2");

      await connection.close();
    });

    it("should handle parameterized queries", async () => {
      const connection = new TursoConnection({ url: `file:${testDbPath}` });
      await connection.connect();

      await connection.execute(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT, value INTEGER)"
      );
      await connection.execute(
        "INSERT INTO test (name, value) VALUES (?, ?)",
        ["item", 42]
      );

      const result = await connection.execute(
        "SELECT * FROM test WHERE name = ?",
        ["item"]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toHaveProperty("value", 42);

      await connection.close();
    });

    it("should throw error when not connected", async () => {
      const connection = new TursoConnection({ url: `file:${testDbPath}` });

      await expect(
        connection.execute("SELECT 1")
      ).rejects.toThrow("Not connected");
    });
  });

  // TEST-TURSO-004: Batch execution
  describe("executeBatch", () => {
    it("should execute multiple statements in batch", async () => {
      const connection = new TursoConnection({ url: `file:${testDbPath}` });
      await connection.connect();

      await connection.executeBatch([
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
        "INSERT INTO test (name) VALUES ('a')",
        "INSERT INTO test (name) VALUES ('b')",
      ]);

      const result = await connection.execute("SELECT COUNT(*) as count FROM test");
      expect(result.rows[0]).toHaveProperty("count", 2);

      await connection.close();
    });
  });

  // TEST-TURSO-005: Transaction support
  describe("transaction", () => {
    it("should execute statements in transaction", async () => {
      const connection = new TursoConnection({ url: `file:${testDbPath}` });
      await connection.connect();

      await connection.execute(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)"
      );

      await connection.transaction(async (tx) => {
        await tx.execute("INSERT INTO test (name) VALUES (?)", ["tx-item"]);
      });

      const result = await connection.execute("SELECT * FROM test");
      expect(result.rows).toHaveLength(1);

      await connection.close();
    });
  });

  // TEST-TURSO-006: In-memory database
  describe("in-memory database", () => {
    it("should support in-memory database with :memory:", async () => {
      const connection = new TursoConnection({ url: "file::memory:" });
      await connection.connect();

      await connection.execute(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)"
      );
      await connection.execute("INSERT INTO test (name) VALUES (?)", ["memory"]);

      const result = await connection.execute("SELECT * FROM test");
      expect(result.rows).toHaveLength(1);

      await connection.close();
    });
  });
});
