/**
 * Validation Tools
 * Implements: REQ-MCP-005
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolContext } from "../types.js";
import { createToolResult, createErrorResult } from "../types.js";
import { loadEntities } from "./helpers.js";
import {
  validateAll,
  validateCategories,
  validateFunctors,
  validateNaturalTransformations,
} from "../../../application/cli/validate.js";

export function registerValidateTools(server: McpServer, context: ToolContext): void {
  // catdoc_validate - Full validation
  server.tool(
    "catdoc_validate",
    "Validate all category structures, functors, and natural transformations",
    {
      categoryId: z.string().optional().describe("Validate only a specific category"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);

        if (params.categoryId) {
          // Validate specific category
          const category = entities.categories.find((c) => c.id === params.categoryId);
          if (!category) {
            return createErrorResult(`Category '${params.categoryId}' not found`);
          }
          const result = validateCategories([category]);
          return createToolResult(result);
        }

        // Validate all
        const result = validateAll({
          categories: entities.categories,
          functors: entities.functors,
          naturalTransformations: entities.naturalTransformations,
        });

        return createToolResult(result);
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );

  // catdoc_validate_category - Category axioms validation
  server.tool(
    "catdoc_validate_category",
    "Validate category axioms: identity morphisms, reference integrity, composition closure",
    {
      categoryId: z.string().describe("The ID of the category to validate"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);
        const category = entities.categories.find((c) => c.id === params.categoryId);

        if (!category) {
          return createErrorResult(`Category '${params.categoryId}' not found`);
        }

        const result = validateCategories([category]);
        return createToolResult({
          categoryId: params.categoryId,
          ...result,
          validations: {
            identityMorphisms: "Checks that each object has an identity morphism",
            referenceIntegrity: "Checks that morphism sources/targets exist",
            compositionClosure: "Warns if composable morphisms lack composition",
          },
        });
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );

  // catdoc_validate_functor - Functor axioms validation
  server.tool(
    "catdoc_validate_functor",
    "Validate functor axioms: category existence, object mapping, identity preservation",
    {
      functorId: z.string().describe("The ID of the functor to validate"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);
        const functor = entities.functors.find((f) => f.id === params.functorId);

        if (!functor) {
          return createErrorResult(`Functor '${params.functorId}' not found`);
        }

        const result = validateFunctors([functor], entities.categories);
        return createToolResult({
          functorId: params.functorId,
          ...result,
          validations: {
            categoryExistence: "Checks source/target categories exist",
            objectMappingCompleteness: "Checks all source objects are mapped",
            identityPreservation: "Checks F(id_A) = id_{F(A)}",
          },
        });
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );

  // catdoc_validate_natural_transformation - Natural transformation validation
  server.tool(
    "catdoc_validate_natural_transformation",
    "Validate natural transformation: functor existence, component completeness, type correctness",
    {
      id: z.string().describe("The ID of the natural transformation to validate"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);
        const natTrans = entities.naturalTransformations.find((n) => n.id === params.id);

        if (!natTrans) {
          return createErrorResult(`Natural transformation '${params.id}' not found`);
        }

        const result = validateNaturalTransformations(
          [natTrans],
          entities.functors,
          entities.categories
        );
        return createToolResult({
          naturalTransformationId: params.id,
          ...result,
          validations: {
            functorExistence: "Checks source/target functors exist",
            componentCompleteness: "Checks all objects have components",
            typeCorrectness: "Checks η_A: F(A) → G(A) types",
          },
        });
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );
}
