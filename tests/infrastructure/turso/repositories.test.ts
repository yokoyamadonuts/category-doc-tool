/**
 * Turso Repositories Tests
 * Verifies: REQ-SYS-001, REQ-SYS-002
 */
import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { TursoConnection } from "../../../src/infrastructure/database/turso/connection";
import { initializeSchema, dropSchema } from "../../../src/infrastructure/database/turso/schema";
import {
  UserRepository,
  ConfigRepository,
  AuditLogRepository,
} from "../../../src/infrastructure/database/turso/repositories";

describe("Turso Repositories", () => {
  let connection: TursoConnection;

  beforeEach(async () => {
    connection = new TursoConnection({ url: "file::memory:" });
    await connection.connect();
    await initializeSchema(connection);
  });

  afterEach(async () => {
    await connection.close();
  });

  // TEST-TURSO-REPO-001: UserRepository
  describe("UserRepository", () => {
    let repo: UserRepository;

    beforeEach(() => {
      repo = new UserRepository(connection);
    });

    it("should save and find user by id", async () => {
      await repo.save({
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
      });

      const user = await repo.findById("user-1");

      expect(user).not.toBeNull();
      expect(user!.id).toBe("user-1");
      expect(user!.username).toBe("testuser");
      expect(user!.email).toBe("test@example.com");
    });

    it("should find user by username", async () => {
      await repo.save({
        id: "user-1",
        username: "testuser",
        email: null,
      });

      const user = await repo.findByUsername("testuser");

      expect(user).not.toBeNull();
      expect(user!.id).toBe("user-1");
    });

    it("should return null for non-existent user", async () => {
      const user = await repo.findById("non-existent");
      expect(user).toBeNull();
    });

    it("should update existing user", async () => {
      await repo.save({
        id: "user-1",
        username: "original",
        email: null,
      });

      await repo.save({
        id: "user-1",
        username: "updated",
        email: "new@example.com",
      });

      const user = await repo.findById("user-1");
      expect(user!.username).toBe("updated");
      expect(user!.email).toBe("new@example.com");
    });

    it("should delete user", async () => {
      await repo.save({
        id: "user-1",
        username: "testuser",
        email: null,
      });

      await repo.delete("user-1");

      const user = await repo.findById("user-1");
      expect(user).toBeNull();
    });

    it("should find all users", async () => {
      await repo.save({ id: "user-1", username: "user1", email: null });
      await repo.save({ id: "user-2", username: "user2", email: null });

      const users = await repo.findAll();
      expect(users).toHaveLength(2);
    });
  });

  // TEST-TURSO-REPO-002: ConfigRepository
  describe("ConfigRepository", () => {
    let repo: ConfigRepository;

    beforeEach(() => {
      repo = new ConfigRepository(connection);
    });

    it("should get default settings", async () => {
      const version = await repo.get("app.version");
      expect(version).toBe("1.0.0");
    });

    it("should set and get string setting", async () => {
      await repo.set("custom.key", "custom-value");

      const value = await repo.get("custom.key");
      expect(value).toBe("custom-value");
    });

    it("should set and get typed number setting", async () => {
      await repo.set("custom.number", 42, "number");

      const value = await repo.getTyped<number>("custom.number");
      expect(value).toBe(42);
    });

    it("should set and get typed boolean setting", async () => {
      await repo.set("custom.flag", true, "boolean");

      const value = await repo.getTyped<boolean>("custom.flag");
      expect(value).toBe(true);
    });

    it("should set and get typed JSON setting", async () => {
      await repo.set("custom.object", { key: "value" }, "json");

      const value = await repo.getTyped<{ key: string }>("custom.object");
      expect(value).toEqual({ key: "value" });
    });

    it("should return null for non-existent setting", async () => {
      const value = await repo.get("non-existent");
      expect(value).toBeNull();
    });

    it("should get all settings", async () => {
      const settings = await repo.getAll();
      expect(settings.length).toBeGreaterThan(0);
    });

    it("should get all settings as map", async () => {
      const map = await repo.getAllAsMap();
      expect(map.get("app.version")).toBe("1.0.0");
      expect(map.get("dashboard.port")).toBe(3000);
    });

    it("should check if setting exists", async () => {
      expect(await repo.exists("app.version")).toBe(true);
      expect(await repo.exists("non-existent")).toBe(false);
    });

    it("should delete setting", async () => {
      await repo.set("temp.key", "temp-value");
      await repo.delete("temp.key");

      const value = await repo.get("temp.key");
      expect(value).toBeNull();
    });
  });

  // TEST-TURSO-REPO-003: AuditLogRepository
  describe("AuditLogRepository", () => {
    let repo: AuditLogRepository;

    beforeEach(() => {
      repo = new AuditLogRepository(connection);
    });

    it("should log action", async () => {
      await repo.log("CREATE", "Object", "obj-1", "user-1", { title: "Test" });

      const logs = await repo.findRecent(1);

      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("CREATE");
      expect(logs[0].entityType).toBe("Object");
      expect(logs[0].entityId).toBe("obj-1");
      expect(logs[0].userId).toBe("user-1");
      expect(logs[0].details).toEqual({ title: "Test" });
    });

    it("should log action without user", async () => {
      await repo.log("DELETE", "Object", "obj-1");

      const logs = await repo.findRecent(1);

      expect(logs[0].userId).toBeNull();
      expect(logs[0].details).toBeNull();
    });

    it("should find logs by entity", async () => {
      await repo.log("CREATE", "Object", "obj-1");
      await repo.log("UPDATE", "Object", "obj-1");
      await repo.log("CREATE", "Object", "obj-2");

      const logs = await repo.findByEntity("Object", "obj-1");

      expect(logs).toHaveLength(2);
    });

    it("should find logs with filter", async () => {
      await repo.log("CREATE", "Object", "obj-1", "user-1");
      await repo.log("UPDATE", "Object", "obj-1", "user-2");
      await repo.log("CREATE", "Category", "cat-1", "user-1");

      const logs = await repo.find({ action: "CREATE" });
      expect(logs).toHaveLength(2);

      const userLogs = await repo.find({ userId: "user-1" });
      expect(userLogs).toHaveLength(2);
    });

    it("should count logs", async () => {
      await repo.log("CREATE", "Object", "obj-1");
      await repo.log("CREATE", "Object", "obj-2");
      await repo.log("UPDATE", "Object", "obj-1");

      const total = await repo.count();
      expect(total).toBe(3);

      const createCount = await repo.count({ action: "CREATE" });
      expect(createCount).toBe(2);
    });

    it("should respect limit and offset", async () => {
      for (let i = 0; i < 10; i++) {
        await repo.log("CREATE", "Object", `obj-${i}`);
      }

      const page1 = await repo.find({ limit: 5 });
      expect(page1).toHaveLength(5);

      const page2 = await repo.find({ limit: 5, offset: 5 });
      expect(page2).toHaveLength(5);
    });
  });
});
