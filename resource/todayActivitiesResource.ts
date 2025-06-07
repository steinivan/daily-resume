import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SqliteStorageProvider } from "../sqliteStorageProvider.js";

export function registerTodayActivitiesResource(server: McpServer) {
  server.resource(
    "/today-activities",
    "Devuelve las actividades registradas para el día de hoy.",
    async () => {
      const storage = new SqliteStorageProvider();
      const today = new Date().toISOString().slice(0, 10);
      const activities = storage.getActivitiesByDate(today);
      return {
        contents: [
          {
            uri: "/today-activities.json",
            text: JSON.stringify(activities, null, 2),
            mimeType: "application/json"
          }
        ]
      };
    }
  );
} 