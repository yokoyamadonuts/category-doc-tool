/**
 * MCP Type Definitions
 * Implements: REQ-MCP-001
 *
 * Type definitions for MCP server implementation.
 */

import type { z } from "zod";

/**
 * MCP Server configuration options
 */
export type McpServerOptions = {
  /** Project root path (default: cwd) */
  projectPath?: string;
  /** Start dashboard server alongside MCP */
  dashboard?: boolean;
  /** Dashboard server port */
  dashboardPort?: number;
};

/**
 * Tool definition for MCP registration
 */
export type ToolDefinition<TInput = unknown, TOutput = unknown> = {
  /** Tool name (catdoc_ prefix) */
  name: string;
  /** Tool description for AI assistants */
  description: string;
  /** Zod schema for input validation */
  inputSchema: z.ZodType<TInput>;
  /** Tool handler function */
  handler: (params: TInput) => Promise<TOutput>;
};

/**
 * MCP tool result content
 */
export type ToolResultContent = {
  type: "text";
  text: string;
};

/**
 * MCP tool result
 */
export type ToolResult = {
  content: ToolResultContent[];
  isError?: boolean;
};

/**
 * Create a successful tool result
 */
export function createToolResult(data: unknown): ToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Create an error tool result
 */
export function createErrorResult(message: string): ToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ error: message }),
      },
    ],
    isError: true,
  };
}

/**
 * Context for tool execution
 */
export type ToolContext = {
  /** Project root path */
  projectPath: string;
};
