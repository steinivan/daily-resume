import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchClickup } from "../utils/fetchClickup.js";

const getTasksParams = z.object({
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
});

export function registerTaskQueryTool(server: McpServer) {
  server.tool(
    "query_task",
    "Obtener una tarea específica o todas las tareas de una lista en ClickUp según el modo indicado",
    {
      mode: z.enum(["single", "list"]).describe("Modo de operación: 'single' para una tarea, 'list' para todas las tareas de una lista"),
      taskId: z.string().optional().describe("ID de la tarea (requerido si mode=single)"),
      getTasks: getTasksParams.optional().describe("Parámetros para obtener tareas de una lista (requerido si mode=list)")
    },
    async ({ mode, taskId, getTasks }) => {
      if (mode === "single") {
        if (!taskId) {
          return { content: [{ type: "text", text: "Falta el parámetro taskId" }] };
        }
        const data = await fetchClickup(`/task/${taskId}?include_markdown_description=true`);
        if (!data) {
          return { content: [{ type: "text", text: "No se pudo obtener la tarea. Verifica el ID o la conexión." }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(data) }] };
      }
      if (mode === "list") {
        if (!getTasks) {
          return { content: [{ type: "text", text: "Faltan los parámetros de lista" }] };
        }
        const data = await fetchClickup(`/list/${getTasks.listId}/task?include_markdown_description=true`, getTasks.params);
        if (!data || !data.tasks || data.tasks.length === 0) {
          return { content: [{ type: "text", text: "No hay tareas en esta lista" }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(data.tasks) }] };
      }
      return { content: [{ type: "text", text: "Modo inválido" }] };
    }
  );
} 