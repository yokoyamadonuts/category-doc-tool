/**
 * Search Tools
 * Implements: REQ-MCP-007
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolContext } from "../types.js";
import { createToolResult, createErrorResult } from "../types.js";
import { loadEntities } from "./helpers.js";
import { searchObjects } from "../../../application/cli/search.js";

export function registerSearchTools(server: McpServer, context: ToolContext): void {
  // catdoc_search
  server.tool(
    "catdoc_search",
    "Search objects by keyword in title and content",
    {
      query: z.string().describe("Search query"),
      domain: z.string().optional().describe("Filter by domain"),
      limit: z.number().optional().describe("Limit number of results"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);
        const allObjects = entities.categories.flatMap((c) => c.objects);

        const result = searchObjects(allObjects, {
          query: params.query,
          domain: params.domain,
          limit: params.limit ?? 20,
        });

        return createToolResult(result);
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );
}
