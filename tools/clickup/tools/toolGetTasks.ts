import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchClickup } from "../utils/fetchClickup.js";

export function registerGetTasksTool(server: McpServer) {
  server.tool(
    "get_tasks",
    "obtener las tareas de una lista de clickup",
    {
      listId: z.string().describe("id de la lista"),
      params: z.object({
        archived: z.boolean().optional().describe("Incluir tareas archivadas"),
        page: z.number().optional().describe("Número de página para paginación"),
        order_by: z.string().optional().describe("Campo por el que ordenar (id, created, updated, etc.)"),
        reverse: z.boolean().optional().describe("Orden descendente si es true"),
        subtasks: z.boolean().optional().describe("Incluir subtareas"),
        statuses: z.array(z.string()).optional().describe("Filtrar por uno o más estados"),
        include_closed: z.boolean().optional().describe("Incluir tareas cerradas"),
        assignees: z.array(z.string()).optional().describe("Filtrar por uno o más asignados"),
        tags: z.array(z.string()).optional().describe("Filtrar por etiquetas"),
        due_date_gt: z.number().optional().describe("Tareas con fecha de vencimiento mayor a este timestamp"),
        due_date_lt: z.number().optional().describe("Tareas con fecha de vencimiento menor a este timestamp"),
        date_created_gt: z.number().optional().describe("Tareas creadas después de este timestamp"),
        date_created_lt: z.number().optional().describe("Tareas creadas antes de este timestamp"),
        custom_fields: z.array(z.string()).optional().describe("Filtrar por campos personalizados")
      })
    },
    async ({ listId, params }) => {
      const data = await fetchClickup(`/list/${listId}/task`, params);
      if (!data || !data.tasks || data.tasks.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No hay tareas en esta lista`
            }
          ]
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.tasks),
          },
        ]
      };
    }
  );
} 