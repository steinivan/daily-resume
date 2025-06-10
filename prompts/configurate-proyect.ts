import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { checkProjectConfig } from "../utils/projectConfig.js";

export default function configurateProyectPrompt(server: McpServer) {
    server.prompt(
        "configurate-proyect",
        "Asistente para configurar los metadatos requeridos de un proyecto (clickup_list_id, project_title, listId).",
        {
            project: z.string().describe("Identificador del proyecto a configurar"),
            clickup_list_id: z.string().optional().describe("ID de la lista de ClickUp para el proyecto"),
            project_title: z.string().optional().describe("Título del proyecto"),
            listId: z.string().optional().describe("ID de la lista principal asociada al proyecto")
        },
        async (args, _extra) => {
            const { project, clickup_list_id, project_title, listId } = args;
            const { missing, metadata } = checkProjectConfig(project);
            const provided: Record<string, string | undefined> = { clickup_list_id, project_title, listId };
            const stillMissing = missing.filter(key => !provided[key]);

            if (stillMissing.length > 0) {
                return {
                    messages: [{
                        role: "assistant",
                        content: {
                            type: "text",
                            text: `Faltan los siguientes campos para configurar el proyecto: ${stillMissing.join(", ")}. Por favor, proporciónalos para completar la configuración.`
                        }
                    }]
                };
            }

            return {
                messages: [{
                    role: "assistant",
                    content: {
                        type: "text",
                        text: `Configuración lista para el proyecto '${project}'. Ejecuta la tool 'configuration-proyect' con los siguientes datos: { clickup_list_id: '${clickup_list_id}', project_title: '${project_title}', listId: '${listId}' }.`
                    }
                }]
            };
        }
    );
}
