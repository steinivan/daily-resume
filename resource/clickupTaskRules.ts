import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function ClickupTaskRulesResource(server: McpServer) {
  // server.resource(
  //   "clickup-rules",
  //   "tasks://clickup/rules",
  //   async (uri) => {
  //     return {
  //       contents: [
  //         {
  //           uri: uri.href,
  //           mimeType: "application/json",
  //           text: JSON.stringify({
  //             workflow_steps: [
  //               "1. Crear la tarea usando la tool 'manage_task' (modo 'create') pasando solo el título y los campos mínimos requeridos. No enviar descripción ni template en este paso.",
  //               "2. Consultar la tarea creada usando la tool 'query_task' (modo 'single') con el taskId retornado. Analizar el campo 'description':\n  - Si está vacío o no tiene secciones, preparar el template completo con las secciones obligatorias.\n  - Si ya existen secciones/template, solo rellenar o actualizar las secciones existentes según la información disponible.",
  //               "3. Actualizar la tarea usando la tool 'manage_task' (modo 'update') con el taskId y el campo 'description' en formato markdown, siguiendo estrictamente las reglas de 'validation_rules'."
  //             ],
  //             validation_rules: [
  //               "El título al comienzo debe tener el formato: '<tipo>: <título de la tarea>' donde tipo debe ser 'feature', 'bug', 'refactor', 'test', 'doc', 'chore', 'style', 'perf', 'ci', 'other'. en mayusculas",
  //               "La descripción debe estar en formato markdown, usando títulos y subtítulos en negrita (por ejemplo, **Descripción**, **Objetivos**, etc.)",
  //               "Si la tarea no tiene descripción o template, debe incluir las siguientes secciones obligatorias en este orden: \n\n**Descripción**\n\n**Objetivos**\n\n**Cambios realizados**\n\n**Pruebas** (explicar cómo probar lo realizado)\n\n**Consideraciones/Limitaciones** (qué no se hizo y por qué)\n\n**Comentarios adicionales** (bloqueos, dudas, sugerencias)",
  //               "Si al editar la tarea ya existe un template o secciones, se deben rellenar esas secciones con la información disponible, manteniendo el formato markdown y los títulos en negrita.",
  //               "El título de la tarea no puede contener caracteres especiales.",
  //               "La descripción debe ser descriptiva y clara."
  //             ]
  //           })
  //         }
  //       ]
  //     };
  //   }
  // );
} 