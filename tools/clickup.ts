import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY || '';
const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

function getClickupHeaders() {
    return {
        accept: "application/json",
        Authorization: CLICKUP_API_KEY
    };
}

function buildQueryString(params: Record<string, any> = {}) {
    if (!params || Object.keys(params).length === 0) return "";
    const query = Object.entries(params).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
            acc[key] = value.join(",");
        } else if (typeof value === "boolean") {
            acc[key] = value ? "true" : "false";
        } else if (value !== undefined && value !== null) {
            acc[key] = value.toString();
        }
        return acc;
    }, {} as Record<string, string>);
    return "?" + new URLSearchParams(query).toString();
}

async function fetchClickup(endpoint: string, params?: Record<string, any>) {
    const url = `${CLICKUP_API_BASE}${endpoint}${buildQueryString(params)}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: getClickupHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("ClickUp API error:", error);
        return null;
    }
}

export function registerClickupTools(server: McpServer) {
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

    server.tool(
        "get_task",
        "obtener una tarea especifica de clickup usando el id de la tarea",
        {
            taskId: z.string().describe("id de la tarea")
        },
        async ({ taskId }) => {
            const data = await fetchClickup(`/task/${taskId}`);
            if (!data) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "No se pudo obtener la tarea. Verifica el ID o la conexión."
                        }
                    ]
                };
            }
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data),
                    },
                ]
            };
        }
    );

    server.tool(
        "update_task",
        "actualizar una tarea especifica de clickup usando el id de la tarea",
        {
            taskId: z.string().describe("id de la tarea"),
            params: z.object({
                name: z.string().optional().describe("Nuevo nombre de la tarea"),
                description: z.string().optional().describe("Descripción de la tarea"),
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
                    add: z.array(z.number().optional().describe("ID del usuario asignado. Ejemplo: [1, 2, 3]. Debe ser un entero y no un string.")),
                    rem: z.array(z.number().optional().describe("ID del usuario desasignado. Ejemplo: [1, 2, 3]. Debe ser un entero y no un string.")),
                }).optional().describe("IDs de usuarios asignados o desasignados"),
            })
        },
        async ({ taskId, params }) => {
            const url = `${CLICKUP_API_BASE}/task/${taskId}`;
            try {
                const response = await fetch(url, {
                    method: "PUT",
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
                                text: `Error al actualizar la tarea: ${response.status} - ${errorText}`
                            }
                        ]
                    };
                }
                const data = await response.json();
                return {
                    content: [
                        {
                            type: "text",
                            text: `Tarea actualizada correctamente: ${JSON.stringify(data)}`
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

    server.tool(
        "register_time_in_task",
        "Registrar tiempo en una tarea especifica de clickup usando el id de la tarea",
        {
            taskId: z.string().describe("id de la tarea"),
            timeSpent: z.string().describe("Tiempo en milisegundos")
        },
        async ({ taskId, timeSpent }) => {
            const url = `${CLICKUP_API_BASE}/task/${taskId}/time`;
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: getClickupHeaders(),
                    body: JSON.stringify({
                        time: timeSpent,
                        start: new Date().toISOString(),
                    })
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error al registrar el tiempo: ${response.status} - ${errorText}`
                            }
                        ]
                    };
                }
                const data = await response.json();
                return {
                    content: [
                        {
                            type: "text",
                            text: `Tiempo registrado correctamente: ${JSON.stringify(data)}`
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