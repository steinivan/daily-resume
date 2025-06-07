import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetTasksTool } from "./tools/toolGetTasks.js";
import { registerGetTaskTool } from "./tools/toolGetTask.js";
import { registerUpdateTaskTool } from "./tools/toolUpdateTask.js";
import { registerCreateTaskTool } from "./tools/toolCreateTask.js";
import { registerRegisterTimeInTaskTool } from "./tools/toolRegisterTimeInTask.js";
import { registerGetClickupUserInfoTool } from "./tools/toolGetClickupUserInfo.js";

export function registerClickupTools(server: McpServer) {
  registerGetTasksTool(server);
  registerGetTaskTool(server);
  registerUpdateTaskTool(server);
  registerCreateTaskTool(server);
  registerRegisterTimeInTaskTool(server);
  registerGetClickupUserInfoTool(server);
} 