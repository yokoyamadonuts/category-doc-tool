/**
 * CLI Dashboard Command
 * Implements: REQ-VIS-001
 *
 * Start the web dashboard server.
 */

import { serve, type Server } from "bun";
import { createApp, type DataStore } from "../api/server";

// =============================================================================
// Types
// =============================================================================

/**
 * Dashboard server options
 */
export type DashboardOptions = {
  port?: number;
  host?: string;
};

/**
 * Dashboard server instance
 */
export type DashboardServer = {
  port: number;
  host: string;
  url: string;
  isRunning: boolean;
  start: () => Promise<string>;
  stop: () => Promise<void>;
};

// =============================================================================
// Dashboard Server Factory
// =============================================================================

/**
 * Create dashboard server
 */
export function createDashboardServer(
  data: DataStore,
  options: DashboardOptions = {}
): DashboardServer {
  const { port = 3000, host = "127.0.0.1" } = options;

  let server: Server | null = null;
  let isRunning = false;

  const app = createApp(data);

  const dashboardServer: DashboardServer = {
    port,
    host,
    get url() {
      return `http://${host}:${port}`;
    },
    get isRunning() {
      return isRunning;
    },

    async start(): Promise<string> {
      if (isRunning) {
        return dashboardServer.url;
      }

      server = serve({
        fetch: app.fetch,
        port,
        hostname: host,
      });

      isRunning = true;
      return dashboardServer.url;
    },

    async stop(): Promise<void> {
      if (server) {
        server.stop();
        server = null;
        isRunning = false;
      }
    },
  };

  return dashboardServer;
}
