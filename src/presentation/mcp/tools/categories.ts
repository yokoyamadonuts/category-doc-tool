/**
 * Category Management Tools
 * Implements: REQ-MCP-002
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolContext } from "../types.js";
import { createToolResult, createErrorResult } from "../types.js";
import { loadEntities } from "./helpers.js";
import { listCategories } from "../../../application/cli/list.js";
import { showCategory } from "../../../application/cli/show.js";

export function registerCategoryTools(server: McpServer, context: ToolContext): void {
  // catdoc_list_categories
  server.tool(
    "catdoc_list_categories",
    "List all categories with their objects and morphisms count",
    {
      format: z.enum(["json", "summary"]).optional().describe("Output format"),
    },
    async (_params) => {
      try {
        const entities = await loadEntities(context);
        const result = listCategories(entities.categories, { format: "json" });
        return createToolResult(result);
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );

  // catdoc_show_category
  server.tool(
    "catdoc_show_category",
    "Show details of a specific category including its objects and morphisms",
    {
      categoryId: z.string().describe("The ID of the category to show"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);
        const category = entities.categories.find((c) => c.id === params.categoryId);
        const result = showCategory(category ?? null);

        if (!result.found) {
          return createErrorResult(`Category '${params.categoryId}' not found`);
        }

        return createToolResult(result);
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );
}
