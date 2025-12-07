/**
 * Functor Tools
 * Implements: REQ-MCP-008 (1-2)
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolContext } from "../types.js";
import { createToolResult, createErrorResult } from "../types.js";
import { loadEntities } from "./helpers.js";
import { showFunctor } from "../../../application/cli/show.js";

export function registerFunctorTools(server: McpServer, context: ToolContext): void {
  // catdoc_list_functors
  server.tool(
    "catdoc_list_functors",
    "List all functors with source/target categories",
    {},
    async () => {
      try {
        const entities = await loadEntities(context);

        const functors = entities.functors.map((f) => ({
          id: f.id,
          name: f.name,
          sourceCategory: f.sourceCategory,
          targetCategory: f.targetCategory,
          objectMappingCount: f.objectMapping.size,
          morphismMappingCount: f.morphismMapping.size,
        }));

        return createToolResult({
          totalCount: functors.length,
          items: functors,
        });
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );

  // catdoc_show_functor
  server.tool(
    "catdoc_show_functor",
    "Show details of a specific functor including object and morphism mappings",
    {
      functorId: z.string().describe("The ID of the functor to show"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);
        const functor = entities.functors.find((f) => f.id === params.functorId);
        const result = showFunctor(functor ?? null);

        if (!result.found) {
          return createErrorResult(`Functor '${params.functorId}' not found`);
        }

        return createToolResult(result);
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );
}
