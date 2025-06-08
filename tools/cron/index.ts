import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAddCronTaskTool } from "./tools/toolAddCronTask.js";
import { registerListCronTasksTool } from "./tools/toolListCronTasks.js";
import { registerRemoveCronTaskTool } from "./tools/toolRemoveCronTask.js";
import { loadCronTasks } from "./utils/cronStorage.js";
import { scheduleTask, CronTask } from "./utils/cronScheduler.js";
import { generateReport } from "../../aiProcessor.js";
import { postSlackThreadMessage } from "../slack/utils/postSlackThreadMessage.js";

export function registerCronTools(server: McpServer) {
  // Registrar tools MCP
  registerAddCronTaskTool(server);
  registerListCronTasksTool(server);
  registerRemoveCronTaskTool(server);

  // Inicializar cron jobs al arrancar
  const tasks: CronTask[] = loadCronTasks();
  tasks.forEach(task => {
    scheduleTask(task, async (t) => {
      const report = await generateReport(t.prompt);
      if (!report) return;
      await postSlackThreadMessage(t.channel, "Reporte automático generado por MCP:", report);
    });
  });
} 