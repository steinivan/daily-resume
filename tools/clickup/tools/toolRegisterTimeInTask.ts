import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClickupHeaders } from "../utils/fetchClickup.js";

const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

export function registerRegisterTimeInTaskTool(server: McpServer) {
  server.tool(
    "register_time_in_task",
    "Registrar tiempo en una tarea específica de ClickUp usando el ID de la tarea",
    {
      taskId: z.string().min(1).describe("ID de la tarea de ClickUp"),
      timeSpent: z.any().refine((val) => {
        const num = typeof val === 'string' ? parseInt(val, 10) : val;
        return typeof num === 'number' && !isNaN(num) && num >= 1000;
      }, {
        message: "timeSpent debe ser un número válido mayor o igual a 1000ms"
      }).transform((val) => {
        return typeof val === 'string' ? parseInt(val, 10) : val;
      }).describe("Tiempo en milisegundos que tomó la tarea (mínimo 1000ms)")
    },
    async ({ taskId, timeSpent }) => {
      const time = timeSpent;
      const start = Date.now() - time;
      const url = `${CLICKUP_API_BASE}/task/${taskId}/time`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { ...getClickupHeaders(), 'content-type': 'application/json' },
          body: JSON.stringify({ start: start, end: Date.now(), time: time })
        });
        if (!response.ok) {
          const errorText = await response.text();
          return {
            content: [
              {
                type: "text",
                text: `❌ Error al registrar el tiempo en la tarea ${taskId}: ${response.status} - ${errorText}`
              }
            ]
          };
        }
        const data = await response.json();
        const timeInHours = (time / (1000 * 60 * 60)).toFixed(2);
        return {
          content: [
            {
              type: "text",
              text: `✅ Tiempo registrado correctamente en la tarea ${taskId}:\n- Duración: ${timeInHours} horas (${time}ms)\n- Datos: ${JSON.stringify(data, null, 2)}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error de red o inesperado al registrar tiempo: ${(error as Error).message || error}`
            }
          ]
        };
      }
    },
  );
} 