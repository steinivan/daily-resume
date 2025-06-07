import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadCronTasks, saveCronTasks } from "../utils/cronStorage.js";
import { scheduleTask, CronTask } from "../utils/cronScheduler.js";
import { generateReport } from "../../../aiProcessor.js";
import { sendThreadMessage } from "../../../tools/slack/utils/postSlackThreadMessage.js";

export function registerAddCronTaskTool(server: McpServer) {
  server.tool(
    "addCronTask",
    "Programa un reporte automático a Slack usando IA. Recibe expresión cron, canal y prompt.",
    {
      cronTime: z.string().describe("Expresión cron (ej: '0 9 * * *' para cada día a las 9am)"),
      channel: z.string().describe("Nombre del canal de Slack"),
      prompt: z.string().describe("Prompt para la IA que generará el reporte"),
    },
    async ({ cronTime, channel, prompt }) => {
      const id = `cron_${Date.now()}`;
      const task: CronTask = { id, cronTime, channel, prompt };
      const tasks = loadCronTasks();
      tasks.push(task);
      saveCronTasks(tasks);
      scheduleTask(task, async (t) => {
        const report = await generateReport(t.prompt);
        if (!report) return;
        await sendThreadMessage(t.channel, "Reporte automático generado por MCP:", report);
      });
      return { content: [{ type: "text", text: JSON.stringify({ id, message: "Cron task created successfully." }, null, 2) }] };
    }
  );
} 