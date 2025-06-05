#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerClickupTools } from "./tools/clickup.js";
import { SqliteStorageProvider } from "./sqliteStorageProvider.js";
import { registerActivityTools } from "./tools/activities.js";
import { registerSlackTool } from "./tools/slackTool.js";
import { registerClockifyTools } from "./tools/clockify.js";

const server = new McpServer({
    name: "clickup",
    version: "1.0.0"
});

registerClickupTools(server);
registerActivityTools(server);
registerSlackTool(server);
registerClockifyTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);

const storage = new SqliteStorageProvider();

// Ejemplo: guardar una actividad diaria
storage.addActivity({
    user: "usuario_demo",
    date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    activity: "Ejemplo de actividad realizada hoy."
});