import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchClockify } from "../utils/fetchClockify.js";

export function registerGetWorkspacesTool(server: McpServer) {
  server.tool(
    "get_workspaces",
    "Obtener los workspaces del usuario en Clockify",
    {},
    async () => {
      const data = await fetchClockify("/workspaces");
      if (!data || !Array.isArray(data) || data.length === 0) {
        return { content: [{ type: "text", text: "No hay workspaces disponibles." }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
} 