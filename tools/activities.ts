import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SqliteStorageProvider } from "../sqliteStorageProvider.js";
import { z } from "zod";

const storage = new SqliteStorageProvider();

export function registerActivityTools(server: McpServer) {
  server.tool(
    "add_activity",
    "Agrega una actividad diaria para un usuario.",
    {
      user: z.string().describe("Nombre del usuario"),
      date: z.string().describe("Fecha en formato YYYY-MM-DD"),
      activity: z.string().describe("Descripción de la actividad")
    },
    async ({ user, date, activity }) => {
      storage.addActivity({ user, date, activity });
      return {
        content: [
          {
            type: "text",
            text: `Actividad registrada para ${user} el ${date}.`
          }
        ]
      };
    }
  );

  server.tool(
    "get_activities_by_date",
    "Obtiene todas las actividades de un día.",
    {
      date: z.string().describe("Fecha en formato YYYY-MM-DD")
    },
    async ({ date }) => {
      const activities = storage.getActivitiesByDate(date);
      if (activities.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No hay actividades registradas para la fecha ${date}.`
            }
          ]
        };
      }
      return {
        content: activities.map(a => ({
          type: "text",
          text: `Usuario: ${a.user} | Actividad: ${a.activity}`
        }))
      };
    }
  );

  server.tool(
    "get_activities_by_user_and_date",
    "Obtiene las actividades de un usuario en un día.",
    {
      user: z.string().describe("Nombre del usuario"),
      date: z.string().describe("Fecha en formato YYYY-MM-DD")
    },
    async ({ user, date }) => {
      const activities = storage.getActivitiesByUserAndDate(user, date);
      if (activities.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No hay actividades registradas para ${user} en la fecha ${date}.`
            }
          ]
        };
      }
      return {
        content: activities.map(a => ({
          type: "text",
          text: `Actividad: ${a.activity}`
        }))
      };
    }
  );
} 