import fs from "fs";
import path from "path";

const CRON_TASKS_PATH = path.resolve(process.cwd(), "cronTasks.json");

export function loadCronTasks() {
  if (fs.existsSync(CRON_TASKS_PATH)) {
    return JSON.parse(fs.readFileSync(CRON_TASKS_PATH, "utf-8"));
  }
  return [];
}

export function saveCronTasks(tasks: any[]) {
  fs.writeFileSync(CRON_TASKS_PATH, JSON.stringify(tasks, null, 2));
} 