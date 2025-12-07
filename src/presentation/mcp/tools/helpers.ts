/**
 * MCP Tools Helper Functions
 *
 * Common utilities for MCP tool implementations.
 */

import { YamlParser } from "../../../infrastructure/parsers/YamlParser.js";
import type { Category } from "../../../domain/entities/Category.js";
import type { Functor } from "../../../domain/entities/Functor.js";
import type { NaturalTransformation } from "../../../domain/entities/NaturalTransformation.js";
import type { ToolContext } from "../types.js";

/**
 * Loaded entities from category.yaml
 */
export type LoadedEntities = {
  categories: Category[];
  functors: Functor[];
  naturalTransformations: NaturalTransformation[];
};

/**
 * Load entities from project's category.yaml
 */
export async function loadEntities(context: ToolContext): Promise<LoadedEntities> {
  const parser = new YamlParser();
  const configPath = `${context.projectPath}/.catdoc/category.yaml`;

  try {
    const config = await parser.parse(configPath);
    return parser.toEntities(config);
  } catch (error) {
    throw new Error(`Failed to load CatDoc project: ${(error as Error).message}. Is this a CatDoc project? Run catdoc_init first.`);
  }
}

/**
 * Check if CatDoc project is initialized
 */
export async function isProjectInitialized(context: ToolContext): Promise<boolean> {
  const fs = await import("fs/promises");
  try {
    await fs.access(`${context.projectPath}/.catdoc/category.yaml`);
    return true;
  } catch {
    return false;
  }
}
