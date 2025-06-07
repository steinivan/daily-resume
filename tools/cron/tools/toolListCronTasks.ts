import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadCronTasks } from "../utils/cronStorage.js";

export function registerListCronTasksTool(server: McpServer) {
  server.tool(
    "listCronTasks",
    "Lista los cron jobs programados para reportes automáticos.",
    {},
    async () => {
      const tasks = loadCronTasks();
      return { content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }] };
    }
  );
} 