import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { postSlackMessage } from "../utils/postSlackMessage.js";

export function registerSlackSendMessageTool(server: McpServer) {
  server.tool(
    "slackSendMessage",
    "Envía un mensaje simple a un canal de Slack por nombre",
    {
      channelName: z.string().describe("Nombre del canal de Slack"),
      text: z.string().describe("Mensaje a enviar"),
    },
    async ({ channelName, text }) => {
      try {
        const result = await postSlackMessage(channelName, text);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }]
        };
      }
    }
  );
} 