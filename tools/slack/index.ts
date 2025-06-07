import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSlackListChannelsTool } from "./tools/toolListChannels.js";
import { registerSlackSendMessageTool } from "./tools/toolSendMessage.js";
import { registerSlackSendThreadMessageTool } from "./tools/toolSendThreadMessage.js";

export function registerSlackTools(server: McpServer) {
  registerSlackListChannelsTool(server);
  registerSlackSendMessageTool(server);
  registerSlackSendThreadMessageTool(server);
} 