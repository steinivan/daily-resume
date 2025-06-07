import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClockifyHeaders } from "../utils/fetchClockify.js";

const CLOCKIFY_API_BASE = "https://api.clockify.me/api/v1";

export function registerCreateTimeEntryTool(server: McpServer) {
  server.tool(
    "create_time_entry",
    "Crear un time entry en Clockify",
    {
      workspaceId: z.string().describe("ID del workspace"),
      body: z.object({
        start: z.string().describe("Fecha y hora de inicio (ISO 8601)"),
        end: z.string().optional().describe("Fecha y hora de fin (ISO 8601)"),
        description: z.string().optional().describe("Descripción"),
        projectId: z.string().optional().describe("ID del proyecto"),
        taskId: z.string().optional().describe("ID de la tarea"),
        tagIds: z.array(z.string()).optional().describe("IDs de etiquetas"),
        billable: z.boolean().optional().describe("Es facturable")
      })
    },
    async ({ workspaceId, body }) => {
      const url = `${CLOCKIFY_API_BASE}/workspaces/${workspaceId}/time-entries`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: getClockifyHeaders(),
          body: JSON.stringify(body)
        });
        if (!response.ok) {
          const errorText = await response.text();
          return { content: [{ type: "text", text: `Error al crear el time entry: ${response.status} - ${errorText}` }] };
        }
        const data = await response.json();
        return { content: [{ type: "text", text: `Time entry creado: ${JSON.stringify(data)}` }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error de red o inesperado: ${error}` }] };
      }
    }
  );
} 