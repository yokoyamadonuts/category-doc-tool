/**
 * MCP Server Core
 * Implements: REQ-MCP-001
 *
 * Model Context Protocol server implementation for CatDoc.
 * Provides AI assistants access to category-theoretic document management.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { McpServerOptions, ToolContext } from "./types.js";
import { registerAllTools } from "./tools/index.js";

/**
 * Create and configure MCP server
 */
export function createMcpServer(options: McpServerOptions = {}): McpServer {
  const server = new McpServer({
    name: "catdoc",
    version: "1.0.0",
  });

  const context: ToolContext = {
    projectPath: options.projectPath ?? process.cwd(),
  };

  // Register all tools
  registerAllTools(server, context);

  return server;
}

/**
 * Start MCP server with stdio transport
 */
export async function startMcpServer(options: McpServerOptions = {}): Promise<void> {
  const server = createMcpServer(options);
  const transport = new StdioServerTransport();

  // Start dashboard if requested
  if (options.dashboard) {
    await startDashboard(options);
  }

  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP messages)
  console.error("CatDoc MCP server started");
}

/**
 * Start dashboard server alongside MCP
 */
async function startDashboard(options: McpServerOptions): Promise<void> {
  try {
    const { createDashboardServer } = await import("../../application/cli/dashboard.js");
    const { YamlParser } = await import("../../infrastructure/parsers/YamlParser.js");

    const projectPath = options.projectPath ?? process.cwd();
    const parser = new YamlParser();
    const config = await parser.parse(`${projectPath}/.catdoc/category.yaml`);
    const entities = parser.toEntities(config);

    const dashboardServer = createDashboardServer(
      {
        categories: entities.categories,
        functors: entities.functors,
        naturalTransformations: entities.naturalTransformations,
      },
      { port: options.dashboardPort ?? 3000 }
    );

    const url = await dashboardServer.start();
    console.error(`CatDoc Dashboard: ${url}`);
  } catch (error) {
    console.error(`Warning: Failed to start dashboard: ${(error as Error).message}`);
  }
}
