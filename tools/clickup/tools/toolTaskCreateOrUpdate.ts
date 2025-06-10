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
    check_required_custom_fields: z.boolean().optional().describe("Validar campos personalizados requeridos"),
    workflow_validated: z.boolean().optional().describe("Indica si viene del workflow validado")
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
    workflow_validated: z.boolean().optional().describe("Indica si viene del workflow validado")
  })
});

export function registerTaskManagerTool(server: McpServer) {
  // Tool obsoleta que redirige al workflow
  server.tool(
    "manage_task",
    "⚠️ HERRAMIENTA OBSOLETA - No usar directamente. Para crear tareas nuevas usa el prompt 'crear-tarea-clickup' que incluye workflow completo con validaciones automáticas.",
    {
      mode: z.enum(["create", "update"]).describe("Modo obsoleto - usar prompt en su lugar"),
      create: createParams.optional(),
      update: updateParams.optional()
    },
    async ({ mode, create, update }) => {
      return { 
        content: [{ 
          type: "text", 
          text: `❌ **HERRAMIENTA OBSOLETA DETECTADA**

Esta tool 'manage_task' está obsoleta y no debe usarse directamente.

🎯 **PARA CREAR TAREAS NUEVAS:**
Usa el prompt 'crear-tarea-clickup' que te guiará por el workflow completo con validaciones automáticas.

🔧 **PARA OPERACIONES INTERNAS:**
El sistema usará automáticamente '_internal_manage_task' como parte del workflow.

**Ejemplo de uso correcto:**
\`\`\`
Prompt: crear-tarea-clickup
Título: "Implementar login de usuarios"
Tipo: "feature"
Descripción: "Sistema de autenticación básico"
\`\`\`

Por favor, usa el prompt correcto para una experiencia óptima.` 
        }] 
      };
    }
  );

  // Tool interna para uso del workflow
  server.tool(
    "_internal_manage_task",
    "🔒 Tool interna del workflow de ClickUp - Solo para uso automático del sistema. No usar directamente.",
    {
      mode: z.enum(["create", "update"]).describe("Modo de operación: 'create' para crear, 'update' para actualizar"),
      create: createParams.optional().describe(`Parámetros para crear tarea (requerido si mode=create).
SOLO para uso interno del workflow. Flujo automático:
1. Solo envía el título (formato: '<TIPO>: <título de la tarea>' en mayúsculas, sin caracteres especiales) y los campos mínimos requeridos. No incluyas descripción ni template.
2. Tras crear, el workflow consultará la tarea con 'query_task' (modo 'single') usando el taskId retornado.

Reglas automáticas:
- El título debe ser: 'FEATURE', 'BUG', 'REFACTOR', 'TEST', 'DOC', 'CHORE', 'STYLE', 'PERF', 'CI', 'OTHER' seguido de dos puntos y el nombre, todo en mayúsculas, sin caracteres especiales.
- No envíes descripción ni template en este paso.
- Debe incluir workflow_validated: true`),
      update: updateParams.optional().describe(`Parámetros para actualizar tarea (requerido si mode=update).
SOLO para uso interno del workflow. Flujo automático:
1. El workflow ya consultó la tarea con 'query_task' (modo 'single') usando el taskId.
2. Si la descripción estaba vacía, se creó el template markdown con las secciones obligatorias y títulos en negrita:
   **Descripción**
   **Objetivos**
   **Cambios realizados**
   **Pruebas**
   **Consideraciones/Limitaciones**
   **Comentarios adicionales**
3. Si ya existían secciones, se actualizaron o rellenaron las existentes.
4. Se actualiza con el campo 'description' validado.

Reglas automáticas:
- El título mantiene el formato: '<TIPO>: <título de la tarea>' en mayúsculas, sin caracteres especiales.
- La descripción es clara, descriptiva y en markdown, con títulos/secciones en negrita.
- Debe incluir workflow_validated: true`)
    },
    async ({ mode, create, update }) => {
      try {
        if (mode === "create") {
          // Validación de workflow
          if (!create) {
            return { content: [{ type: "text", text: "❌ Faltan parámetros de creación" }] };
          }

          if (!create.params.workflow_validated) {
            return { 
              content: [{ 
                type: "text", 
                text: `❌ **ACCESO NO AUTORIZADO A TOOL INTERNA**

Esta tool '_internal_manage_task' es solo para uso interno del workflow automático.

🎯 **PARA CREAR TAREAS:**
Usa el prompt 'crear-tarea-clickup' que te guiará paso a paso:

1. Define tu tarea con título y descripción
2. El sistema validará automáticamente el formato
3. Se creará con el template completo
4. Se aplicarán todas las reglas de validación

**No intentes usar esta tool directamente.** El workflow se encarga de todo automáticamente.` 
              }] 
            };
          }

          // Validar formato del título
          const titleRegex = /^(FEATURE|BUG|REFACTOR|TEST|DOC|CHORE|STYLE|PERF|CI|OTHER):\s*.+$/;
          if (!titleRegex.test(create.params.name)) {
            return { 
              content: [{ 
                type: "text", 
                text: `❌ **ERROR DE FORMATO EN TÍTULO**

Título recibido: "${create.params.name}"

El título debe seguir el formato: '<TIPO>: <descripción>'
Donde TIPO debe ser uno de: FEATURE, BUG, REFACTOR, TEST, DOC, CHORE, STYLE, PERF, CI, OTHER (en mayúsculas)

Ejemplo correcto: "FEATURE: Implementar sistema de login"` 
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
              ...create.params,
              workflow_validated: undefined // No enviar este campo a la API
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            return { content: [{ type: "text", text: `❌ Error al crear la tarea: ${response.status} - ${errorText}` }] };
          }

          const data = await response.json();
          return { 
            content: [{ 
              type: "text", 
              text: `✅ **PASO 1 COMPLETADO - TAREA CREADA**

Tarea creada exitosamente:
- ID: ${data.id}
- Título: ${data.name}
- URL: ${data.url}

🔄 **SIGUIENTE:** Proceder con PASO 2 - Consultar tarea para analizar descripción existente.

Datos completos: ${JSON.stringify(data, null, 2)}` 
            }] 
          };
        }

        if (mode === "update") {
          if (!update) {
            return { content: [{ type: "text", text: "❌ Faltan parámetros de actualización" }] };
          }

          if (!update.params.workflow_validated) {
            return { 
              content: [{ 
                type: "text", 
                text: `❌ **ACCESO NO AUTORIZADO A TOOL INTERNA**

Esta tool '_internal_manage_task' es solo para uso interno del workflow automático.

🎯 **PARA ACTUALIZAR TAREAS:**
Usa el prompt 'crear-tarea-clickup' que incluye el proceso completo de actualización automática.

**No intentes usar esta tool directamente.** El workflow maneja todas las validaciones y actualizaciones.` 
              }] 
            };
          }

          const url = `${CLICKUP_API_BASE}/task/${update.taskId}`;
          const response = await fetch(url, {
            method: "PUT",
            headers: {
              ...getClickupHeaders(),
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...update.params,
              workflow_validated: undefined // No enviar este campo a la API
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            return { content: [{ type: "text", text: `❌ Error al actualizar la tarea: ${response.status} - ${errorText}` }] };
          }

          const data = await response.json();
          return { 
            content: [{ 
              type: "text", 
              text: `✅ **PASO 3 COMPLETADO - TAREA ACTUALIZADA**

Tarea actualizada exitosamente:
- ID: ${data.id}
- Título: ${data.name}
- Descripción: Template aplicado correctamente
- URL: ${data.url}

🎉 **WORKFLOW COMPLETADO** - La tarea está lista con todas las validaciones aplicadas.

Datos completos: ${JSON.stringify(data, null, 2)}` 
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