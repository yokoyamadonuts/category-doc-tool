/**
 * Turso User Repository
 * Implements: REQ-SYS-001
 *
 * Repository for managing users in Turso/SQLite.
 */

import { TursoConnection } from "../connection";

/**
 * User entity
 */
export type User = {
  id: string;
  username: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * User Repository
 */
export class UserRepository {
  constructor(private readonly connection: TursoConnection) {}

  async findAll(): Promise<User[]> {
    const result = await this.connection.execute("SELECT * FROM users");
    return result.rows.map((row) => this.rowToEntity(row));
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.rowToEntity(result.rows[0]);
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await this.connection.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.rowToEntity(result.rows[0]);
  }

  async save(user: Omit<User, "createdAt" | "updatedAt">): Promise<void> {
    await this.connection.execute(
      `INSERT INTO users (id, username, email, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         username = excluded.username,
         email = excluded.email,
         updated_at = datetime('now')`,
      [user.id, user.username, user.email]
    );
  }

  async delete(id: string): Promise<void> {
    await this.connection.execute("DELETE FROM users WHERE id = ?", [id]);
  }

  private rowToEntity(row: Record<string, unknown>): User {
    return {
      id: row.id as string,
      username: row.username as string,
      email: row.email as string | null,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }
}
