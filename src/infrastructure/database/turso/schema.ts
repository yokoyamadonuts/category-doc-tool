/**
 * Turso Schema Definitions
 * Implements: REQ-SYS-001, REQ-SYS-002
 *
 * Defines the relational database schema for CatDoc metadata:
 * - Users table
 * - Settings table
 * - Audit logs table
 */

import { TursoConnection } from "./connection";

/**
 * Get SQL statements for creating tables
 */
export const getTableCreationQueries = (): string[] => [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // Settings table (key-value store)
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'string',
    description TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // Audit logs table
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT
  )`,
];

/**
 * Get SQL statements for creating indexes
 */
export const getIndexCreationQueries = (): string[] => [
  // Users indexes
  `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,

  // Audit logs indexes
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id)`,
];

/**
 * Initialize Turso schema with tables and indexes
 */
export const initializeSchema = async (
  connection: TursoConnection
): Promise<void> => {
  console.log("Initializing Turso schema...");

  // Create tables
  const tableQueries = getTableCreationQueries();
  for (const query of tableQueries) {
    await connection.execute(query);
    console.log("  ✓ Created table");
  }

  // Create indexes
  const indexQueries = getIndexCreationQueries();
  for (const query of indexQueries) {
    await connection.execute(query);
    console.log("  ✓ Created index");
  }

  // Insert default settings
  await insertDefaultSettings(connection);

  console.log("Turso schema initialization complete.");
};

/**
 * Insert default settings
 */
const insertDefaultSettings = async (
  connection: TursoConnection
): Promise<void> => {
  const defaultSettings = [
    {
      key: "app.version",
      value: "1.0.0",
      type: "string",
      description: "Application version",
    },
    {
      key: "neo4j.enabled",
      value: "true",
      type: "boolean",
      description: "Enable Neo4j graph database",
    },
    {
      key: "dashboard.port",
      value: "3000",
      type: "number",
      description: "Dashboard server port",
    },
  ];

  for (const setting of defaultSettings) {
    await connection.execute(
      `INSERT OR IGNORE INTO settings (key, value, type, description) VALUES (?, ?, ?, ?)`,
      [setting.key, setting.value, setting.type, setting.description]
    );
  }
};

/**
 * Drop all tables (for testing/reset)
 */
export const dropSchema = async (
  connection: TursoConnection
): Promise<void> => {
  console.log("Dropping Turso schema...");

  await connection.execute("DROP TABLE IF EXISTS audit_logs");
  await connection.execute("DROP TABLE IF EXISTS settings");
  await connection.execute("DROP TABLE IF EXISTS users");

  console.log("Turso schema dropped.");
};

/**
 * Clear all data while keeping schema (for testing)
 */
export const clearAllData = async (
  connection: TursoConnection
): Promise<void> => {
  console.log("Clearing all Turso data...");

  await connection.execute("DELETE FROM audit_logs");
  await connection.execute("DELETE FROM settings");
  await connection.execute("DELETE FROM users");

  console.log("All data cleared.");
};
