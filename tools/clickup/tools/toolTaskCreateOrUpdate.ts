import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClickupHeaders } from "../utils/fetchClickup.js";
import { templates } from "../prompts/templates.js";

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
    check_required_custom_fields: z.boolean().optional().describe("Validar campos personalizados requeridos"),
    time_spent: z.number().optional().describe("Tiempo en ms"),
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

// Función auxiliar para registrar tiempo
async function registerTimeInTask(taskId: string, timeSpent: number) {
  const start = Date.now() - timeSpent;
  const url = `${CLICKUP_API_BASE}/task/${taskId}/time`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { ...getClickupHeaders(), 'content-type': 'application/json' },
      body: JSON.stringify({ start: start, end: Date.now(), time: timeSpent })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al registrar tiempo: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    const timeInHours = (timeSpent / (1000 * 60 * 60)).toFixed(2);
    return `✅ Tiempo registrado: ${timeInHours} horas (${timeSpent}ms)`;
  } catch (error) {
    throw new Error(`Error al registrar tiempo: ${(error as Error).message || error}`);
  }
}

export function registerTaskManagerTool(server: McpServer) {
  server.tool(
    "manage_task",
    "Crea o actualiza una tarea en ClickUp",
    {
      mode: z.enum(["create", "update"]).describe("Modo de operación: 'create' para crear, 'update' para actualizar"),
      create: createParams.optional().describe(templates.createParamsDescription),
      update: updateParams.optional().describe(templates.updateParamsDescription)
    },
    async ({ mode, create, update }) => {
      try {
        if (mode === "create") {
          // Validación de workflow
          if (!create) {
            return { content: [{ type: "text", text: "❌ Faltan parámetros de creación" }] };
          }
          // Validar formato del título
          const titleRegex = /^(FEATURE|BUG|REFACTOR|TEST|DOC|CHORE|STYLE|PERF|CI|OTHER):\s*.+$/;
          if (!titleRegex.test(create.params.name)) {
            return { 
              content: [{ 
                type: "text", 
                text: templates.getTitleFormatError(create.params.name)
              }] 
            };
          }

          const url = `${CLICKUP_API_BASE}/list/${create.listId}/task`;
          const response = await fetch(url, {
            method: "POST",
            headers: {
              ...getClickupHeaders(),
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...create.params
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            return { content: [{ type: "text", text: `❌ Error al crear la tarea: ${response.status} - ${errorText}` }] };
          }

          const data = await response.json();
          let timeRegistrationMessage = "";

          // Si hay time_spent, registrar el tiempo
          if (create.params.time_spent) {
            try {
              timeRegistrationMessage = await registerTimeInTask(data.id, create.params.time_spent);
            } catch (error) {
              timeRegistrationMessage = `❌ ${(error as Error).message}`;
            }
          }

          return { 
            content: [{ 
              type: "text", 
              text: `${templates.getTaskCreationSuccess(data.id, data.name, data.url, JSON.stringify(data, null, 2))}
${timeRegistrationMessage ? `\n\n${timeRegistrationMessage}` : ""}`
            }] 
          };
        }

        if (mode === "update") {
          if (!update) {
            return { content: [{ type: "text", text: "❌ Faltan parámetros de actualización" }] };
          }

          const url = `${CLICKUP_API_BASE}/task/${update.taskId}`;
          const response = await fetch(url, {
            method: "PUT",
            headers: {
              ...getClickupHeaders(),
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...update.params
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            return { content: [{ type: "text", text: `❌ Error al actualizar la tarea: ${response.status} - ${errorText}` }] };
          }

          const data = await response.json();
          let timeRegistrationMessage = "";

          // Si hay time_spent, registrar el tiempo
          if (update.params.time_spent) {
            try {
              const timeSpentMs = typeof update.params.time_spent === 'string' 
                ? parseInt(update.params.time_spent, 10) 
                : update.params.time_spent;
              timeRegistrationMessage = await registerTimeInTask(data.id, timeSpentMs);
            } catch (error) {
              timeRegistrationMessage = `❌ ${(error as Error).message}`;
            }
          }

          return { 
            content: [{ 
              type: "text", 
              text: `${templates.getTaskUpdateSuccess(data.id, data.name, data.url, JSON.stringify(data, null, 2))}
${timeRegistrationMessage ? `\n\n${timeRegistrationMessage}` : ""}`
            }] 
          };
        }

        return { content: [{ type: "text", text: "❌ Modo inválido" }] };
      } catch (error) {
        return { content: [{ type: "text", text: `❌ Error de red o inesperado: ${error}` }] };
      }
    }
  );
}