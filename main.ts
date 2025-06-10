#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {  } from "./tools/activities/index.js";
import registerTools from "./tools/index.js";
import { registerTodayActivitiesResource } from "./resource/todayActivitiesResource.js";
import { ClickupTaskRulesResource } from "./resource/clickupTaskRules.js";
import { registerPrompts } from "./prompts/index.js";

const server = new McpServer({
    name: "clickup",
    version: "1.0.0"
});

registerTools(server);

registerTodayActivitiesResource(server);
ClickupTaskRulesResource(server);
registerPrompts(server);
const transport = new StdioServerTransport();
await server.connect(transport);