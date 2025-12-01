/**
 * CategoryObject Entity Tests
 * Verifies: REQ-DOC-001, REQ-DOC-002
 */
import { describe, expect, it } from "bun:test";
import {
  createCategoryObject,
  getId,
  getTitle,
  getDomain,
  getMetadata,
  getContent,
} from "../../src/domain/entities/Object";

describe("CategoryObject Entity", () => {
  // TEST-OBJ-001: createCategoryObject creates object with all properties
  describe("createCategoryObject", () => {
    it("should create an object with all required properties", () => {
      // Verifies: REQ-DOC-001
      const obj = createCategoryObject(
        "obj-001",
        "Test Document",
        "business-domain",
        { author: "test", version: "1.0" },
        "# Content\n\nThis is the content."
      );

      expect(getId(obj)).toBe("obj-001");
      expect(getTitle(obj)).toBe("Test Document");
      expect(getDomain(obj)).toBe("business-domain");
      expect(getMetadata(obj)).toEqual({ author: "test", version: "1.0" });
      expect(getContent(obj)).toBe("# Content\n\nThis is the content.");
    });

    it("should create an object with optional content as undefined", () => {
      // Verifies: REQ-DOC-001
      const obj = createCategoryObject(
        "obj-002",
        "No Content Doc",
        "spec-domain",
        {}
      );

      expect(getId(obj)).toBe("obj-002");
      expect(getContent(obj)).toBeUndefined();
    });

    it("should create an object with empty metadata", () => {
      // Verifies: REQ-DOC-001
      const obj = createCategoryObject("obj-003", "Minimal Doc", "domain", {});

      expect(getMetadata(obj)).toEqual({});
    });
  });

  // TEST-OBJ-002: Validation tests
  describe("validation", () => {
    it("should throw error when id is empty", () => {
      // Verifies: REQ-DOC-002
      expect(() => {
        createCategoryObject("", "Title", "domain", {});
      }).toThrow("id must be a non-empty string");
    });

    it("should throw error when title is empty", () => {
      // Verifies: REQ-DOC-002
      expect(() => {
        createCategoryObject("obj-001", "", "domain", {});
      }).toThrow("title must be a non-empty string");
    });

    it("should throw error when domain is empty", () => {
      // Verifies: REQ-DOC-002
      expect(() => {
        createCategoryObject("obj-001", "Title", "", {});
      }).toThrow("domain must be a non-empty string");
    });
  });

  // TEST-OBJ-003: Factory method tests (CategoryObject.create)
  describe("CategoryObject.create", () => {
    it("should create object with all parameters", () => {
      // Verifies: REQ-DOC-001
      const { CategoryObject } = require("../../src/domain/entities/Object");
      const obj = CategoryObject.create(
        "obj-004",
        "Factory Created",
        "test-domain",
        { key: "value" },
        "Content here"
      );

      expect(getId(obj)).toBe("obj-004");
      expect(getTitle(obj)).toBe("Factory Created");
      expect(getDomain(obj)).toBe("test-domain");
      expect(getMetadata(obj)).toEqual({ key: "value" });
      expect(getContent(obj)).toBe("Content here");
    });

    it("should create object with default metadata when not provided", () => {
      // Verifies: REQ-DOC-001
      const { CategoryObject } = require("../../src/domain/entities/Object");
      const obj = CategoryObject.create("obj-005", "Minimal", "domain");

      expect(getMetadata(obj)).toEqual({});
      expect(getContent(obj)).toBeUndefined();
    });
  });

  // TEST-OBJ-004: Immutability tests
  describe("immutability", () => {
    it("should return a copy of metadata to prevent mutation", () => {
      // Verifies: REQ-DOC-002
      const originalMetadata = { key: "value" };
      const obj = createCategoryObject(
        "obj-006",
        "Immutable Test",
        "domain",
        originalMetadata
      );

      const retrievedMetadata = getMetadata(obj);
      retrievedMetadata.key = "modified";

      expect(getMetadata(obj).key).toBe("value");
    });

    it("should not allow modification of original metadata after creation", () => {
      // Verifies: REQ-DOC-002
      const metadata = { key: "original" };
      const obj = createCategoryObject(
        "obj-007",
        "Immutable Test 2",
        "domain",
        metadata
      );

      metadata.key = "modified";

      expect(getMetadata(obj).key).toBe("original");
    });
  });

  // TEST-OBJ-005: Accessor functions
  describe("accessor functions", () => {
    const testObj = createCategoryObject(
      "getter-test",
      "Getter Test Title",
      "getter-domain",
      { testKey: "testValue" },
      "Test content"
    );

    it("getId should return the correct id", () => {
      expect(getId(testObj)).toBe("getter-test");
    });

    it("getTitle should return the correct title", () => {
      expect(getTitle(testObj)).toBe("Getter Test Title");
    });

    it("getDomain should return the correct domain", () => {
      expect(getDomain(testObj)).toBe("getter-domain");
    });

    it("getMetadata should return the correct metadata", () => {
      expect(getMetadata(testObj)).toEqual({ testKey: "testValue" });
    });

    it("getContent should return the correct content", () => {
      expect(getContent(testObj)).toBe("Test content");
    });
  });

  // TEST-OBJ-006: Direct property access (functional style)
  describe("direct property access", () => {
    it("should allow direct property access on the immutable object", () => {
      const obj = createCategoryObject(
        "direct-001",
        "Direct Access",
        "test-domain",
        { prop: "value" },
        "content"
      );

      expect(obj.id).toBe("direct-001");
      expect(obj.title).toBe("Direct Access");
      expect(obj.domain).toBe("test-domain");
      expect(obj.content).toBe("content");
    });
  });
});
