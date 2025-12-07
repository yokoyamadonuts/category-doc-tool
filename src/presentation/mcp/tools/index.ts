/**
 * MCP Tools Registration
 * Implements: REQ-MCP-001
 *
 * Central registration point for all MCP tools.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolContext } from "../types.js";

// Import tool modules
import { registerCategoryTools } from "./categories.js";
import { registerObjectTools } from "./objects.js";
import { registerMorphismTools } from "./morphisms.js";
import { registerValidateTools } from "./validate.js";
import { registerTraceTools } from "./trace.js";
import { registerSearchTools } from "./search.js";
import { registerFunctorTools } from "./functors.js";
import { registerNaturalTransformationTools } from "./natural-transformations.js";
import { registerInitTools } from "./init.js";
import { registerGraphTools } from "./graph.js";

/**
 * Register all MCP tools with the server
 */
export function registerAllTools(server: McpServer, context: ToolContext): void {
  registerCategoryTools(server, context);
  registerObjectTools(server, context);
  registerMorphismTools(server, context);
  registerValidateTools(server, context);
  registerTraceTools(server, context);
  registerSearchTools(server, context);
  registerFunctorTools(server, context);
  registerNaturalTransformationTools(server, context);
  registerInitTools(server, context);
  registerGraphTools(server, context);
}
