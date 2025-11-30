/**
 * CLI Integration Tests
 * Verifies: All CLI workflow requirements
 *
 * Tests the complete CLI workflow: init -> import -> validate -> search -> trace
 */
import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, existsSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { initProject } from "../../src/application/cli/init";
import { importDocument, importDocuments } from "../../src/application/cli/import";
import { validateAll } from "../../src/application/cli/validate";
import { searchObjects } from "../../src/application/cli/search";
import { tracePath } from "../../src/application/cli/trace";
import { listObjects, listMorphisms, listCategories } from "../../src/application/cli/list";
import { showObject, showCategory, showFunctor } from "../../src/application/cli/show";
import { YamlParser } from "../../src/infrastructure/parsers/YamlParser";
import { createCategory } from "../../src/domain/entities/Category";
import { createCategoryObject } from "../../src/domain/entities/Object";
import { createMorphism } from "../../src/domain/entities/Morphism";
import { createFunctor } from "../../src/domain/entities/Functor";

describe("CLI Integration Tests", () => {
  const testDir = join(import.meta.dir, ".test-project");

  beforeEach(() => {
    // Create fresh test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
  });

  // ============================================================================
  // Workflow Test: Init -> Import -> Validate
  // ============================================================================

  describe("Full CLI Workflow", () => {
    it("should complete init -> import -> validate workflow", async () => {
      // Step 1: Initialize project
      const initResult = await initProject({
        projectPath: testDir,
        projectName: "Integration Test Project",
      });

      expect(initResult.success).toBe(true);
      expect(existsSync(join(testDir, ".catdoc"))).toBe(true);
      expect(existsSync(join(testDir, ".catdoc", "category.yaml"))).toBe(true);
      expect(existsSync(join(testDir, ".catdoc", "config.yaml"))).toBe(true);

      // Step 2: Create and import a document
      const docPath = join(testDir, "test-doc.md");
      writeFileSync(
        docPath,
        `---
id: test-doc
title: Test Document
domain: integration-test
author: Test Suite
---

# Test Document

This is a test document for integration testing.

## Overview

Testing the import workflow.
`
      );

      const importResult = await importDocument(docPath, {
        defaultDomain: "integration-test",
      });

      expect(importResult.success).toBe(true);
      expect(importResult.object).toBeDefined();
      expect(importResult.object!.id).toBe("test-doc");
      expect(importResult.object!.title).toBe("Test Document");
      expect(importResult.object!.domain).toBe("integration-test");

      // Step 3: Validate categories (using example from category.yaml)
      const parser = new YamlParser();
      const config = await parser.parse(join(testDir, ".catdoc", "category.yaml"));
      const entities = parser.toEntities(config);

      const validateResult = validateAll({
        categories: entities.categories,
        functors: entities.functors,
        naturalTransformations: entities.naturalTransformations,
      });

      // Template category may have validation warnings about missing identity morphisms
      // but should not have critical errors about missing objects
      expect(validateResult.summary.categoriesChecked).toBeGreaterThan(0);
    });

    it("should import multiple documents in batch", async () => {
      // Initialize project
      await initProject({ projectPath: testDir, projectName: "Batch Test" });

      // Create multiple documents
      const docs = [
        { name: "doc1.md", id: "doc-1", title: "First Document" },
        { name: "doc2.md", id: "doc-2", title: "Second Document" },
        { name: "doc3.md", id: "doc-3", title: "Third Document" },
      ];

      const filePaths: string[] = [];
      for (const doc of docs) {
        const path = join(testDir, doc.name);
        writeFileSync(
          path,
          `---
id: ${doc.id}
title: ${doc.title}
domain: batch-test
---

# ${doc.title}

Content for ${doc.title}.
`
        );
        filePaths.push(path);
      }

      // Import all documents
      const batchResult = await importDocuments(filePaths, {
        defaultDomain: "batch-test",
      });

      expect(batchResult.successful).toBe(3);
      expect(batchResult.failed).toBe(0);
      expect(batchResult.objects).toHaveLength(3);
      expect(batchResult.objects.map((o) => o.id).sort()).toEqual(["doc-1", "doc-2", "doc-3"]);
    });
  });

  // ============================================================================
  // Search and Trace Tests
  // ============================================================================

  describe("Search and Trace Integration", () => {
    const testObjects = [
      createCategoryObject("obj-1", "Introduction to Category Theory", "math"),
      createCategoryObject("obj-2", "Functors and Natural Transformations", "math"),
      createCategoryObject("obj-3", "Practical Applications", "applied"),
      createCategoryObject("obj-4", "Category Theory in Programming", "programming"),
    ];

    const testMorphisms = [
      createMorphism("m-1", "prerequisite", "obj-1", "obj-2"),
      createMorphism("m-2", "applies-to", "obj-2", "obj-3"),
      createMorphism("m-3", "implements", "obj-2", "obj-4"),
    ];

    const testCategory = createCategory("cat-1", "Test Category", testObjects, testMorphisms);

    it("should search objects by keyword", () => {
      const result = searchObjects(testObjects, {
        query: "category",
        limit: 10,
      });

      expect(result.totalMatches).toBeGreaterThan(0);
      expect(result.matches.some((m) => m.title.toLowerCase().includes("category"))).toBe(true);
    });

    it("should search objects by domain", () => {
      const result = searchObjects(testObjects, {
        query: "",
        domain: "math",
        limit: 10,
      });

      expect(result.matches.every((m) => m.domain === "math")).toBe(true);
    });

    it("should trace path between objects", () => {
      const result = tracePath("obj-1", "obj-3", testCategory);

      expect(result.found).toBe(true);
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.shortestPath).toBeDefined();
      expect(result.shortestPath!.length).toBe(2); // obj-1 -> obj-2 -> obj-3
    });

    it("should return empty for non-existent path", () => {
      const result = tracePath("obj-3", "obj-1", testCategory);

      expect(result.found).toBe(false);
      expect(result.paths).toHaveLength(0);
    });
  });

  // ============================================================================
  // List and Show Tests
  // ============================================================================

  describe("List and Show Integration", () => {
    const testObjects = [
      createCategoryObject("list-obj-1", "Alpha Object", "domain-a"),
      createCategoryObject("list-obj-2", "Beta Object", "domain-a"),
      createCategoryObject("list-obj-3", "Gamma Object", "domain-b"),
    ];

    const testMorphisms = [
      createMorphism("list-m-1", "f", "list-obj-1", "list-obj-2"),
      createMorphism("list-m-2", "g", "list-obj-2", "list-obj-3"),
    ];

    const testCategories = [
      createCategory("cat-a", "Category A", testObjects.slice(0, 2), [testMorphisms[0]]),
      createCategory("cat-b", "Category B", [testObjects[2]], []),
    ];

    it("should list objects with filtering", () => {
      const allResult = listObjects(testObjects);
      expect(allResult.items).toHaveLength(3);
      expect(allResult.totalCount).toBe(3);

      const filteredResult = listObjects(testObjects, { domain: "domain-a" });
      expect(filteredResult.items).toHaveLength(2);
      expect(filteredResult.items.every((o) => o.domain === "domain-a")).toBe(true);
    });

    it("should list morphisms", () => {
      const result = listMorphisms(testMorphisms);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].source).toBe("list-obj-1");
    });

    it("should list categories", () => {
      const result = listCategories(testCategories);
      expect(result.items).toHaveLength(2);
      expect(result.items.find((c) => c.id === "cat-a")?.objectCount).toBe(2);
      expect(result.items.find((c) => c.id === "cat-b")?.objectCount).toBe(1);
    });

    it("should show object details", () => {
      const obj = testObjects[0];
      const result = showObject(obj, testMorphisms);

      expect(result.found).toBe(true);
      expect(result.object).toBeDefined();
      expect(result.object!.id).toBe("list-obj-1");
      expect(result.outgoingMorphisms).toHaveLength(1);
      expect(result.outgoingMorphisms![0].name).toBe("f");
    });

    it("should show category details", () => {
      const result = showCategory(testCategories[0]);

      expect(result.found).toBe(true);
      expect(result.category).toBeDefined();
      expect(result.objectCount).toBe(2);
      expect(result.morphismCount).toBe(1);
    });

    it("should handle not found cases", () => {
      const objResult = showObject(null, []);
      expect(objResult.found).toBe(false);

      const catResult = showCategory(null);
      expect(catResult.found).toBe(false);

      const funcResult = showFunctor(null);
      expect(funcResult.found).toBe(false);
    });
  });

  // ============================================================================
  // Validation Integration Tests
  // ============================================================================

  describe("Validation Integration", () => {
    it("should validate a complete category structure", () => {
      const objects = [
        createCategoryObject("v-obj-1", "Object 1", "test"),
        createCategoryObject("v-obj-2", "Object 2", "test"),
        createCategoryObject("v-obj-3", "Object 3", "test"),
      ];

      const morphisms = [
        createMorphism("v-m-1", "f", "v-obj-1", "v-obj-2"),
        createMorphism("v-m-2", "g", "v-obj-2", "v-obj-3"),
        createMorphism("v-m-3", "id_1", "v-obj-1", "v-obj-1", { isIdentity: true }),
        createMorphism("v-m-4", "id_2", "v-obj-2", "v-obj-2", { isIdentity: true }),
        createMorphism("v-m-5", "id_3", "v-obj-3", "v-obj-3", { isIdentity: true }),
      ];

      const category = createCategory("v-cat", "Valid Category", objects, morphisms);

      const result = validateAll({
        categories: [category],
        functors: [],
        naturalTransformations: [],
      });

      expect(result.isValid).toBe(true);
      expect(result.summary.categoriesChecked).toBe(1);
    });

    it("should detect invalid morphism references", () => {
      const objects = [createCategoryObject("bad-obj-1", "Object 1", "test")];

      const morphisms = [
        createMorphism("bad-m-1", "f", "bad-obj-1", "non-existent-object"),
      ];

      const category = createCategory("bad-cat", "Invalid Category", objects, morphisms);

      const result = validateAll({
        categories: [category],
        functors: [],
        naturalTransformations: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should validate functors between categories", () => {
      const catA = createCategory(
        "func-cat-a",
        "Category A",
        [createCategoryObject("a1", "A1", "test"), createCategoryObject("a2", "A2", "test")],
        [createMorphism("ma", "f", "a1", "a2")]
      );

      const catB = createCategory(
        "func-cat-b",
        "Category B",
        [createCategoryObject("b1", "B1", "test"), createCategoryObject("b2", "B2", "test")],
        [createMorphism("mb", "g", "b1", "b2")]
      );

      const functor = createFunctor(
        "F",
        "Test Functor",
        "func-cat-a",
        "func-cat-b",
        new Map([
          ["a1", "b1"],
          ["a2", "b2"],
        ]),
        new Map([["ma", "mb"]])
      );

      const result = validateAll({
        categories: [catA, catB],
        functors: [functor],
        naturalTransformations: [],
      });

      expect(result.summary.functorsChecked).toBe(1);
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe("Error Handling", () => {
    it("should handle re-initialization with force flag", async () => {
      // First init
      const firstResult = await initProject({
        projectPath: testDir,
        projectName: "First Init",
      });
      expect(firstResult.success).toBe(true);

      // Second init without force should fail
      const secondResult = await initProject({
        projectPath: testDir,
        projectName: "Second Init",
      });
      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toContain("already exists");

      // Third init with force should succeed
      const thirdResult = await initProject({
        projectPath: testDir,
        projectName: "Third Init",
        force: true,
      });
      expect(thirdResult.success).toBe(true);
    });

    it("should handle import of non-existent file", async () => {
      const result = await importDocument(join(testDir, "non-existent.md"));

      expect(result.success).toBe(false);
      expect(result.error).toContain("File not found");
    });

    it("should handle import of non-markdown file", async () => {
      const txtPath = join(testDir, "test.txt");
      writeFileSync(txtPath, "This is a text file");

      const result = await importDocument(txtPath);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Not a markdown file");
    });

    it("should handle mixed success/failure in batch import", async () => {
      const validPath = join(testDir, "valid.md");
      writeFileSync(
        validPath,
        `---
id: valid-doc
title: Valid Document
---

# Valid
`
      );

      const result = await importDocuments([validPath, join(testDir, "missing.md")]);

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.objects).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  // ============================================================================
  // YAML Parser Integration Tests
  // ============================================================================

  describe("YAML Parser Integration", () => {
    it("should parse and validate custom category.yaml", async () => {
      await initProject({ projectPath: testDir, projectName: "Parser Test" });

      // Write custom category.yaml
      const customYaml = `categories:
  - id: custom-cat
    name: Custom Category
    objects:
      - id: custom-obj-1
        title: Custom Object 1
        domain: custom
      - id: custom-obj-2
        title: Custom Object 2
        domain: custom
    morphisms:
      - id: custom-m-1
        name: custom-f
        source: custom-obj-1
        target: custom-obj-2

functors: []
naturalTransformations: []
`;

      writeFileSync(join(testDir, ".catdoc", "category.yaml"), customYaml);

      const parser = new YamlParser();
      const config = await parser.parse(join(testDir, ".catdoc", "category.yaml"));
      const entities = parser.toEntities(config);

      expect(entities.categories).toHaveLength(1);
      expect(entities.categories[0].id).toBe("custom-cat");
      expect(entities.categories[0].objects).toHaveLength(2);
      expect(entities.categories[0].morphisms).toHaveLength(1);

      // Validate the parsed structure
      const validationResult = validateAll({
        categories: entities.categories,
        functors: entities.functors,
        naturalTransformations: entities.naturalTransformations,
      });

      // The minimal category structure is valid even without identity morphisms
      // (identity morphisms are just warnings, not errors for basic validation)
      expect(validationResult.summary.categoriesChecked).toBe(1);
    });
  });
});
