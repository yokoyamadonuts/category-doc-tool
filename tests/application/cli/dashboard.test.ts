/**
 * CLI Dashboard Command Tests
 * Verifies: REQ-VIS-001
 */
import { describe, expect, it, afterEach } from "bun:test";
import {
  createDashboardServer,
  type DashboardOptions,
  type DashboardServer,
} from "../../../src/application/cli/dashboard";
import { createCategory } from "../../../src/domain/entities/Category";
import { createCategoryObject } from "../../../src/domain/entities/Object";
import { createMorphism } from "../../../src/domain/entities/Morphism";

describe("CLI Dashboard Command", () => {
  let server: DashboardServer | null = null;

  afterEach(async () => {
    if (server) {
      await server.stop();
      server = null;
    }
  });

  // Test data
  const testCategory = createCategory(
    "test-cat",
    "Test Category",
    [
      createCategoryObject("obj-1", "Object 1", "test"),
      createCategoryObject("obj-2", "Object 2", "test"),
    ],
    [createMorphism("m-1", "f", "obj-1", "obj-2")]
  );

  const testData = {
    categories: [testCategory],
    functors: [],
    naturalTransformations: [],
  };

  // TEST-DASHBOARD-001: Server creation
  describe("createDashboardServer", () => {
    it("should create dashboard server", () => {
      server = createDashboardServer(testData);

      expect(server).toBeDefined();
      expect(server.start).toBeDefined();
      expect(server.stop).toBeDefined();
    });

    it("should use default port 3000", () => {
      server = createDashboardServer(testData);

      expect(server.port).toBe(3000);
    });

    it("should use custom port", () => {
      server = createDashboardServer(testData, { port: 4000 });

      expect(server.port).toBe(4000);
    });

    it("should use localhost by default", () => {
      server = createDashboardServer(testData);

      expect(server.host).toBe("127.0.0.1");
    });
  });

  // TEST-DASHBOARD-002: Server start/stop
  describe("server lifecycle", () => {
    it("should start and stop server", async () => {
      server = createDashboardServer(testData, { port: 3001 });

      const url = await server.start();
      expect(url).toBe("http://127.0.0.1:3001");

      await server.stop();
    });

    it("should be able to restart server", async () => {
      server = createDashboardServer(testData, { port: 3002 });

      await server.start();
      await server.stop();

      const url = await server.start();
      expect(url).toBe("http://127.0.0.1:3002");
    });
  });

  // TEST-DASHBOARD-003: API accessibility
  describe("API accessibility", () => {
    it("should respond to health check", async () => {
      server = createDashboardServer(testData, { port: 3003 });
      await server.start();

      const res = await fetch("http://127.0.0.1:3003/api/health");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe("ok");
    });

    it("should respond to objects endpoint", async () => {
      server = createDashboardServer(testData, { port: 3004 });
      await server.start();

      const res = await fetch("http://127.0.0.1:3004/api/objects");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.objects).toHaveLength(2);
    });

    it("should respond to graph endpoint", async () => {
      server = createDashboardServer(testData, { port: 3005 });
      await server.start();

      const res = await fetch("http://127.0.0.1:3005/api/graph");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.nodes).toBeDefined();
      expect(data.edges).toBeDefined();
    });
  });

  // TEST-DASHBOARD-004: Options
  describe("options", () => {
    it("should report isRunning status", async () => {
      server = createDashboardServer(testData, { port: 3006 });

      expect(server.isRunning).toBe(false);

      await server.start();
      expect(server.isRunning).toBe(true);

      await server.stop();
      expect(server.isRunning).toBe(false);
    });

    it("should provide URL", async () => {
      server = createDashboardServer(testData, { port: 3007 });
      await server.start();

      expect(server.url).toBe("http://127.0.0.1:3007");
    });
  });
});
