import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export default function createTasksPrompt(server: McpServer) {
    server.prompt(
        "create-task-flow",
        "Crea, actualiza o elimina tareas en ClickUp. Usa frases como: 'crea tarea', 'nueva tarea', 'agrega tarea', 'actualiza tarea', 'elimina tarea'.",
        {
            operation: z.enum(["create", "update", "delete"]).describe("Operación a realizar"),
            entityType: z.string().describe("Tipo de entidad (document, user, etc.)"),
            strict: z.enum(["true", "false"]).describe("Si debe seguir reglas estrictas (true/false)").optional()
        },
        async (args, _extra) => {
            const { operation, entityType, strict } = args;
            const isStrict = strict === undefined ? true : strict === "true";

            // Reglas y workflow de clickupTaskRules.ts
            const workflowSteps = [
                "1. Crear la tarea usando la tool 'manage_task' (modo 'create') pasando solo el título y los campos mínimos requeridos. No enviar descripción ni template en este paso.",
                "2. Consultar la tarea creada usando la tool 'query_task' (modo 'single') con el taskId retornado. Analizar el campo 'description':\n  - Si está vacío o no tiene secciones, preparar el template completo con las secciones obligatorias.\n  - Si ya existen secciones/template, solo rellenar o actualizar las secciones existentes según la información disponible.",
                "3. Actualizar la tarea usando la tool 'manage_task' (modo 'update') con el taskId y el campo 'description' en formato markdown, siguiendo estrictamente las reglas de 'validation_rules'."
            ];
            const validationRules = [
                "El título al comienzo debe tener el formato: '<tipo>: <título de la tarea>' donde tipo debe ser 'feature', 'bug', 'refactor', 'test', 'doc', 'chore', 'style', 'perf', 'ci', 'other'. en mayúsculas.",
                "La descripción debe estar en formato markdown, usando títulos y subtítulos en negrita (por ejemplo, **Descripción**, **Objetivos**, etc.)",
                "Si la tarea no tiene descripción o template, debe incluir las siguientes secciones obligatorias en este orden:  **Descripción**  **Objetivos**  **Cambios realizados**  **Pruebas** (explicar cómo probar lo realizado)  **Consideraciones/Limitaciones** (qué no se hizo y por qué)  **Comentarios adicionales** (bloqueos, dudas, sugerencias)",
                "Si al editar la tarea ya existe un template o secciones, se deben rellenar esas secciones con la información disponible, manteniendo el formato markdown y los títulos en negrita.",
                "El título de la tarea no puede contener caracteres especiales.",
                "La descripción debe ser descriptiva y clara."
            ];

            let rulesText = `### WORKFLOW ClickUp\n${workflowSteps.map(s => `- ${s}`).join("\n")}`;
            rulesText += `\n\n### REGLAS DE VALIDACIÓN\n${validationRules.map(s => `- ${s}`).join("\n")}`;

            return {
                messages: [{
                    role: "assistant",
                    content: {
                        type: "text",
                        text: `${rulesText}\n\nOperación: ${operation.toUpperCase()} ${entityType}\nModo estricto: ${isStrict ? 'Sí' : 'No'}`
                    }
                }, {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Quiero ${operation === 'create' ? 'crear' : operation === 'update' ? 'actualizar' : 'eliminar'} un ${entityType}. Guíame paso a paso.`
                    }
                }]
            };
        }
    );

}