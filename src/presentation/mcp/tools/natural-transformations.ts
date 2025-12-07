/**
 * Natural Transformation Tools
 * Implements: REQ-MCP-008 (3-4)
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolContext } from "../types.js";
import { createToolResult, createErrorResult } from "../types.js";
import { loadEntities } from "./helpers.js";

export function registerNaturalTransformationTools(server: McpServer, context: ToolContext): void {
  // catdoc_list_natural_transformations
  server.tool(
    "catdoc_list_natural_transformations",
    "List all natural transformations",
    {},
    async () => {
      try {
        const entities = await loadEntities(context);

        const natTrans = entities.naturalTransformations.map((n) => ({
          id: n.id,
          name: n.name,
          sourceFunctor: n.sourceFunctor,
          targetFunctor: n.targetFunctor,
          componentCount: n.components.size,
        }));

        return createToolResult({
          totalCount: natTrans.length,
          items: natTrans,
        });
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );

  // catdoc_show_natural_transformation
  server.tool(
    "catdoc_show_natural_transformation",
    "Show details of a specific natural transformation including components",
    {
      id: z.string().describe("The ID of the natural transformation to show"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);
        const natTrans = entities.naturalTransformations.find((n) => n.id === params.id);

        if (!natTrans) {
          return createErrorResult(`Natural transformation '${params.id}' not found`);
        }

        // Convert components Map to array for JSON serialization
        const components = Array.from(natTrans.components.entries()).map(([objectId, morphismId]) => ({
          objectId,
          morphismId,
        }));

        return createToolResult({
          found: true,
          naturalTransformation: {
            id: natTrans.id,
            name: natTrans.name,
            sourceFunctor: natTrans.sourceFunctor,
            targetFunctor: natTrans.targetFunctor,
          },
          components,
        });
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );
}
