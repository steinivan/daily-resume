import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClickupHeaders } from "../utils/fetchClickup.js";

const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

const createParams = z.object({
  listId: z.string().describe("ID de la lista donde se creará la tarea"),
  params: z.object({
    name: z.string().describe("Nombre de la tarea"),
    markdown_content: z.string().optional().describe("Descripción de la tarea"),
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
});

const updateParams = z.object({
  taskId: z.string().describe("ID de la tarea a actualizar"),
  params: z.object({
    name: z.string().optional().describe("Nuevo nombre de la tarea"),
    markdown_content: z.string().optional().describe("Descripción de la tarea"),
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
      add: z.array(z.number().optional()),
      rem: z.array(z.number().optional()),
    }).optional().describe("IDs de usuarios asignados o desasignados"),
  })
});

export function registerTaskManagerTool(server: McpServer) {
  server.tool(
    "manage_task",
    "Crear o actualizar una tarea en ClickUp según el modo indicado",
    {
      mode: z.enum(["create", "update"]).describe("Modo de operación: 'create' para crear, 'update' para actualizar"),
      create: createParams.optional().describe(`Parámetros para crear tarea (requerido si mode=create).
Flujo:
1. Solo envía el título (formato: '<TIPO>: <título de la tarea>' en mayúsculas, sin caracteres especiales) y los campos mínimos requeridos. No incluyas descripción ni template.
2. Tras crear, consulta la tarea con 'query_task' (modo 'single') usando el taskId retornado.

Reglas:
- El título debe ser: 'FEATURE', 'BUG', 'REFACTOR', 'TEST', 'DOC', 'CHORE', 'STYLE', 'PERF', 'CI', 'OTHER' seguido de dos puntos y el nombre, todo en mayúsculas, sin caracteres especiales.
- No envíes descripción ni template en este paso.

`),
      update: updateParams.optional().describe(`Parámetros para actualizar tarea (requerido si mode=update).

 Flujo:
1. Consulta la tarea con 'query_task' (modo 'single') usando el taskId.
2. Si la descripción está vacía o sin secciones, crea el template markdown con las siguientes secciones obligatorias y títulos en negrita:
   **Descripción**
   **Objetivos**
   **Cambios realizados**
   **Pruebas**
   **Consideraciones/Limitaciones**
   **Comentarios adicionales**
3. Si ya existen secciones, solo actualiza o rellena las existentes, manteniendo el formato markdown y los títulos en negrita.
4. Actualiza la tarea usando 'manage_task' (modo 'update') con el campo 'description'.

Reglas:
- El título debe mantener el formato: '<TIPO>: <título de la tarea>' en mayúsculas, sin caracteres especiales.
- La descripción debe ser clara, descriptiva y en markdown, con títulos/secciones en negrita.
- Explica en **Pruebas** cómo validar lo realizado.
- Si hay limitaciones, indícalas en **Consideraciones/Limitaciones**.
`)
    },
    async ({ mode, create, update }) => {
      try {
        if (mode === "create") {
          if (!create) return { content: [{ type: "text", text: "Faltan parámetros de creación" }] };
          const url = `${CLICKUP_API_BASE}/list/${create.listId}/task`;
          const response = await fetch(url, {
            method: "POST",
            headers: {
              ...getClickupHeaders(),
              "Content-Type": "application/json"
            },
            body: JSON.stringify(create.params)
          });
          if (!response.ok) {
            const errorText = await response.text();
            return { content: [{ type: "text", text: `Error al crear la tarea: ${response.status} - ${errorText}` }] };
          }
          const data = await response.json();
          return { content: [{ type: "text", text: `Tarea creada correctamente: ${JSON.stringify(data)}` }] };
        }
        if (mode === "update") {
          if (!update) return { content: [{ type: "text", text: "Faltan parámetros de actualización" }] };
          const url = `${CLICKUP_API_BASE}/task/${update.taskId}`;
          const response = await fetch(url, {
            method: "PUT",
            headers: {
              ...getClickupHeaders(),
              "Content-Type": "application/json"
            },
            body: JSON.stringify(update.params)
          });
          if (!response.ok) {
            const errorText = await response.text();
            return { content: [{ type: "text", text: `Error al actualizar la tarea: ${response.status} - ${errorText}` }] };
          }
          const data = await response.json();
          return { content: [{ type: "text", text: `Tarea actualizada correctamente: ${JSON.stringify(data)}` }] };
        }
        return { content: [{ type: "text", text: "Modo inválido" }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error de red o inesperado: ${error}` }] };
      }
    }
  );
} 