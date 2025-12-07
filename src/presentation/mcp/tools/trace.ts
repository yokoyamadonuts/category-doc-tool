/**
 * Path Tracing Tools
 * Implements: REQ-MCP-006
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolContext } from "../types.js";
import { createToolResult, createErrorResult } from "../types.js";
import { loadEntities } from "./helpers.js";
import { tracePath, traceDomainPath } from "../../../application/cli/trace.js";

export function registerTraceTools(server: McpServer, context: ToolContext): void {
  // catdoc_trace
  server.tool(
    "catdoc_trace",
    "Find transformation paths between objects",
    {
      sourceId: z.string().describe("Source object ID"),
      targetId: z.string().describe("Target object ID"),
      findAll: z.boolean().optional().describe("Find all paths, not just shortest"),
      crossCategory: z.boolean().optional().describe("Allow tracing across categories via functors"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);

        if (params.crossCategory) {
          // Cross-category trace using functors
          const result = traceDomainPath(
            params.sourceId,
            params.targetId,
            entities.categories,
            entities.functors,
            entities.naturalTransformations
          );
          return createToolResult(result);
        }

        // Find which category contains the source object
        const category = entities.categories.find((c) =>
          c.objects.some((obj) => obj.id === params.sourceId)
        );

        if (!category) {
          return createErrorResult(`Object '${params.sourceId}' not found in any category`);
        }

        const result = tracePath(params.sourceId, params.targetId, category, {
          findAll: params.findAll ?? false,
        });

        return createToolResult(result);
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );
}
