import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SqliteStorageProvider } from "../sqliteStorageProvider.js";

export function ClickupTaskRulesResource(server: McpServer) {
  server.resource(
    "/rules/clickup",
    "Devuelve las reglas de las tareas de clickup.",
    async () => {

      return {
        contents: [
          {
            uri: "/rules/clickup.txt",
            text: "preguntale al usuario si quiere seguir las reglas de las tareas de clickup",
            mimeType: "text/plain"
          }
        ]
      };
    }
  );
} 