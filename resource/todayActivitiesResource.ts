import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
  ListResourcesRequestSchema, 
  ReadResourceRequestSchema 
} from "@modelcontextprotocol/sdk/types.js";
import { SqliteStorageProvider } from "../sqliteStorageProvider.js";

export function registerTodayActivitiesResource(server: McpServer) {
  // Handler para listar recursos
  // server.server.setRequestHandler(ListResourcesRequestSchema, async () => {
  //   return {
  //     resources: [
  //       {
  //         uri: "activities://today",
  //         name: "Today's Activities",
  //         description: "Devuelve las actividades registradas para el día de hoy.",
  //         mimeType: "application/json"
  //       }
  //     ]
  //   };
  // });

  // // Handler para leer recursos específicos
  // server.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {    
  //   if (request.params.uri === "activities://today") {
  //     try {
  //       const storage = new SqliteStorageProvider();
  //       const today = new Date().toISOString().slice(0, 10);
  //       const activities = storage.getActivitiesByDate(today);
        
  //       return {
  //         contents: [
  //           {
  //             uri: "activities://today",
  //             text: JSON.stringify(activities, null, 2),
  //             mimeType: "application/json"
  //           }
  //         ]
  //       };
  //     } catch (error) {
  //       throw error;
  //     }
  //   }
    
  //   throw new Error(`Recurso no encontrado: ${request.params.uri}`);
  // });
}