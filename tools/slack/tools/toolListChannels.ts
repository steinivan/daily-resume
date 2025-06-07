import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchSlackChannels } from "../utils/fetchSlackChannels.js";

export function registerSlackListChannelsTool(server: McpServer) {
  server.tool(
    "slackListChannels",
    "Lista los canales de Slack a los que el usuario tiene acceso",
    {},
    async () => {
      try {
        const channels = await fetchSlackChannels();
        return {
          content: [{ type: "text", text: JSON.stringify(channels, null, 2) }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }]
        };
      }
    }
  );
} 