import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import createTasksPrompt from "./create-tasks.js";

export function registerPrompts(server: McpServer) {
    createTasksPrompt(server);
}