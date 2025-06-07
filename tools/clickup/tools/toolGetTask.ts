import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchClickup } from "../utils/fetchClickup.js";

export function registerGetTaskTool(server: McpServer) {
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
} 