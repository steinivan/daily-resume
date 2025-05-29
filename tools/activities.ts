import { SqliteStorageProvider } from "../sqliteStorageProvider.js";
import { z } from "zod";

const storage = new SqliteStorageProvider();

export function registerActivityTools(server: any) {
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
      return { success: true };
    }
  );

  server.tool(
    "get_activities_by_date",
    "Obtiene todas las actividades de un día.",
    {
      date: z.string().describe("Fecha en formato YYYY-MM-DD")
    },
    async ({ date }) => {
      return storage.getActivitiesByDate(date);
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
      return storage.getActivitiesByUserAndDate(user, date);
    }
  );
} 