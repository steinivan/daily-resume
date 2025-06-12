// Tools entry for configProyect 
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SqliteStorageProvider } from "../../../sqliteStorageProvider.js";


export function registerConfigProyectTool(server: McpServer) {
    server.tool(
      "configuration-proyect",
      "Configura o actualiza los metadatos de un proyecto (por ejemplo, clickup_list_id, project_title, etc.) en la base de datos.",
      {
        project: z.string().describe("Identificador del proyecto a configurar. Esto se obtiene del package json en name o lo da el usuario."),
        channel: z.string().optional().describe("Canal de comunicación del proyecto en slack. Esto se obtiene del usuario."),
        clickup_list_id: z.string().optional().describe("Identificador de la lista de clickup. Esto se obtiene del usuario."),
      },
      async ({ project, channel, clickup_list_id }) => {
        const db = new SqliteStorageProvider();
        if(channel){
          db.setProjectMetadata(project, "channel", channel);
        }
        if(clickup_list_id){
          db.setProjectMetadata(project, "clickup_list_id", clickup_list_id);
        }
        return {
          content: [{
            type: "text",
            text: `Configuración actualizada para el proyecto '${project}': ${channel ? `channel: ${channel}, ` : ""}${clickup_list_id ? `clickup_list_id: ${clickup_list_id}` : ""}`
          }]
        };
      }
    );
  } 