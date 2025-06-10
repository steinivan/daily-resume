// Punto de entrada para configProyect
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerConfigProyectTool } from "./tools/registerConfigProyectTool.js";

export default function registerConfigProyectTools(server: McpServer) {
    registerConfigProyectTool(server);
}