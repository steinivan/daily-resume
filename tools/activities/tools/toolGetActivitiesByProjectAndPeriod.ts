import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { storage } from "../utils/storageProvider.js";

export function getDateRangeForPeriod(period: string, startDate?: string, endDate?: string): { start: string, end: string } {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  let start: Date, end: Date;
  switch (period) {
    case 'today':
      start = end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'yesterday':
      start = end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      break;
    case 'this_week': {
      const day = now.getDay() || 7;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    }
    case 'last_week': {
      const day = now.getDay() || 7;
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
      break;
    }
    case 'last_7_days':
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      break;
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'last_month': {
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0);
      break;
    }
    case 'custom_range':
      if (!startDate || !endDate) throw new Error('start_date y end_date requeridos para custom_range');
      return { start: startDate, end: endDate };
    default:
      throw new Error('Periodo no soportado');
  }
  return { start: toYMD(start), end: toYMD(end) };
}

export function registerGetActivitiesByProjectAndPeriodTool(server: McpServer) {
  server.tool(
    "get_activities_by_project_and_period",
    "Obtiene todas las actividades de un proyecto para un periodo predefinido o rango personalizado.",
    {
      project_name: z.string().describe("Nombre del proyecto (obligatorio)"),
      period: z.enum(["today", "yesterday", "this_week", "last_week", "last_7_days", "this_month", "last_month", "custom_range"]).describe("Periodo a consultar"),
      start_date: z.string().optional().describe("Fecha de inicio en formato YYYY-MM-DD (solo para custom_range)"),
      end_date: z.string().optional().describe("Fecha de fin en formato YYYY-MM-DD (solo para custom_range)")
    },
    async ({ project_name, period, start_date, end_date }) => {
      let range;
      try {
        range = getDateRangeForPeriod(period, start_date, end_date);
      } catch (e: any) {
        return {
          content: [
            { type: "text", text: e.message }
          ]
        };
      }
      const activities = storage.getActivitiesByRange(range.start, range.end, project_name);
      if (activities.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No hay actividades registradas para el proyecto en el periodo solicitado.`
            }
          ]
        };
      }
      return {
        content: activities.map(a => ({
          type: "text",
          text: `Fecha: ${a.date} | Proyecto: ${a.user} | Status: ${a.activity.status} | Detalle: ${a.activity.value} | id: ${a.id}`
        }))
      };
    }
  );
} 