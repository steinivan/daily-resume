import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClickupHeaders } from "../utils/fetchClickup.js";

const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

export function registerUpdateTaskTool(server: McpServer) {
  server.tool(
    "update_task",
    "actualizar una tarea especifica de clickup usando el id de la tarea",
    {
      taskId: z.string().describe("id de la tarea"),
      params: z.object({
        name: z.string().optional().describe("Nuevo nombre de la tarea"),
        description: z.string().optional().describe("Descripción de la tarea"),
        status: z.string().optional().describe("Estado de la tarea"),
        priority: z.number().int().min(1).max(4).optional().describe("Prioridad (1-4)"),
        due_date: z.number().optional().describe("Fecha de vencimiento (timestamp en ms)"),
        start_date: z.number().optional().describe("Fecha de inicio (timestamp en ms)"),
        tags: z.array(z.string()).optional().describe("Etiquetas"),
        custom_fields: z.array(z.object({
          id: z.string(),
          value: z.any()
        })).optional().describe("Campos personalizados"),
        time_estimate: z.number().optional().describe("Estimación de tiempo en ms"),
        time_spent: z.string().optional().describe("Tiempo en string, ejemplo: 1h 30m"),
        archived: z.boolean().optional().describe("Archivar tarea"),
        assignees: z.object({
          add: z.array(z.number().optional().describe("ID del usuario asignado. Ejemplo: [1, 2, 3]. Debe ser un entero y no un string.")),
          rem: z.array(z.number().optional().describe("ID del usuario desasignado. Ejemplo: [1, 2, 3]. Debe ser un entero y no un string.")),
        }).optional().describe("IDs de usuarios asignados o desasignados"),
      })
    },
    async ({ taskId, params }) => {
      const url = `${CLICKUP_API_BASE}/task/${taskId}`;
      try {
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            ...getClickupHeaders(),
            "Content-Type": "application/json"
          },
          body: JSON.stringify(params)
        });
        if (!response.ok) {
          const errorText = await response.text();
          return {
            content: [
              {
                type: "text",
                text: `Error al actualizar la tarea: ${response.status} - ${errorText}`
              }
            ]
          };
        }
        const data = await response.json();
        return {
          content: [
            {
              type: "text",
              text: `Tarea actualizada correctamente: ${JSON.stringify(data)}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error de red o inesperado: ${error}`
            }
          ]
        };
      }
    }
  );
} 