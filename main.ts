#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import registerTools from "./tools/index.js";
import { registerPrompts } from "./prompts/index.js";

const server = new McpServer({
    name: "task-manager",
    version: "1.1.3"
});

registerTools(server);
registerPrompts(server);

const transport = new StdioServerTransport();
await server.connect(transport);