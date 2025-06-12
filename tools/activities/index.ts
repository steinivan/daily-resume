import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAddActivityTool } from "./tools/toolAddActivity.js";
import { registerGetActivitiesByProjectAndPeriodTool } from "./tools/toolGetActivitiesByProjectAndPeriod.js";

export default function registerActivityTools(server: McpServer) {
  registerAddActivityTool(server);
  registerGetActivitiesByProjectAndPeriodTool(server);
} 