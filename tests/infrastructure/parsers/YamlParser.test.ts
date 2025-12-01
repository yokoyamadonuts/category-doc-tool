/**
 * YAML Parser Tests
 * Verifies: REQ-CAT-001, REQ-CAT-003, REQ-CAT-004
 */
import { describe, expect, it } from "bun:test";
import {
  YamlParser,
  type CategoryConfig,
} from "../../../src/infrastructure/parsers/YamlParser";

describe("YamlParser", () => {
  const parser = new YamlParser();

  // TEST-YAML-001: Parse valid YAML content
  describe("parseContent", () => {
    it("should parse valid category configuration", () => {
      const yaml = `
categories:
  - id: cat-1
    name: Test Category
    objects:
      - id: obj-1
        title: Object 1
        domain: test
      - id: obj-2
        title: Object 2
        domain: test
    morphisms:
      - id: morph-1
        name: f
        source: obj-1
        target: obj-2
`;

      const config = parser.parseContent(yaml);

      expect(config.categories).toHaveLength(1);
      expect(config.categories[0].id).toBe("cat-1");
      expect(config.categories[0].objects).toHaveLength(2);
      expect(config.categories[0].morphisms).toHaveLength(1);
    });

    it("should parse configuration with functors", () => {
      const yaml = `
categories:
  - id: cat-A
    name: Category A
    objects: []
    morphisms: []
  - id: cat-B
    name: Category B
    objects: []
    morphisms: []
functors:
  - id: F
    name: Functor F
    sourceCategory: cat-A
    targetCategory: cat-B
    objectMapping:
      a: b
    morphismMapping:
      f: g
`;

      const config = parser.parseContent(yaml);

      expect(config.functors).toHaveLength(1);
      expect(config.functors[0].id).toBe("F");
      expect(config.functors[0].objectMapping).toEqual({ a: "b" });
    });

    it("should parse configuration with natural transformations", () => {
      const yaml = `
categories: []
functors:
  - id: F
    name: F
    sourceCategory: C
    targetCategory: C
    objectMapping: {}
    morphismMapping: {}
  - id: G
    name: G
    sourceCategory: C
    targetCategory: C
    objectMapping: {}
    morphismMapping: {}
naturalTransformations:
  - id: eta
    name: η
    sourceFunctor: F
    targetFunctor: G
    components:
      a: morph-a
      b: morph-b
`;

      const config = parser.parseContent(yaml);

      expect(config.naturalTransformations).toHaveLength(1);
      expect(config.naturalTransformations[0].id).toBe("eta");
      expect(config.naturalTransformations[0].components).toEqual({
        a: "morph-a",
        b: "morph-b",
      });
    });

    it("should handle empty configuration", () => {
      const yaml = `
categories: []
`;

      const config = parser.parseContent(yaml);

      expect(config.categories).toHaveLength(0);
      expect(config.functors).toHaveLength(0);
      expect(config.naturalTransformations).toHaveLength(0);
    });

    it("should handle missing optional sections", () => {
      const yaml = `
categories:
  - id: cat-1
    name: Only Category
    objects: []
    morphisms: []
`;

      const config = parser.parseContent(yaml);

      expect(config.categories).toHaveLength(1);
      expect(config.functors).toHaveLength(0);
      expect(config.naturalTransformations).toHaveLength(0);
    });
  });

  // TEST-YAML-002: Validation
  describe("validate", () => {
    it("should validate valid configuration", () => {
      const config: CategoryConfig = {
        categories: [
          {
            id: "cat-1",
            name: "Test",
            objects: [{ id: "obj-1", title: "Obj", domain: "test" }],
            morphisms: [],
          },
        ],
        functors: [],
        naturalTransformations: [],
      };

      const result = parser.validate(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should report error for category without id", () => {
      const config: CategoryConfig = {
        categories: [
          {
            id: "",
            name: "Test",
            objects: [],
            morphisms: [],
          },
        ],
        functors: [],
        naturalTransformations: [],
      };

      const result = parser.validate(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("id"))).toBe(true);
    });

    it("should report error for category without name", () => {
      const config: CategoryConfig = {
        categories: [
          {
            id: "cat-1",
            name: "",
            objects: [],
            morphisms: [],
          },
        ],
        functors: [],
        naturalTransformations: [],
      };

      const result = parser.validate(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("name"))).toBe(true);
    });

    it("should report error for morphism with missing source", () => {
      const config: CategoryConfig = {
        categories: [
          {
            id: "cat-1",
            name: "Test",
            objects: [{ id: "obj-1", title: "Obj", domain: "test" }],
            morphisms: [
              { id: "m-1", name: "f", source: "missing", target: "obj-1" },
            ],
          },
        ],
        functors: [],
        naturalTransformations: [],
      };

      const result = parser.validate(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("source"))).toBe(true);
    });

    it("should report error for functor with invalid source category", () => {
      const config: CategoryConfig = {
        categories: [{ id: "cat-A", name: "A", objects: [], morphisms: [] }],
        functors: [
          {
            id: "F",
            name: "F",
            sourceCategory: "missing",
            targetCategory: "cat-A",
            objectMapping: {},
            morphismMapping: {},
          },
        ],
        naturalTransformations: [],
      };

      const result = parser.validate(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("sourceCategory"))).toBe(true);
    });

    it("should report warning for empty category", () => {
      const config: CategoryConfig = {
        categories: [{ id: "cat-1", name: "Empty", objects: [], morphisms: [] }],
        functors: [],
        naturalTransformations: [],
      };

      const result = parser.validate(config);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("empty"))).toBe(true);
    });
  });

  // TEST-YAML-003: Convert to entities
  describe("toEntities", () => {
    it("should convert config to domain entities", () => {
      const config: CategoryConfig = {
        categories: [
          {
            id: "cat-1",
            name: "Test Category",
            objects: [
              { id: "obj-1", title: "Object 1", domain: "test" },
              { id: "obj-2", title: "Object 2", domain: "test" },
            ],
            morphisms: [
              { id: "m-1", name: "f", source: "obj-1", target: "obj-2" },
            ],
          },
        ],
        functors: [],
        naturalTransformations: [],
      };

      const entities = parser.toEntities(config);

      expect(entities.categories).toHaveLength(1);
      expect(entities.categories[0].id).toBe("cat-1");
      expect(entities.categories[0].objects).toHaveLength(2);
      expect(entities.categories[0].morphisms).toHaveLength(1);
    });

    it("should convert functors with Map types", () => {
      const config: CategoryConfig = {
        categories: [
          { id: "A", name: "A", objects: [], morphisms: [] },
          { id: "B", name: "B", objects: [], morphisms: [] },
        ],
        functors: [
          {
            id: "F",
            name: "F",
            sourceCategory: "A",
            targetCategory: "B",
            objectMapping: { a: "b" },
            morphismMapping: { f: "g" },
          },
        ],
        naturalTransformations: [],
      };

      const entities = parser.toEntities(config);

      expect(entities.functors).toHaveLength(1);
      expect(entities.functors[0].objectMapping.get("a")).toBe("b");
      expect(entities.functors[0].morphismMapping.get("f")).toBe("g");
    });

    it("should convert natural transformations with Map types", () => {
      const config: CategoryConfig = {
        categories: [],
        functors: [
          {
            id: "F",
            name: "F",
            sourceCategory: "C",
            targetCategory: "C",
            objectMapping: {},
            morphismMapping: {},
          },
          {
            id: "G",
            name: "G",
            sourceCategory: "C",
            targetCategory: "C",
            objectMapping: {},
            morphismMapping: {},
          },
        ],
        naturalTransformations: [
          {
            id: "eta",
            name: "η",
            sourceFunctor: "F",
            targetFunctor: "G",
            components: { a: "m-a" },
          },
        ],
      };

      const entities = parser.toEntities(config);

      expect(entities.naturalTransformations).toHaveLength(1);
      expect(entities.naturalTransformations[0].components.get("a")).toBe("m-a");
    });
  });

  // TEST-YAML-004: Error handling
  describe("error handling", () => {
    it("should throw error for invalid YAML syntax", () => {
      const invalidYaml = `
categories:
  - id: cat-1
    name: Test
    objects:
      - id: obj-1
        title: Object 1
      invalid indentation here
`;

      expect(() => parser.parseContent(invalidYaml)).toThrow();
    });

    it("should handle null values gracefully", () => {
      const yaml = `
categories:
  - id: cat-1
    name: Test
    objects: null
    morphisms: null
`;

      const config = parser.parseContent(yaml);

      expect(config.categories[0].objects).toEqual([]);
      expect(config.categories[0].morphisms).toEqual([]);
    });
  });
});
