import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchClockify } from "../utils/fetchClockify.js";

export function registerGetProjectsTool(server: McpServer) {
  server.tool(
    "get_projects",
    "Obtener los proyectos de un workspace en Clockify",
    {
      workspaceId: z.string().describe("ID del workspace")
    },
    async ({ workspaceId }) => {
      const data = await fetchClockify(`/workspaces/${workspaceId}/projects`);
      if (!data || !Array.isArray(data) || data.length === 0) {
        return { content: [{ type: "text", text: "No hay proyectos en este workspace." }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
} 