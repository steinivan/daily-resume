export const templates = {
    internalToolWarning: `⚠️ **Advertencia: Herramienta Interna**

Esta herramienta está diseñada para uso interno del sistema.
No debe ser invocada directamente por usuarios.

Si necesitas realizar esta acción, por favor contacta al equipo de soporte.`,

    getTitleFormatError: (title: string) => `❌ **Error en formato del título**

El título "${title}" no cumple con el formato requerido.
Debe comenzar con uno de los siguientes prefijos:
- FEATURE:
- BUG:
- REFACTOR:
- TEST:
- DOC:
- CHORE:
- STYLE:
- PERF:
- CI:
- OTHER:`,

    getTaskCreationSuccess: (taskId: string, taskName: string, taskUrl: string, taskData: string) => `✅ **Tarea creada exitosamente**

ID: \`${taskId}\`
Nombre: ${taskName}
URL: ${taskUrl}

Detalles:
\`\`\`json
${taskData}
\`\`\``,

    getTaskUpdateSuccess: (taskId: string, taskName: string, taskUrl: string, taskData: string) => `✅ **Tarea actualizada exitosamente**

ID: \`${taskId}\`
Nombre: ${taskName}
URL: ${taskUrl}

Detalles:
\`\`\`json
${taskData}
\`\`\``,

    createParamsDescription: `Parámetros para crear una tarea:

- listId: ID de la lista donde se creará la tarea
- name: Nombre de la tarea (debe seguir el formato: TYPE: descripción)
- markdown_content: Descripción en formato markdown
- assignees: IDs de usuarios asignados
- tags: Etiquetas para la tarea
- status: Estado inicial
- priority: Prioridad (1-4)
- due_date: Fecha de vencimiento (timestamp)
- start_date: Fecha de inicio (timestamp)
- time_estimate: Estimación de tiempo en ms
- custom_fields: Campos personalizados
- parent: ID de la tarea padre
- notify_all: Notificar a todos
- time_spent: Tiempo en ms`,

    updateParamsDescription: `Parámetros para actualizar una tarea:

- taskId: ID de la tarea a actualizar
- name: Nuevo nombre
- markdown_content: Nueva descripción
- status: Nuevo estado
- priority: Nueva prioridad (1-4)
- due_date: Nueva fecha de vencimiento
- start_date: Nueva fecha de inicio
- tags: Nuevas etiquetas
- custom_fields: Nuevos campos personalizados
- time_estimate: Nueva estimación de tiempo
- time_spent: Tiempo en string (ej: 1h 30m)
- archived: Archivar tarea
- assignees: Asignar/desasignar usuarios`
}; 