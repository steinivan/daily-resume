import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createTasksPrompt } from "./create-tasks.js";
import { createReportPrompt } from "./create-report.js";

export function registerPrompts(server: McpServer) {
    createTasksPrompt(server);
    createReportPrompt(server);
}