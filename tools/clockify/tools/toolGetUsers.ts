import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchClockify } from "../utils/fetchClockify.js";

export function registerGetUsersTool(server: McpServer) {
  server.tool(
    "get_users",
    "Obtener los usuarios de un workspace en Clockify",
    {
      workspaceId: z.string().describe("ID del workspace")
    },
    async ({ workspaceId }) => {
      const data = await fetchClockify(`/workspaces/${workspaceId}/users`);
      if (!data || !Array.isArray(data) || data.length === 0) {
        return { content: [{ type: "text", text: "No hay usuarios en este workspace." }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
} 