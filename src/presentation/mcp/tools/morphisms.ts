/**
 * Morphism Management Tools
 * Implements: REQ-MCP-004
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolContext } from "../types.js";
import { createToolResult, createErrorResult } from "../types.js";
import { loadEntities } from "./helpers.js";
import { listMorphisms } from "../../../application/cli/list.js";

export function registerMorphismTools(server: McpServer, context: ToolContext): void {
  // catdoc_list_morphisms
  server.tool(
    "catdoc_list_morphisms",
    "List all morphisms (relationships between objects)",
    {
      categoryId: z.string().optional().describe("Filter by category ID"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);

        let morphisms;
        if (params.categoryId) {
          const category = entities.categories.find((c) => c.id === params.categoryId);
          if (!category) {
            return createErrorResult(`Category '${params.categoryId}' not found`);
          }
          morphisms = category.morphisms;
        } else {
          morphisms = entities.categories.flatMap((c) => c.morphisms);
        }

        const result = listMorphisms([...morphisms], { format: "json" });
        return createToolResult(result);
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );

  // catdoc_show_morphism
  server.tool(
    "catdoc_show_morphism",
    "Show details of a specific morphism",
    {
      morphismId: z.string().describe("The ID of the morphism to show"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);
        const allMorphisms = entities.categories.flatMap((c) => c.morphisms);
        const morphism = allMorphisms.find((m) => m.id === params.morphismId);

        if (!morphism) {
          return createErrorResult(`Morphism '${params.morphismId}' not found`);
        }

        return createToolResult({
          found: true,
          morphism: {
            id: morphism.id,
            name: morphism.name,
            source: morphism.source,
            target: morphism.target,
          },
        });
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );
}
