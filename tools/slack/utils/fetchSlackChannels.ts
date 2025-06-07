import dotenv from 'dotenv';
dotenv.config();

const SLACK_TOKEN = process.env.SLACK_TOKEN;
const SLACK_API_URL = 'https://slack.com/api';

if (!SLACK_TOKEN) {
  throw new Error('SLACK_TOKEN is not defined in .env');
}

export async function fetchSlackChannels() {
  const response = await fetch(`${SLACK_API_URL}/conversations.list`, {
    headers: {
      'Authorization': `Bearer ${SLACK_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (!data.ok) throw new Error(`Slack API error: ${data.error}`);
  return data.channels;
} 