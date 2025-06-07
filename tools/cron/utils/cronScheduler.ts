import cron, { ScheduledTask } from "node-cron";

export type CronTask = {
  id: string;
  cronTime: string;
  channel: string;
  prompt: string;
};

const scheduledJobs: { [id: string]: ScheduledTask } = {};

export function scheduleTask(task: CronTask, handler: (task: CronTask) => Promise<void>) {
  if (scheduledJobs[task.id]) {
    scheduledJobs[task.id].stop();
  }
  scheduledJobs[task.id] = cron.schedule(task.cronTime, async () => {
    await handler(task);
  });
}

export function unscheduleTask(id: string) {
  if (scheduledJobs[id]) {
    scheduledJobs[id].stop();
    delete scheduledJobs[id];
  }
}

export function rescheduleAll(tasks: CronTask[], handler: (task: CronTask) => Promise<void>) {
  Object.keys(scheduledJobs).forEach(id => unscheduleTask(id));
  tasks.forEach(task => scheduleTask(task, handler));
} 