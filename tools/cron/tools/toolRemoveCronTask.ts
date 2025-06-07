import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadCronTasks, saveCronTasks } from "../utils/cronStorage.js";
import { unscheduleTask } from "../utils/cronScheduler.js";

export function registerRemoveCronTaskTool(server: McpServer) {
  server.tool(
    "removeCronTask",
    "Elimina un cron job programado por ID.",
    {
      id: z.string().describe("ID del cron job a eliminar"),
    },
    async ({ id }) => {
      const tasks = loadCronTasks();
      const idx = tasks.findIndex((t: any) => t.id === id);
      if (idx === -1) {
        return { content: [{ type: "text", text: "Task not found." }] };
      }
      tasks.splice(idx, 1);
      saveCronTasks(tasks);
      unscheduleTask(id);
      return { content: [{ type: "text", text: JSON.stringify({ success: true, message: "Task removed." }, null, 2) }] };
    }
  );
} 