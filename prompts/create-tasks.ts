import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { checkProjectConfig } from "../utils/projectConfig.js";

export function createTasksPrompt(server: McpServer) {
    server.prompt(
        "crear-tarea-clickup",
        "🎯 Asistente inteligente para crear tareas en ClickUp con template automático, validaciones y mejores prácticas. Incluye workflow completo de 3 pasos con validaciones automáticas. Usa frases como: 'crear nueva tarea', 'workflow de tarea', 'proceso completo tarea'.",
        {
            project: z.string().describe("Identificador del proyecto"),
            titulo: z.string().describe("Título de la tarea que quieres crear"),
            tipo: z.enum(["feature", "bug", "refactor", "test", "doc", "chore", "style", "perf", "ci", "other"]).optional().describe("Tipo de tarea"),
            descripcion: z.string().optional().describe("Descripción básica de lo que quieres hacer"),
            listId: z.string().optional().describe("ID de la lista donde crear la tarea (si no se proporciona, se usará la lista por defecto del proyecto)")
        },
        async (args, _extra) => {
            const { project, titulo, tipo, descripcion, listId } = args;
            const { missing } = checkProjectConfig(project);
            if (missing.length > 0) {
                return {
                    messages: [{
                        role: "assistant",
                        content: {
                            type: "text",
                            text: `Faltan datos de configuración para el proyecto: ${missing.join(", ")}. Ejecuta la tool 'configuration-proyect' con los siguientes campos: ${missing.join(", ")} para completar la configuración antes de continuar.`
                        }
                    }]
                };
            }

            // Reglas y workflow de clickupTaskRules.ts
            const workflowSteps = [
                "🔹 **PASO 1:** Crear la tarea usando la tool '_internal_manage_task' (modo 'create') pasando solo el título formateado y los campos mínimos requeridos. NO enviar descripción ni template en este paso.",
                "🔹 **PASO 2:** Consultar la tarea creada usando la tool 'query_task' (modo 'single') con el taskId retornado. Analizar el campo 'description':\n    - Si está vacío o no tiene secciones, preparar el template completo con las secciones obligatorias.\n    - Si ya existen secciones/template, solo rellenar o actualizar las secciones existentes según la información disponible.",
                "🔹 **PASO 3:** Actualizar la tarea usando la tool '_internal_manage_task' (modo 'update') con el taskId y el campo 'description' en formato markdown, siguiendo estrictamente las reglas de validación."
            ];

            const validationRules = [
                "✅ El título al comienzo debe tener el formato: '<TIPO>: <título de la tarea>' donde tipo debe ser 'FEATURE', 'BUG', 'REFACTOR', 'TEST', 'DOC', 'CHORE', 'STYLE', 'PERF', 'CI', 'OTHER' en mayúsculas (cada uno corresponde al tipo de accion que se hiz en la tarea ejemplo refactor es una refactorizacion de codigo).",
                "✅ La descripción debe estar en formato markdown, usando títulos y subtítulos en negrita (por ejemplo, **Descripción**, **Objetivos**, etc.)",
                "✅ Si la tarea no tiene descripción o template, debe incluir las siguientes secciones obligatorias en este orden: **Descripción**, **Objetivos**, **Cambios realizados**, **Pruebas** (explicar cómo probar lo realizado), **Consideraciones/Limitaciones** (qué no se hizo y por qué), **Comentarios adicionales** (bloqueos, dudas, sugerencias)",
                "✅ Si al editar la tarea ya existe un template o secciones, se deben rellenar esas secciones con la información disponible, manteniendo el formato markdown y los títulos en negrita.",
                "✅ El título de la tarea no puede contener caracteres especiales.",
                "✅ La descripción debe ser descriptiva y clara."
            ];

            let workflowText = `🚀 **WORKFLOW AUTOMÁTICO PARA CREAR TAREA EN CLICKUP**

### 📋 PASOS DEL WORKFLOW
${workflowSteps.map(s => `${s}`).join("\n\n")}`;

            let rulesText = `\n\n### ⚖️ REGLAS DE VALIDACIÓN OBLIGATORIAS
${validationRules.map(s => `${s}`).join("\n")}`;

            const tipoFinal = tipo ? tipo.toUpperCase() : "Se determinará automáticamente";
            const tituloFormateado = tipo ? `${tipo.toUpperCase()}: ${titulo}` : titulo;

            return {
                messages: [{
                    role: "assistant",
                    content: {
                        type: "text",
                        text: `${workflowText}${rulesText}

**📝 INFORMACIÓN RECIBIDA:**
- Título original: ${titulo}
- Título formateado: ${tituloFormateado}
- Tipo: ${tipoFinal}
- Descripción base: ${descripcion || 'Se creará template completo automáticamente'}
- Lista ID: ${listId || 'Se necesitará especificar'}

**⚠️ INSTRUCCIONES CRÍTICAS:**
- ❌ NO uses directamente la tool 'manage_task' (está obsoleta)
- ✅ USA ÚNICAMENTE la tool '_internal_manage_task' que incluye las validaciones
- ✅ SIGUE este workflow de 3 pasos exactamente en orden
- ✅ CONFIRMA cada paso antes de continuar al siguiente
- ✅ VALIDA que el título tenga el formato correcto antes de crear

**🎯 ¿ESTÁS LISTO PARA COMENZAR EL WORKFLOW?**
Responde 'SÍ' para proceder con el **PASO 1** (crear tarea básica).`
                    }
                }, {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Quiero crear una tarea nueva en ClickUp siguiendo el proceso completo. Título: \"${titulo}\". ${descripcion ? `Descripción: \"${descripcion}\".` : ''} Guíame paso a paso por el workflow completo.`
                    }
                }]
            };
        }
    );
}