import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClickupHeaders } from "../utils/fetchClickup.js";

const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

export function registerGetClickupUserInfoTool(server: McpServer) {
  server.tool(
    "get_clickup_user_info",
    "Obtiene la información del usuario autenticado en ClickUp (incluye el ID de usuario).",
    {},
    async () => {
      const url = `${CLICKUP_API_BASE}/user`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: getClickupHeaders(),
        });
        if (!response.ok) {
          const errorText = await response.text();
          return {
            content: [
              {
                type: "text",
                text: `Error al obtener el usuario: ${response.status} - ${errorText}`
              }
            ]
          };
        }
        const data = await response.json();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data)
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