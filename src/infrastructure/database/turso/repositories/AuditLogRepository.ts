/**
 * Turso Audit Log Repository
 * Implements: REQ-SYS-001
 *
 * Repository for managing audit logs in Turso/SQLite.
 */

import { TursoConnection } from "../connection";

/**
 * Audit log entry
 */
export type AuditLogEntry = {
  id: number;
  timestamp: Date;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown> | null;
};

/**
 * Audit log filter options
 */
export type AuditLogFilter = {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
};

/**
 * Audit Log Repository
 */
export class AuditLogRepository {
  constructor(private readonly connection: TursoConnection) {}

  /**
   * Log an action
   */
  async log(
    action: string,
    entityType: string,
    entityId: string,
    userId?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    await this.connection.execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId ?? null,
        action,
        entityType,
        entityId,
        details ? JSON.stringify(details) : null,
      ]
    );
  }

  /**
   * Find logs by filter
   */
  async find(filter: AuditLogFilter = {}): Promise<AuditLogEntry[]> {
    let sql = "SELECT * FROM audit_logs WHERE 1=1";
    const params: unknown[] = [];

    if (filter.userId) {
      sql += " AND user_id = ?";
      params.push(filter.userId);
    }

    if (filter.action) {
      sql += " AND action = ?";
      params.push(filter.action);
    }

    if (filter.entityType) {
      sql += " AND entity_type = ?";
      params.push(filter.entityType);
    }

    if (filter.entityId) {
      sql += " AND entity_id = ?";
      params.push(filter.entityId);
    }

    if (filter.startDate) {
      sql += " AND timestamp >= ?";
      params.push(filter.startDate.toISOString());
    }

    if (filter.endDate) {
      sql += " AND timestamp <= ?";
      params.push(filter.endDate.toISOString());
    }

    sql += " ORDER BY timestamp DESC";

    if (filter.limit) {
      sql += " LIMIT ?";
      params.push(filter.limit);
    }

    if (filter.offset) {
      sql += " OFFSET ?";
      params.push(filter.offset);
    }

    const result = await this.connection.execute(sql, params);
    return result.rows.map((row) => this.rowToEntity(row));
  }

  /**
   * Find logs for a specific entity
   */
  async findByEntity(
    entityType: string,
    entityId: string
  ): Promise<AuditLogEntry[]> {
    return this.find({ entityType, entityId });
  }

  /**
   * Find recent logs
   */
  async findRecent(limit: number = 100): Promise<AuditLogEntry[]> {
    return this.find({ limit });
  }

  /**
   * Count logs by filter
   */
  async count(filter: AuditLogFilter = {}): Promise<number> {
    let sql = "SELECT COUNT(*) as count FROM audit_logs WHERE 1=1";
    const params: unknown[] = [];

    if (filter.userId) {
      sql += " AND user_id = ?";
      params.push(filter.userId);
    }

    if (filter.action) {
      sql += " AND action = ?";
      params.push(filter.action);
    }

    if (filter.entityType) {
      sql += " AND entity_type = ?";
      params.push(filter.entityType);
    }

    const result = await this.connection.execute(sql, params);
    return result.rows[0].count as number;
  }

  /**
   * Delete old logs
   */
  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.connection.execute(
      "DELETE FROM audit_logs WHERE timestamp < ?",
      [date.toISOString()]
    );
    return result.rowsAffected;
  }

  private rowToEntity(row: Record<string, unknown>): AuditLogEntry {
    return {
      id: row.id as number,
      timestamp: new Date(row.timestamp as string),
      userId: row.user_id as string | null,
      action: row.action as string,
      entityType: row.entity_type as string,
      entityId: row.entity_id as string,
      details: row.details ? JSON.parse(row.details as string) : null,
    };
  }
}
