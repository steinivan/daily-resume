import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTaskQueryTool } from "./tools/toolTaskQuery.js";
import { registerTaskManagerTool } from "./tools/toolTaskCreateOrUpdate.js";
import { registerRegisterTimeInTaskTool } from "./tools/toolRegisterTimeInTask.js";
import { registerGetClickupUserInfoTool } from "./tools/toolGetClickupUserInfo.js";

export function registerClickupTools(server: McpServer) {
  registerTaskQueryTool(server);
  registerTaskManagerTool(server);
  registerRegisterTimeInTaskTool(server);
  registerGetClickupUserInfoTool(server);
} 