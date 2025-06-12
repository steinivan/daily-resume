import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchClockify } from "../utils/fetchClockify.js";

export function registerGetTimeEntriesTool(server: McpServer) {
  server.tool(
    "get_time_entries",
    "Obtener los time entries de un usuario en un workspace",
    {
      workspaceId: z.string().describe("ID del workspace"),
      userId: z.string().describe("ID del usuario"),
      params: z.object({
        start: z.string().optional().describe("Fecha de inicio (ISO 8601)"),
        end: z.string().optional().describe("Fecha de fin (ISO 8601)")
      }).optional()
    },
    async ({ workspaceId, userId, params }) => {
      const data = await fetchClockify(`/workspaces/${workspaceId}/user/${userId}/time-entries`, params);
      if (!data || !Array.isArray(data) || data.length === 0) {
        return { content: [{ type: "text", text: "No hay time entries para este usuario." }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  ).disable();
} 