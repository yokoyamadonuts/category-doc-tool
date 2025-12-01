/**
 * YAML Parser for category.yaml
 * Implements: REQ-CAT-001, REQ-CAT-003, REQ-CAT-004
 *
 * Parses and validates category configuration files.
 * Converts parsed data to domain entities.
 */

import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { readFileSync } from "fs";

import { createCategory, type Category } from "../../domain/entities/Category";
import { createCategoryObject } from "../../domain/entities/Object";
import { createMorphism } from "../../domain/entities/Morphism";
import { createFunctor, type Functor } from "../../domain/entities/Functor";
import {
  createNaturalTransformation,
  type NaturalTransformation,
} from "../../domain/entities/NaturalTransformation";

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Object configuration in YAML
 */
export type ObjectConfig = {
  id: string;
  title: string;
  domain: string;
  metadata?: Record<string, unknown>;
  content?: string;
};

/**
 * Morphism configuration in YAML
 */
export type MorphismConfig = {
  id: string;
  name: string;
  source: string;
  target: string;
  metadata?: Record<string, unknown>;
};

/**
 * Category configuration in YAML
 */
export type CategoryConfigItem = {
  id: string;
  name: string;
  objects: ObjectConfig[];
  morphisms: MorphismConfig[];
};

/**
 * Functor configuration in YAML
 */
export type FunctorConfig = {
  id: string;
  name: string;
  sourceCategory: string;
  targetCategory: string;
  objectMapping: Record<string, string>;
  morphismMapping: Record<string, string>;
};

/**
 * Natural transformation configuration in YAML
 */
export type NaturalTransformationConfig = {
  id: string;
  name: string;
  sourceFunctor: string;
  targetFunctor: string;
  components: Record<string, string>;
};

/**
 * Complete category configuration
 */
export type CategoryConfig = {
  categories: CategoryConfigItem[];
  functors: FunctorConfig[];
  naturalTransformations: NaturalTransformationConfig[];
};

/**
 * Validation result
 */
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * Converted domain entities
 */
export type ConvertedEntities = {
  categories: Category[];
  functors: Functor[];
  naturalTransformations: NaturalTransformation[];
};

// =============================================================================
// Zod Schemas for Validation
// =============================================================================

const objectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  domain: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
  content: z.string().optional(),
});

const morphismSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  objects: z.array(objectSchema).default([]),
  morphisms: z.array(morphismSchema).default([]),
});

const functorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sourceCategory: z.string().min(1),
  targetCategory: z.string().min(1),
  objectMapping: z.record(z.string(), z.string()).default({}),
  morphismMapping: z.record(z.string(), z.string()).default({}),
});

const naturalTransformationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sourceFunctor: z.string().min(1),
  targetFunctor: z.string().min(1),
  components: z.record(z.string(), z.string()).default({}),
});

const configSchema = z.object({
  categories: z.array(categorySchema).default([]),
  functors: z.array(functorSchema).default([]),
  naturalTransformations: z.array(naturalTransformationSchema).default([]),
});

// =============================================================================
// YAML Parser
// =============================================================================

/**
 * YAML Parser for category configuration
 */
export class YamlParser {
  /**
   * Parse YAML file from path
   */
  async parse(filePath: string): Promise<CategoryConfig> {
    const content = readFileSync(filePath, "utf-8");
    return this.parseContent(content);
  }

  /**
   * Parse YAML content string
   */
  parseContent(content: string): CategoryConfig {
    const raw = parseYaml(content);

    // Handle null/undefined sections
    const normalized = {
      categories: (raw?.categories ?? []).map((cat: Record<string, unknown>) => ({
        ...cat,
        objects: (cat?.objects as unknown[]) ?? [],
        morphisms: (cat?.morphisms as unknown[]) ?? [],
      })),
      functors: raw?.functors ?? [],
      naturalTransformations: raw?.naturalTransformations ?? [],
    };

    // Parse and validate with Zod
    const parsed = configSchema.parse(normalized);

    return parsed;
  }

  /**
   * Validate configuration
   */
  validate(config: CategoryConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Collect all IDs for reference checking
    const categoryIds = new Set<string>();
    const objectIds = new Set<string>();
    const morphismIds = new Set<string>();
    const functorIds = new Set<string>();

    // Validate categories
    for (const cat of config.categories) {
      if (!cat.id || cat.id.trim() === "") {
        errors.push(`Category has empty id`);
      } else {
        categoryIds.add(cat.id);
      }

      if (!cat.name || cat.name.trim() === "") {
        errors.push(`Category '${cat.id}' has empty name`);
      }

      if (cat.objects.length === 0 && cat.morphisms.length === 0) {
        warnings.push(`Category '${cat.id}' is empty`);
      }

      // Collect object IDs
      for (const obj of cat.objects) {
        objectIds.add(obj.id);
      }

      // Collect morphism IDs
      for (const morph of cat.morphisms) {
        morphismIds.add(morph.id);
      }

      // Validate morphism references
      for (const morph of cat.morphisms) {
        if (!objectIds.has(morph.source)) {
          errors.push(
            `Morphism '${morph.id}' has invalid source '${morph.source}'`
          );
        }
        if (!objectIds.has(morph.target)) {
          errors.push(
            `Morphism '${morph.id}' has invalid target '${morph.target}'`
          );
        }
      }
    }

    // Validate functors
    for (const func of config.functors) {
      functorIds.add(func.id);

      if (!categoryIds.has(func.sourceCategory)) {
        errors.push(
          `Functor '${func.id}' has invalid sourceCategory '${func.sourceCategory}'`
        );
      }
      if (!categoryIds.has(func.targetCategory)) {
        errors.push(
          `Functor '${func.id}' has invalid targetCategory '${func.targetCategory}'`
        );
      }
    }

    // Validate natural transformations
    for (const natTrans of config.naturalTransformations) {
      if (!functorIds.has(natTrans.sourceFunctor)) {
        errors.push(
          `NaturalTransformation '${natTrans.id}' has invalid sourceFunctor '${natTrans.sourceFunctor}'`
        );
      }
      if (!functorIds.has(natTrans.targetFunctor)) {
        errors.push(
          `NaturalTransformation '${natTrans.id}' has invalid targetFunctor '${natTrans.targetFunctor}'`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Convert configuration to domain entities
   */
  toEntities(config: CategoryConfig): ConvertedEntities {
    // Convert categories (with their objects and morphisms)
    const categories = config.categories.map((cat) => {
      const objects = cat.objects.map((obj) =>
        createCategoryObject(
          obj.id,
          obj.title,
          obj.domain,
          obj.metadata ?? {},
          obj.content
        )
      );

      const morphisms = cat.morphisms.map((morph) =>
        createMorphism(
          morph.id,
          morph.name,
          morph.source,
          morph.target,
          morph.metadata ?? {}
        )
      );

      return createCategory(cat.id, cat.name, objects, morphisms);
    });

    // Convert functors
    const functors = config.functors.map((func) =>
      createFunctor(
        func.id,
        func.name,
        func.sourceCategory,
        func.targetCategory,
        new Map(Object.entries(func.objectMapping)),
        new Map(Object.entries(func.morphismMapping))
      )
    );

    // Convert natural transformations
    const naturalTransformations = config.naturalTransformations.map(
      (natTrans) =>
        createNaturalTransformation(
          natTrans.id,
          natTrans.name,
          natTrans.sourceFunctor,
          natTrans.targetFunctor,
          new Map(Object.entries(natTrans.components))
        )
    );

    return {
      categories,
      functors,
      naturalTransformations,
    };
  }
}
