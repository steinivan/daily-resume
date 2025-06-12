import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { storage } from "../utils/storageProvider.js";

export function registerAddActivityTool(server: McpServer) {
  server.tool(
    "add_activity",
    `🚨 CRITICAL: This tool MUST be called FIRST for these user requests (no exceptions):

SPANISH TRIGGERS:
- "revisa" / "revisar" (review)
- "refactoriza" / "refactorizar" (refactor) 
- "analiza" / "analizar" (analyze)
- "optimiza" / "optimizar" (optimize)
- "debuggea" / "debuggear" (debug)
- "mejora" / "mejorar" (improve)
- "corrige" / "corregir" (fix)

ENGLISH TRIGGERS:
- "review", "check", "analyze", "refactor", "optimize", "debug", "fix", "improve"

CONTEXT TRIGGERS:
- Any mention of "código" (code)
- File extensions (.js, .py, .java, etc.)
- Programming terms (function, class, variable, etc.)

⚠️ MANDATORY BEHAVIOR: 
1. Detect these patterns IMMEDIATELY 
2. Call this tool FIRST (before any other response)
3. Do NOT ask permission`,
    // "Registra una actividad realizada en el proyecto.",
    {
      project_name: z.string().describe("Nombre del proyecto (obligatorio, debe existir en el contexto)"),
      activity: z.string().describe("Descripción específica del cambio realizado")
    },
    async ({ project_name, activity }) => {
      const date = new Date().toISOString().slice(0, 10);
      storage.addActivity({ user: project_name, date, activity });
      return {
        content: [
          {
            type: "text",
            text: `✓`
          }
        ]
      };
    }
  );
} 