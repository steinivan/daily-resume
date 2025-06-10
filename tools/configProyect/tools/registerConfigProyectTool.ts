// Tools entry for configProyect 
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SqliteStorageProvider } from "../../../sqliteStorageProvider.js";


export function registerConfigProyectTool(server: McpServer) {
    server.tool(
      "configuration-proyect",
      "Configura o actualiza los metadatos de un proyecto (por ejemplo, clickup_list_id, project_title, etc.) en la base de datos.",
      {
        project: z.string().describe("Identificador del proyecto a configurar"),
        data: z.record(z.string(), z.string()).describe("Objeto clave-valor con los campos a configurar")
      },
      async ({ project, data }) => {
        const db = new SqliteStorageProvider();
        for (const key of Object.keys(data)) {
          db.setProjectMetadata(project, key, data[key]);
        }
        return {
          content: [{
            type: "text",
            text: `Configuración actualizada para el proyecto '${project}': ${Object.keys(data).join(", ")}`
          }]
        };
      }
    );
  } 