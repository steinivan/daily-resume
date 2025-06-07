import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClickupHeaders } from "../utils/fetchClickup.js";

const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

export function registerCreateTaskTool(server: McpServer) {
  server.tool(
    "create_task",
    "crear una tarea en una lista de clickup",
    {
      listId: z.string().describe("ID de la lista donde se creará la tarea"),
      params: z.object({
        name: z.string().describe("Nombre de la tarea"),
        description: z.string().optional().describe("Descripción de la tarea"),
        assignees: z.array(z.string()).optional().describe("IDs de usuarios asignados"),
        tags: z.array(z.string()).optional().describe("Etiquetas"),
        status: z.string().optional().describe("Estado inicial de la tarea"),
        priority: z.number().int().min(1).max(4).optional().describe("Prioridad (1-4)"),
        due_date: z.number().optional().describe("Fecha de vencimiento (timestamp en ms)"),
        start_date: z.number().optional().describe("Fecha de inicio (timestamp en ms)"),
        time_estimate: z.number().optional().describe("Estimación de tiempo en ms"),
        custom_fields: z.array(z.object({
          id: z.string(),
          value: z.any()
        })).optional().describe("Campos personalizados"),
        parent: z.string().optional().describe("ID de la tarea padre (para subtareas)"),
        notify_all: z.boolean().optional().describe("Notificar a todos los usuarios asignados"),
        check_required_custom_fields: z.boolean().optional().describe("Validar campos personalizados requeridos")
      })
    },
    async ({ listId, params }) => {
      const url = `${CLICKUP_API_BASE}/list/${listId}/task`;
      try {
        const response = await fetch(url, {
          method: "POST",
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
                text: `Error al crear la tarea: ${response.status} - ${errorText}`
              }
            ]
          };
        }
        const data = await response.json();
        return {
          content: [
            {
              type: "text",
              text: `Tarea creada correctamente: ${JSON.stringify(data)}`
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