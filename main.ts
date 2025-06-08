#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerActivityTools } from "./tools/activities/index.js";
import { registerSlackTools } from "./tools/slack/index.js";
import { registerClockifyTools } from "./tools/clockify/index.js";
import { registerCronTools } from "./tools/cron/index.js";
import { registerTodayActivitiesResource } from "./resource/todayActivitiesResource.js";
import { ClickupTaskRulesResource } from "./resource/clickupTaskRules.js";
import { registerClickupTools } from "./tools/clickup/index.js";
import { registerPrompts } from "./prompts/index.js";

const server = new McpServer({
    name: "clickup",
    version: "1.0.0"
});

registerSlackTools(server);
registerClickupTools(server);
registerActivityTools(server);
registerClockifyTools(server);
registerCronTools(server);
registerTodayActivitiesResource(server);
ClickupTaskRulesResource(server);
registerPrompts(server);
const transport = new StdioServerTransport();
await server.connect(transport);