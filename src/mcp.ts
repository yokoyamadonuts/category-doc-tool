#!/usr/bin/env bun
/**
 * CatDoc MCP Server Entry Point
 * Implements: REQ-MCP-010
 *
 * Entry point for running CatDoc as an MCP server via npx.
 */

import { startMcpServer } from "./presentation/mcp/server.js";

// Get configuration from environment variables
const options = {
  projectPath: process.env.CATDOC_PROJECT_PATH ?? process.cwd(),
  dashboard: process.env.CATDOC_DASHBOARD === "true",
  dashboardPort: process.env.CATDOC_DASHBOARD_PORT
    ? parseInt(process.env.CATDOC_DASHBOARD_PORT, 10)
    : undefined,
};

// Start MCP server
startMcpServer(options).catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
