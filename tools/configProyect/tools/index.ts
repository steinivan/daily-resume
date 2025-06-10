import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerConfigProyectTool } from "./registerConfigProyectTool.js";

export default function registerConfigProyectTools(server: McpServer) {
    registerConfigProyectTool(server);
}