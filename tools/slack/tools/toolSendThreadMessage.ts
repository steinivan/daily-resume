import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { postSlackThreadMessage } from "../utils/postSlackThreadMessage.js";
import { reportTemplate } from "../template/report.js";

export function registerSlackSendThreadMessageTool(server: McpServer) {
  server.tool(
    "slackSendThreadMessage",
    "Envía un mensaje principal aclarando la daily y responde en hilo con otro mensaje en Slack con el reporte",
    {
      channelName: z.string().describe("Nombre del canal de Slack"),
      parentText: z.string().describe("Mensaje principal"),
      threadText: z.string().describe(`Mensaje en hilo. El contenido debe seguir la siguiente estructura y reglas:\n${reportTemplate}`),
    },
    async ({ channelName, parentText, threadText }) => {
      try {
        const result = await postSlackThreadMessage(channelName, parentText, threadText);
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