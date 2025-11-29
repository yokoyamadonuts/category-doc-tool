/**
 * CompositionService Tests
 * Verifies: REQ-CAT-002
 */
import { describe, expect, it } from "bun:test";
import {
  composeMorphisms,
  composeFunctors,
} from "../../../src/domain/services/CompositionService";
import { createMorphism } from "../../../src/domain/entities/Morphism";
import { createFunctor } from "../../../src/domain/entities/Functor";

describe("CompositionService", () => {
  // TEST-COMP-001: composeMorphisms tests
  describe("composeMorphisms", () => {
    it("should compose two morphisms when target matches source", () => {
      // Verifies: REQ-CAT-002
      const f = createMorphism("f", "f", "A", "B");
      const g = createMorphism("g", "g", "B", "C");

      const composed = composeMorphisms(f, g);

      expect(composed).not.toBeNull();
      expect(composed!.id).toBe("composed-f-g");
      expect(composed!.name).toBe("g∘f");
      expect(composed!.source).toBe("A");
      expect(composed!.target).toBe("C");
    });

    it("should return null when target does not match source", () => {
      // Verifies: REQ-CAT-002
      const f = createMorphism("f", "f", "A", "B");
      const g = createMorphism("g", "g", "C", "D"); // B != C

      const composed = composeMorphisms(f, g);

      expect(composed).toBeNull();
    });

    it("should compose with identity morphism on the right", () => {
      // Verifies: REQ-CAT-002
      const f = createMorphism("f", "f", "A", "B");
      const idB = createMorphism("id-B", "id_B", "B", "B");

      const composed = composeMorphisms(f, idB);

      expect(composed).not.toBeNull();
      expect(composed!.source).toBe("A");
      expect(composed!.target).toBe("B");
    });

    it("should compose with identity morphism on the left", () => {
      // Verifies: REQ-CAT-002
      const idA = createMorphism("id-A", "id_A", "A", "A");
      const f = createMorphism("f", "f", "A", "B");

      const composed = composeMorphisms(idA, f);

      expect(composed).not.toBeNull();
      expect(composed!.source).toBe("A");
      expect(composed!.target).toBe("B");
    });

    it("should preserve metadata from both morphisms in composition", () => {
      // Verifies: REQ-CAT-002
      const f = createMorphism("f", "f", "A", "B", { type: "dependency" });
      const g = createMorphism("g", "g", "B", "C", { priority: "high" });

      const composed = composeMorphisms(f, g);

      expect(composed).not.toBeNull();
      expect(composed!.metadata).toEqual({
        composedFrom: ["f", "g"],
      });
    });

    it("should handle composition chain of three morphisms", () => {
      // Verifies: REQ-CAT-002
      const f = createMorphism("f", "f", "A", "B");
      const g = createMorphism("g", "g", "B", "C");
      const h = createMorphism("h", "h", "C", "D");

      const gf = composeMorphisms(f, g);
      expect(gf).not.toBeNull();

      const hgf = composeMorphisms(gf!, h);

      expect(hgf).not.toBeNull();
      expect(hgf!.source).toBe("A");
      expect(hgf!.target).toBe("D");
    });
  });

  // TEST-COMP-002: composeFunctors tests
  describe("composeFunctors", () => {
    it("should compose two functors when target category matches source category", () => {
      // Verifies: REQ-CAT-002
      const F = createFunctor(
        "F",
        "F",
        "cat-A",
        "cat-B",
        new Map([
          ["A1", "B1"],
          ["A2", "B2"],
        ]),
        new Map([["m1", "n1"]])
      );
      const G = createFunctor(
        "G",
        "G",
        "cat-B",
        "cat-C",
        new Map([
          ["B1", "C1"],
          ["B2", "C2"],
        ]),
        new Map([["n1", "p1"]])
      );

      const composed = composeFunctors(F, G);

      expect(composed).not.toBeNull();
      expect(composed!.id).toBe("composed-F-G");
      expect(composed!.name).toBe("G∘F");
      expect(composed!.sourceCategory).toBe("cat-A");
      expect(composed!.targetCategory).toBe("cat-C");
    });

    it("should correctly compose object mappings", () => {
      // Verifies: REQ-CAT-002
      const F = createFunctor(
        "F",
        "F",
        "A",
        "B",
        new Map([
          ["a1", "b1"],
          ["a2", "b2"],
        ]),
        new Map()
      );
      const G = createFunctor(
        "G",
        "G",
        "B",
        "C",
        new Map([
          ["b1", "c1"],
          ["b2", "c2"],
        ]),
        new Map()
      );

      const composed = composeFunctors(F, G);

      expect(composed).not.toBeNull();
      expect(composed!.objectMapping.get("a1")).toBe("c1");
      expect(composed!.objectMapping.get("a2")).toBe("c2");
    });

    it("should correctly compose morphism mappings", () => {
      // Verifies: REQ-CAT-002
      const F = createFunctor(
        "F",
        "F",
        "A",
        "B",
        new Map(),
        new Map([
          ["f1", "g1"],
          ["f2", "g2"],
        ])
      );
      const G = createFunctor(
        "G",
        "G",
        "B",
        "C",
        new Map(),
        new Map([
          ["g1", "h1"],
          ["g2", "h2"],
        ])
      );

      const composed = composeFunctors(F, G);

      expect(composed).not.toBeNull();
      expect(composed!.morphismMapping.get("f1")).toBe("h1");
      expect(composed!.morphismMapping.get("f2")).toBe("h2");
    });

    it("should return null when target category does not match source category", () => {
      // Verifies: REQ-CAT-002
      const F = createFunctor("F", "F", "A", "B", new Map(), new Map());
      const G = createFunctor("G", "G", "C", "D", new Map(), new Map()); // B != C

      const composed = composeFunctors(F, G);

      expect(composed).toBeNull();
    });

    it("should handle functors with empty mappings", () => {
      // Verifies: REQ-CAT-002
      const F = createFunctor("F", "F", "A", "B", new Map(), new Map());
      const G = createFunctor("G", "G", "B", "C", new Map(), new Map());

      const composed = composeFunctors(F, G);

      expect(composed).not.toBeNull();
      expect(composed!.objectMapping.size).toBe(0);
      expect(composed!.morphismMapping.size).toBe(0);
    });

    it("should handle partial mappings in composition", () => {
      // Verifies: REQ-CAT-002
      // F maps a1 -> b1, but G does not map b1
      const F = createFunctor(
        "F",
        "F",
        "A",
        "B",
        new Map([["a1", "b1"]]),
        new Map()
      );
      const G = createFunctor(
        "G",
        "G",
        "B",
        "C",
        new Map([["b2", "c2"]]), // b1 not mapped
        new Map()
      );

      const composed = composeFunctors(F, G);

      expect(composed).not.toBeNull();
      // a1 -> b1 -> undefined, so a1 should not be in the composed mapping
      expect(composed!.objectMapping.has("a1")).toBe(false);
    });

    it("should handle composition of three functors", () => {
      // Verifies: REQ-CAT-002
      const F = createFunctor(
        "F",
        "F",
        "A",
        "B",
        new Map([["a", "b"]]),
        new Map()
      );
      const G = createFunctor(
        "G",
        "G",
        "B",
        "C",
        new Map([["b", "c"]]),
        new Map()
      );
      const H = createFunctor(
        "H",
        "H",
        "C",
        "D",
        new Map([["c", "d"]]),
        new Map()
      );

      const GF = composeFunctors(F, G);
      expect(GF).not.toBeNull();

      const HGF = composeFunctors(GF!, H);

      expect(HGF).not.toBeNull();
      expect(HGF!.sourceCategory).toBe("A");
      expect(HGF!.targetCategory).toBe("D");
      expect(HGF!.objectMapping.get("a")).toBe("d");
    });
  });
});
