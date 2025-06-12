import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import configProyect from "./configProyect/index.js";
import clickup from "./clickup/index.js";
import activities from "./activities/index.js";
import clockify from "./clockify/index.js";
import slack from "./slack/index.js";

export default function registerTools(server: McpServer) {
    configProyect(server);
    clickup(server);
    activities(server);
    clockify(server);
    slack(server);
}