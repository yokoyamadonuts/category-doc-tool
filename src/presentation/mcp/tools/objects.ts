/**
 * Object Management Tools
 * Implements: REQ-MCP-003
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolContext } from "../types.js";
import { createToolResult, createErrorResult } from "../types.js";
import { loadEntities } from "./helpers.js";
import { listObjects } from "../../../application/cli/list.js";
import { showObject } from "../../../application/cli/show.js";
import { importDocuments } from "../../../application/cli/import.js";

export function registerObjectTools(server: McpServer, context: ToolContext): void {
  // catdoc_list_objects
  server.tool(
    "catdoc_list_objects",
    "List all objects (documents) with optional domain filtering",
    {
      domain: z.string().optional().describe("Filter by domain"),
      limit: z.number().optional().describe("Limit number of results"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);
        const allObjects = entities.categories.flatMap((c) => c.objects);
        const result = listObjects(allObjects, {
          domain: params.domain,
          limit: params.limit,
          format: "json",
        });
        return createToolResult(result);
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );

  // catdoc_show_object
  server.tool(
    "catdoc_show_object",
    "Show details of a specific object including its morphisms",
    {
      objectId: z.string().describe("The ID of the object to show"),
    },
    async (params) => {
      try {
        const entities = await loadEntities(context);
        const allObjects = entities.categories.flatMap((c) => c.objects);
        const allMorphisms = entities.categories.flatMap((c) => c.morphisms);
        const obj = allObjects.find((o) => o.id === params.objectId);
        const result = showObject(obj ?? null, allMorphisms);

        if (!result.found) {
          return createErrorResult(`Object '${params.objectId}' not found`);
        }

        return createToolResult(result);
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );

  // catdoc_import_document
  server.tool(
    "catdoc_import_document",
    "Import a Markdown document as an object",
    {
      filePath: z.string().describe("Path to the Markdown file to import"),
      domain: z.string().optional().describe("Domain for the imported document"),
      force: z.boolean().optional().describe("Overwrite existing object"),
    },
    async (params) => {
      try {
        // Resolve path relative to project
        const fullPath = params.filePath.startsWith("/")
          ? params.filePath
          : `${context.projectPath}/${params.filePath}`;

        const result = await importDocuments([fullPath], {
          defaultDomain: params.domain ?? "general",
          force: params.force ?? false,
        });

        return createToolResult(result);
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );
}
