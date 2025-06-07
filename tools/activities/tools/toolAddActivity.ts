import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { storage } from "../utils/storageProvider.js";

export function registerAddActivityTool(server: McpServer) {
  server.tool(
    "add_activity",
    "Registra una actividad realizada en el proyecto.",
    {
      project_name: z.string().describe("Nombre del proyecto (obligatorio, debe existir en el contexto)"),
      activity: z.string().describe("Descripción específica del cambio realizado")
    },
    async ({ project_name, activity }) => {
      const date = new Date().toISOString().slice(0, 10);
      storage.addActivity({ user: project_name, date, activity });
      return {
        content: [
          {
            type: "text",
            text: `✓`
          }
        ]
      };
    }
  );
} 