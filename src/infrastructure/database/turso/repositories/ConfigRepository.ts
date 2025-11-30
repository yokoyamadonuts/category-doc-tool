/**
 * Turso Config Repository
 * Implements: REQ-SYS-001, REQ-SYS-002
 *
 * Repository for managing application settings in Turso/SQLite.
 */

import { TursoConnection } from "../connection";

/**
 * Setting value types
 */
export type SettingType = "string" | "number" | "boolean" | "json";

/**
 * Setting entity
 */
export type Setting = {
  key: string;
  value: string;
  type: SettingType;
  description: string | null;
  updatedAt: Date;
};

/**
 * Config Repository
 */
export class ConfigRepository {
  constructor(private readonly connection: TursoConnection) {}

  /**
   * Get a setting by key
   */
  async get(key: string): Promise<string | null> {
    const result = await this.connection.execute(
      "SELECT value FROM settings WHERE key = ?",
      [key]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].value as string;
  }

  /**
   * Get a setting with type conversion
   */
  async getTyped<T>(key: string): Promise<T | null> {
    const result = await this.connection.execute(
      "SELECT value, type FROM settings WHERE key = ?",
      [key]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const value = result.rows[0].value as string;
    const type = result.rows[0].type as SettingType;

    return this.parseValue(value, type) as T;
  }

  /**
   * Get all settings
   */
  async getAll(): Promise<Setting[]> {
    const result = await this.connection.execute("SELECT * FROM settings");
    return result.rows.map((row) => this.rowToEntity(row));
  }

  /**
   * Get all settings as a key-value map
   */
  async getAllAsMap(): Promise<Map<string, unknown>> {
    const settings = await this.getAll();
    const map = new Map<string, unknown>();

    for (const setting of settings) {
      map.set(setting.key, this.parseValue(setting.value, setting.type));
    }

    return map;
  }

  /**
   * Set a setting value
   */
  async set(
    key: string,
    value: unknown,
    type: SettingType = "string",
    description?: string
  ): Promise<void> {
    const stringValue = this.stringifyValue(value, type);

    await this.connection.execute(
      `INSERT INTO settings (key, value, type, description, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         type = excluded.type,
         description = COALESCE(excluded.description, settings.description),
         updated_at = datetime('now')`,
      [key, stringValue, type, description ?? null]
    );
  }

  /**
   * Delete a setting
   */
  async delete(key: string): Promise<void> {
    await this.connection.execute("DELETE FROM settings WHERE key = ?", [key]);
  }

  /**
   * Check if a setting exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.connection.execute(
      "SELECT 1 FROM settings WHERE key = ?",
      [key]
    );
    return result.rows.length > 0;
  }

  private rowToEntity(row: Record<string, unknown>): Setting {
    return {
      key: row.key as string,
      value: row.value as string,
      type: row.type as SettingType,
      description: row.description as string | null,
      updatedAt: new Date(row.updated_at as string),
    };
  }

  private parseValue(value: string, type: SettingType): unknown {
    switch (type) {
      case "number":
        return Number(value);
      case "boolean":
        return value === "true";
      case "json":
        return JSON.parse(value);
      default:
        return value;
    }
  }

  private stringifyValue(value: unknown, type: SettingType): string {
    switch (type) {
      case "json":
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }
}
