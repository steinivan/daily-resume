import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchClockify } from "../utils/fetchClockify.js";

export function registerGetUserInfoTool(server: McpServer) {
  server.tool(
    "get_user_info",
    "Obtener información del usuario autenticado en Clockify",
    {},
    async () => {
      const data = await fetchClockify("/user");
      if (!data) {
        return { content: [{ type: "text", text: "No se pudo obtener la información del usuario." }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  ).disable();
} 