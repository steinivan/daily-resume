import dotenv from 'dotenv';
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Configurar dotenv antes de acceder a variables de entorno
dotenv.config();

const SLACK_TOKEN = process.env.SLACK_TOKEN;
const SLACK_API_URL = 'https://slack.com/api';

if (!SLACK_TOKEN) {
  throw new Error('SLACK_TOKEN is not defined in .env');
}

/**
 * Lista los canales a los que el usuario tiene acceso.
 */
export async function listChannels() {
  try {
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
  } catch (error) {
    console.error('Error in listChannels:', error);
    throw error;
  }
}

/**
 * Envía un mensaje simple a un canal por nombre.
 */
export async function sendMessage(channelName: string, text: string) {
  try {
    const channels = await listChannels();
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
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
}

/**
 * Envía un mensaje principal y responde en hilo con otro mensaje.
 */
export async function sendThreadMessage(channelName: string, parentText: string, threadText: string) {
  try {
    // Enviar mensaje principal
    const mainMsg = await sendMessage(channelName, parentText);
    const threadTs = mainMsg.ts;
    const channels = await listChannels();
    const channel = channels.find((c: any) => c.name === channelName);
    if (!channel) throw new Error(`Channel ${channelName} not found`);

    // Enviar mensaje en hilo
    const response = await fetch(`${SLACK_API_URL}/chat.postMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SLACK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: channel.id,
        text: threadText,
        thread_ts: threadTs,
        mrkdwn: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.ok) throw new Error(`Slack API error: ${data.error}`);
    return { main: mainMsg, thread: data };
  } catch (error) {
    console.error('Error in sendThreadMessage:', error);
    throw error;
  }
}

export function registerSlackTool(server: McpServer) {
  server.tool(
    "slackListChannels",
    "Lista los canales de Slack a los que el usuario tiene acceso",
    {},
    async () => {
      try {
        const channels = await listChannels();
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify(channels, null, 2) 
          }] 
        };
      } catch (error) {
        return { 
          content: [{ 
            type: "text", 
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }] 
        };
      }
    }
  );

  server.tool(
    "slackSendMessage",
    "Envía un mensaje simple a un canal de Slack por nombre",
    {
      channelName: z.string().describe("Nombre del canal de Slack"),
      text: z.string().describe("Mensaje a enviar"),
    },
    async ({ channelName, text }) => {
      try {
        const result = await sendMessage(channelName, text);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify(result, null, 2) 
          }] 
        };
      } catch (error) {
        return { 
          content: [{ 
            type: "text", 
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }] 
        };
      }
    }
  );

  server.tool(
    "slackSendThreadMessage",
    "Esto es utilizado para enviar reportes: Envía un mensaje principal aclarando la daily y responde en hilo con otro mensaje en Slack con el reporte",
    {
      channelName: z.string().describe("Nombre del canal de Slack"),
      parentText: z.string().describe("Mensaje principal"),
      threadText: z.string().describe("Mensaje en hilo"),
    },
    async ({ channelName, parentText, threadText }) => {
      try {
        const result = await sendThreadMessage(channelName, parentText, threadText);
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify(result, null, 2)
          }] 
        };
      } catch (error) {
        return { 
          content: [{ 
            type: "text", 
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }] 
        };
      }
    }
  );
}