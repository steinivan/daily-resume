import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const CLOCKIFY_API_KEY = process.env.CLOCKIFY_API_KEY || '';
const CLOCKIFY_API_BASE = "https://api.clockify.me/api/v1";

function getClockifyHeaders() {
    return {
        "X-Api-Key": CLOCKIFY_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json"
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

async function fetchClockify(endpoint: string, params?: Record<string, any>) {
    const url = `${CLOCKIFY_API_BASE}${endpoint}${buildQueryString(params)}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: getClockifyHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Clockify API error:", error);
        return null;
    }
}

async function postClockify(endpoint: string, body: any) {
    const url = `${CLOCKIFY_API_BASE}${endpoint}`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: getClockifyHeaders(),
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Clockify API error:", error);
        return null;
    }
}

export function registerClockifyTools(server: McpServer) {
    // Obtener workspaces
    server.tool(
        "get_workspaces",
        "Obtener los workspaces del usuario en Clockify",
        {},
        async () => {
            const data = await fetchClockify("/workspaces");
            if (!data || !Array.isArray(data) || data.length === 0) {
                return { content: [{ type: "text", text: "No hay workspaces disponibles." }] };
            }
            return { content: [{ type: "text", text: JSON.stringify(data) }] };
        }
    );

    // Obtener proyectos de un workspace
    server.tool(
        "get_projects",
        "Obtener los proyectos de un workspace en Clockify",
        {
            workspaceId: z.string().describe("ID del workspace")
        },
        async ({ workspaceId }) => {
            const data = await fetchClockify(`/workspaces/${workspaceId}/projects`);
            if (!data || !Array.isArray(data) || data.length === 0) {
                return { content: [{ type: "text", text: "No hay proyectos en este workspace." }] };
            }
            return { content: [{ type: "text", text: JSON.stringify(data) }] };
        }
    );

    // Obtener usuarios de un workspace
    server.tool(
        "get_users",
        "Obtener los usuarios de un workspace en Clockify",
        {
            workspaceId: z.string().describe("ID del workspace")
        },
        async ({ workspaceId }) => {
            const data = await fetchClockify(`/workspaces/${workspaceId}/users`);
            if (!data || !Array.isArray(data) || data.length === 0) {
                return { content: [{ type: "text", text: "No hay usuarios en este workspace." }] };
            }
            return { content: [{ type: "text", text: JSON.stringify(data) }] };
        }
    );

    // Obtener time entries de un usuario
    server.tool(
        "get_time_entries",
        "Obtener los time entries de un usuario en un workspace",
        {
            workspaceId: z.string().describe("ID del workspace"),
            userId: z.string().describe("ID del usuario"),
            params: z.object({
                start: z.string().optional().describe("Fecha de inicio (ISO 8601)"),
                end: z.string().optional().describe("Fecha de fin (ISO 8601)")
            }).optional()
        },
        async ({ workspaceId, userId, params }) => {
            const data = await fetchClockify(`/workspaces/${workspaceId}/user/${userId}/time-entries`, params);
            if (!data || !Array.isArray(data) || data.length === 0) {
                return { content: [{ type: "text", text: "No hay time entries para este usuario." }] };
            }
            return { content: [{ type: "text", text: JSON.stringify(data) }] };
        }
    );

    // Crear un time entry
    server.tool(
        "create_time_entry",
        "Crear un time entry en Clockify",
        {
            workspaceId: z.string().describe("ID del workspace"),
            body: z.object({
                start: z.string().describe("Fecha y hora de inicio (ISO 8601)"),
                end: z.string().optional().describe("Fecha y hora de fin (ISO 8601)"),
                description: z.string().optional().describe("Descripción"),
                projectId: z.string().optional().describe("ID del proyecto"),
                taskId: z.string().optional().describe("ID de la tarea"),
                tagIds: z.array(z.string()).optional().describe("IDs de etiquetas"),
                billable: z.boolean().optional().describe("Es facturable")
            })
        },
        async ({ workspaceId, body }) => {
            const data = await postClockify(`/workspaces/${workspaceId}/time-entries`, body);
            if (!data) {
                return { content: [{ type: "text", text: "No se pudo crear el time entry." }] };
            }
            return { content: [{ type: "text", text: `Time entry creado: ${JSON.stringify(data)}` }] };
        }
    );

    // Obtener información del usuario autenticado
    server.tool(
        "get_user_info",
        "Obtener información del usuario autenticado en Clockify",
        {},
        async () => {
            const data = await fetchClockify("/user");
            if (!data) {
                return { content: [{ type: "text", text: "No se pudo obtener la información del usuario." }] };
            }
            return { content: [{ type: "text", text: JSON.stringify(data) }] };
        }
    );

    // Obtener total de horas por proyecto, tarea o periodo
    server.tool(
        "get_total_hours",
        "Obtener el total de horas de un proyecto, una tarea, o de todo el mes y todos los proyectos en Clockify.",
        {
            workspaceId: z.string().describe("ID del workspace"),
            userId: z.string().optional().describe("ID del usuario (opcional, por defecto el autenticado)"),
            projectId: z.string().optional().describe("ID del proyecto (opcional)"),
            taskId: z.string().optional().describe("ID de la tarea (opcional)"),
            start: z.string().optional().describe("Fecha de inicio (ISO 8601, opcional)"),
            end: z.string().optional().describe("Fecha de fin (ISO 8601, opcional)")
        },
        async ({ workspaceId, userId, projectId, taskId, start, end }) => {
            // Obtener el userId si no se pasa
            let uid = userId;
            if (!uid) {
                const userInfo = await fetchClockify("/user");
                if (!userInfo || !userInfo.id) {
                    return { content: [{ type: "text", text: "No se pudo obtener el usuario autenticado." }] };
                }
                uid = userInfo.id;
            }
            // Paginación manual
            let page = 1;
            let totalSeconds = 0;
            let entries = [];
            const pageSize = 100;
            let keepGoing = true;
            while (keepGoing) {
                const params: any = { page, pageSize };
                if (start) params.start = start;
                if (end) params.end = end;
                const data = await fetchClockify(`/workspaces/${workspaceId}/user/${uid}/time-entries`, params);
                if (!data || !Array.isArray(data) || data.length === 0) break;
                // Filtrar por projectId y taskId si aplica
                const filtered = data.filter((entry: any) => {
                    if (projectId && entry.projectId !== projectId) return false;
                    if (taskId && entry.taskId !== taskId) return false;
                    return true;
                });
                entries.push(...filtered);
                // Sumar duración (en segundos)
                for (const entry of filtered) {
                    if (typeof entry.timeInterval === 'object' && typeof entry.timeInterval.duration === 'string') {
                        // ISO 8601 duration, ej: 'PT1H30M10S'
                        const match = entry.timeInterval.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                        if (match) {
                            const h = parseInt(match[1] || '0', 10);
                            const m = parseInt(match[2] || '0', 10);
                            const s = parseInt(match[3] || '0', 10);
                            totalSeconds += h * 3600 + m * 60 + s;
                        }
                    }
                }
                keepGoing = data.length === pageSize;
                page++;
            }
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            return {
                content: [{
                    type: "text",
                    text: `Total: ${hours}h ${minutes}m (${totalSeconds} segundos)\nEntradas contadas: ${entries.length}\nFiltros aplicados: ${JSON.stringify({ workspaceId, userId: uid, projectId, taskId, start, end })}`
                }]
            };
        }
    );
}
