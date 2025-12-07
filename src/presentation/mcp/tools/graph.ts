/**
 * Graph Data Tools
 * Implements: REQ-MCP-012
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolContext } from "../types.js";
import { createToolResult, createErrorResult } from "../types.js";
import { loadEntities } from "./helpers.js";

export function registerGraphTools(server: McpServer, context: ToolContext): void {
  // catdoc_get_graph
  server.tool(
    "catdoc_get_graph",
    "Get graph data for visualization (nodes and edges)",
    {
      categoryId: z.string().optional().describe("Filter by category ID"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);

        let categories = entities.categories;
        if (params.categoryId) {
          const category = entities.categories.find((c) => c.id === params.categoryId);
          if (!category) {
            return createErrorResult(`Category '${params.categoryId}' not found`);
          }
          categories = [category];
        }

        // Build nodes from objects
        const nodes = categories.flatMap((category) =>
          category.objects.map((obj) => ({
            id: obj.id,
            label: obj.title,
            type: "object",
            category: category.id,
            metadata: {
              domain: obj.domain,
              ...obj.metadata,
            },
          }))
        );

        // Build edges from morphisms
        const edges = categories.flatMap((category) =>
          category.morphisms.map((m) => ({
            id: m.id,
            source: m.source,
            target: m.target,
            label: m.name,
            category: category.id,
          }))
        );

        // Add functor mappings as special edges if showing all
        const functorEdges = !params.categoryId
          ? entities.functors.flatMap((f) =>
              Array.from(f.objectMapping.entries()).map(([source, target], index) => ({
                id: `${f.id}-obj-${index}`,
                source,
                target,
                label: `${f.name} (functor)`,
                type: "functor",
              }))
            )
          : [];

        return createToolResult({
          nodes,
          edges: [...edges, ...functorEdges],
          statistics: {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            functorEdgeCount: functorEdges.length,
            categoryCount: categories.length,
          },
        });
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );
}
