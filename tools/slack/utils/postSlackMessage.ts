import dotenv from 'dotenv';
import { fetchSlackChannels } from "./fetchSlackChannels.js";

dotenv.config();
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const SLACK_API_URL = 'https://slack.com/api';

export async function postSlackMessage(channelName: string, text: string) {
  const channels = await fetchSlackChannels();
  const channel = channels.find((c: any) => c.name === channelName);
  if (!channel) throw new Error(`Channel ${channelName} not found`);

  const response = await fetch(`${SLACK_API_URL}/chat.postMessage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SLACK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: channel.id,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.ok) throw new Error(`Slack API error: ${data.error}`);
  return data;
} 