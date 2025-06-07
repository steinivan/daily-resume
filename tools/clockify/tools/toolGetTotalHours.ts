import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchClockify } from "../utils/fetchClockify.js";

export function registerGetTotalHoursTool(server: McpServer) {
  server.tool(
    "get_total_hours",
    "Obtener el total de horas de un proyecto, una tarea, o de todo el mes y todos los proyectos en Clockify.",
    {
      workspaceId: z.string().describe("ID del workspace"),
      userId: z.string().optional().describe("ID del usuario (opcional, por defecto el autenticado)"),
      projectId: z.string().optional().describe("ID del proyecto (opcional)"),
      taskId: z.string().optional().describe("ID de la tarea (opcional)"),
      start: z.string().optional().describe("Fecha de inicio (ISO 8601, opcional)"),
      end: z.string().optional().describe("Fecha de fin (ISO 8601, opcional)")
    },
    async ({ workspaceId, userId, projectId, taskId, start, end }) => {
      // Obtener el userId si no se pasa
      let uid = userId;
      if (!uid) {
        const userInfo = await fetchClockify("/user");
        if (!userInfo || !userInfo.id) {
          return { content: [{ type: "text", text: "No se pudo obtener el usuario autenticado." }] };
        }
        uid = userInfo.id;
      }
      // Paginación manual
      let page = 1;
      let totalSeconds = 0;
      let entries: any[] = [];
      const pageSize = 100;
      let keepGoing = true;
      while (keepGoing) {
        const params: any = { page, pageSize };
        if (start) params.start = start;
        if (end) params.end = end;
        const data = await fetchClockify(`/workspaces/${workspaceId}/user/${uid}/time-entries`, params);
        if (!data || !Array.isArray(data) || data.length === 0) break;
        // Filtrar por projectId y taskId si aplica
        const filtered = data.filter((entry: any) => {
          if (projectId && entry.projectId !== projectId) return false;
          if (taskId && entry.taskId !== taskId) return false;
          return true;
        });
        entries.push(...filtered);
        // Sumar duración (en segundos)
        for (const entry of filtered) {
          if (typeof entry.timeInterval === 'object' && typeof entry.timeInterval.duration === 'string') {
            // ISO 8601 duration, ej: 'PT1H30M10S'
            const match = entry.timeInterval.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (match) {
              const h = parseInt(match[1] || '0', 10);
              const m = parseInt(match[2] || '0', 10);
              const s = parseInt(match[3] || '0', 10);
              totalSeconds += h * 3600 + m * 60 + s;
            }
          }
        }
        keepGoing = data.length === pageSize;
        page++;
      }
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return {
        content: [{
          type: "text",
          text: `Total: ${hours}h ${minutes}m (${totalSeconds} segundos)\nEntradas contadas: ${entries.length}\nFiltros aplicados: ${JSON.stringify({ workspaceId, userId: uid, projectId, taskId, start, end })}`
        }]
      };
    }
  );
} 