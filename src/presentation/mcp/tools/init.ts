/**
 * Initialization Tools
 * Implements: REQ-MCP-011
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolContext } from "../types.js";
import { createToolResult, createErrorResult } from "../types.js";
import { initProject } from "../../../application/cli/init.js";

export function registerInitTools(server: McpServer, context: ToolContext): void {
  // catdoc_init
  server.tool(
    "catdoc_init",
    "Initialize a new CatDoc project",
    {
      directory: z.string().optional().describe("Directory to initialize (default: current)"),
      projectName: z.string().optional().describe("Project name"),
      force: z.boolean().optional().describe("Overwrite existing .catdoc directory"),
    },
    async (params) => {
      try {
        const projectPath = params.directory
          ? (params.directory.startsWith("/")
              ? params.directory
              : `${context.projectPath}/${params.directory}`)
          : context.projectPath;

        const result = await initProject({
          projectPath,
          projectName: params.projectName,
          force: params.force ?? false,
        });

        if (!result.success) {
          return createErrorResult(result.error ?? "Failed to initialize project");
        }

        return createToolResult({
          success: true,
          projectPath,
          messages: result.messages,
        });
      } catch (error) {
        return createErrorResult((error as Error).message);
      }
    }
  );
}
