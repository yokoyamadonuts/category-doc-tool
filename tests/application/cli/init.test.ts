/**
 * CLI Init Command Tests
 * Verifies: REQ-SYS-002
 */
import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { existsSync, mkdirSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { initProject, type InitOptions, type InitResult } from "../../../src/application/cli/init";

describe("CLI Init Command", () => {
  const testDir = "/tmp/catdoc-test-init";

  beforeEach(() => {
    // Clean up test directory before each test
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up after each test
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  // TEST-INIT-001: Create .catdoc directory
  describe("initProject", () => {
    it("should create .catdoc directory structure", async () => {
      const result = await initProject({ projectPath: testDir });

      expect(result.success).toBe(true);
      expect(existsSync(join(testDir, ".catdoc"))).toBe(true);
      expect(existsSync(join(testDir, ".catdoc", "category.yaml"))).toBe(true);
      expect(existsSync(join(testDir, ".catdoc", "config.yaml"))).toBe(true);
    });

    it("should generate category.yaml template with examples", async () => {
      await initProject({ projectPath: testDir });

      const content = readFileSync(
        join(testDir, ".catdoc", "category.yaml"),
        "utf-8"
      );

      expect(content).toContain("categories:");
      expect(content).toContain("objects:");
      expect(content).toContain("morphisms:");
    });

    it("should generate config.yaml with database settings", async () => {
      await initProject({ projectPath: testDir });

      const content = readFileSync(
        join(testDir, ".catdoc", "config.yaml"),
        "utf-8"
      );

      expect(content).toContain("neo4j:");
      expect(content).toContain("turso:");
    });

    it("should create docs directory for documents", async () => {
      await initProject({ projectPath: testDir });

      expect(existsSync(join(testDir, ".catdoc", "docs"))).toBe(true);
    });
  });

  // TEST-INIT-002: Handle existing directory
  describe("existing project", () => {
    it("should fail if .catdoc already exists without force option", async () => {
      // Create existing .catdoc directory
      mkdirSync(join(testDir, ".catdoc"), { recursive: true });

      const result = await initProject({ projectPath: testDir });

      expect(result.success).toBe(false);
      expect(result.error).toContain("already exists");
    });

    it("should overwrite with force option", async () => {
      // Create existing .catdoc directory with a file
      mkdirSync(join(testDir, ".catdoc"), { recursive: true });

      const result = await initProject({
        projectPath: testDir,
        force: true,
      });

      expect(result.success).toBe(true);
      expect(existsSync(join(testDir, ".catdoc", "category.yaml"))).toBe(true);
    });
  });

  // TEST-INIT-003: Options handling
  describe("options", () => {
    it("should use custom project name", async () => {
      const result = await initProject({
        projectPath: testDir,
        projectName: "My Category Project",
      });

      expect(result.success).toBe(true);
      const content = readFileSync(
        join(testDir, ".catdoc", "config.yaml"),
        "utf-8"
      );
      expect(content).toContain("My Category Project");
    });

    it("should use default project name if not specified", async () => {
      const result = await initProject({ projectPath: testDir });

      expect(result.success).toBe(true);
      const content = readFileSync(
        join(testDir, ".catdoc", "config.yaml"),
        "utf-8"
      );
      expect(content).toContain("name:");
    });

    it("should skip database initialization by default", async () => {
      const result = await initProject({ projectPath: testDir });

      expect(result.success).toBe(true);
      expect(result.databaseInitialized).toBe(false);
    });
  });

  // TEST-INIT-004: Error handling
  describe("error handling", () => {
    it("should handle invalid project path", async () => {
      const result = await initProject({
        projectPath: "/nonexistent/path/that/should/fail",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return appropriate messages", async () => {
      const result = await initProject({ projectPath: testDir });

      expect(result.success).toBe(true);
      expect(result.messages).toBeDefined();
      expect(result.messages!.length).toBeGreaterThan(0);
    });
  });

  // TEST-INIT-005: Template content
  describe("template content", () => {
    it("should generate valid YAML template", async () => {
      await initProject({ projectPath: testDir });

      const content = readFileSync(
        join(testDir, ".catdoc", "category.yaml"),
        "utf-8"
      );

      // Should have example category
      expect(content).toContain("id:");
      expect(content).toContain("name:");

      // Should have functors section (even if empty)
      expect(content).toContain("functors:");

      // Should have natural transformations section
      expect(content).toContain("naturalTransformations:");
    });

    it("should generate example document template", async () => {
      await initProject({ projectPath: testDir });

      const exampleDocPath = join(testDir, ".catdoc", "docs", "example.md");
      expect(existsSync(exampleDocPath)).toBe(true);

      const content = readFileSync(exampleDocPath, "utf-8");
      expect(content).toContain("---"); // frontmatter
      expect(content).toContain("id:");
      expect(content).toContain("domain:");
    });
  });
});
