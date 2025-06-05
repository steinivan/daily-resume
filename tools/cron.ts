import fs from "fs";
import path from "path";
import cron, { ScheduledTask } from "node-cron";
import { generateReport } from "../aiProcessor";
import { sendThreadMessage } from "./slackTool.js";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const CRON_TASKS_PATH = path.resolve(process.cwd(), "cronTasks.json");

type CronTask = {
  id: string;
  cronTime: string;
  channel: string;
  prompt: string;
};

let tasks: CronTask[] = [];
let scheduledJobs: { [id: string]: ScheduledTask } = {};

function loadTasks() {
  if (fs.existsSync(CRON_TASKS_PATH)) {
    tasks = JSON.parse(fs.readFileSync(CRON_TASKS_PATH, "utf-8"));
  }
}

function saveTasks() {
  fs.writeFileSync(CRON_TASKS_PATH, JSON.stringify(tasks, null, 2));
}

function scheduleTask(task: CronTask) {
  if (scheduledJobs[task.id]) {
    scheduledJobs[task.id].stop();
  }
  scheduledJobs[task.id] = cron.schedule(task.cronTime, async () => {
    try {
      const report = await generateReport(task.prompt);
      if (!report) {
        console.log(`[CRON] No report generated for ${task.channel} at ${new Date().toISOString()}`);
        return;
      }
      await sendThreadMessage(
        task.channel,
        "Reporte automático generado por MCP:",
        report
      );
      console.log(`[CRON] Report sent to ${task.channel} at ${new Date().toISOString()}`);
    } catch (err) {
      console.error(`[CRON] Error sending report:`, err);
    }
  });
}

export function initCronTool() {
  loadTasks();
  tasks.forEach(scheduleTask);
}

// TOOL: Crear un cron job
export function tool_addCronTask({ cronTime, channel, prompt }: { cronTime: string, channel: string, prompt: string }) {
  const id = `cron_${Date.now()}`;
  const task: CronTask = { id, cronTime, channel, prompt };
  tasks.push(task);
  saveTasks();
  scheduleTask(task);
  return { id, message: "Cron task created successfully." };
}

// TOOL: Listar cron jobs
export function tool_listCronTasks() {
  return tasks;
}

// TOOL: Eliminar un cron job
export function tool_removeCronTask({ id }: { id: string }) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return { success: false, message: "Task not found." };
  tasks.splice(idx, 1);
  saveTasks();
  if (scheduledJobs[id]) {
    scheduledJobs[id].stop();
    delete scheduledJobs[id];
  }
  return { success: true, message: "Task removed." };
}

export function registerCronTools(server: McpServer) {
  server.tool(
    "addCronTask",
    "Programa un reporte automático a Slack usando IA. Recibe expresión cron, canal y prompt.",
    {
      cronTime: z.string().describe("Expresión cron (ej: '0 9 * * *' para cada día a las 9am)"),
      channel: z.string().describe("Nombre del canal de Slack"),
      prompt: z.string().describe("Prompt para la IA que generará el reporte"),
    },
    async ({ cronTime, channel, prompt }) => {
      const result = tool_addCronTask({ cronTime, channel, prompt });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "listCronTasks",
    "Lista los cron jobs programados para reportes automáticos.",
    {},
    async () => {
      const result = tool_listCronTasks();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "removeCronTask",
    "Elimina un cron job programado por ID.",
    {
      id: z.string().describe("ID del cron job a eliminar"),
    },
    async ({ id }) => {
      const result = tool_removeCronTask({ id });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );
} 