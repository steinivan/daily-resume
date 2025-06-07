import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetWorkspacesTool } from "./tools/toolGetWorkspaces.js";
import { registerGetProjectsTool } from "./tools/toolGetProjects.js";
import { registerGetUsersTool } from "./tools/toolGetUsers.js";
import { registerGetTimeEntriesTool } from "./tools/toolGetTimeEntries.js";
import { registerCreateTimeEntryTool } from "./tools/toolCreateTimeEntry.js";
import { registerGetUserInfoTool } from "./tools/toolGetUserInfo.js";
import { registerGetTotalHoursTool } from "./tools/toolGetTotalHours.js";

export function registerClockifyTools(server: McpServer) {
  registerGetWorkspacesTool(server);
  registerGetProjectsTool(server);
  registerGetUsersTool(server);
  registerGetTimeEntriesTool(server);
  registerCreateTimeEntryTool(server);
  registerGetUserInfoTool(server);
  registerGetTotalHoursTool(server);
} 