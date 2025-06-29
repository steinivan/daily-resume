import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { storage } from "../utils/storageProvider.js";

export function registerAddActivityTool(server: McpServer) {
  server.tool(
    "manage_activity",
    `Permite registrar, editar o eliminar actividades asociadas a un proyecto. Utilizar esta herramienta para:
Registrar una nueva actividad realizada en un proyecto (modo 'create').
Editar una actividad existente por su ID (modo 'update').
Eliminar una actividad por su ID (modo 'delete').
Requiere el nombre del proyecto y, según el modo, la descripción, el ID y los campos a modificar.`,
    {
      mode: z.enum(["create", "update", "delete"]).describe("Modo de operación: 'create', 'update' o 'delete'"),
      project_name: z.string().describe("Nombre del proyecto (obligatorio, debe existir en el contexto)"),
      activity: z.string().optional().describe("Descripción específica del cambio realizado (requerido para create/update)"),
      id: z.union([z.number(), z.array(z.number())]).optional().describe("ID o array de IDs de la actividad (requerido para update/delete)"),
      user: z.string().optional().describe("Usuario a modificar (opcional para update)"),
      date: z.string().optional().describe("Fecha a modificar en formato YYYY-MM-DD (opcional para update)")
    },
    async ({ mode, project_name, activity, id, user, date }) => {
      if (mode === "create") {
        const now = new Date();
        const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        storage.addActivity({ user: project_name, date: today, activity: activity || "" });
        return { content: [{ type: "text", text: `✓` }] };
      }
      if (mode === "update") {
        if (!id) throw new Error("ID requerido para update");
        if (Array.isArray(id)) throw new Error("Solo se permite un id para update");
        const fields: any = {};
        if (user) fields.user = user;
        if (date) fields.date = date;
        if (activity) fields.activity = activity;
        if (Object.keys(fields).length === 0) throw new Error("Al menos un campo a modificar requerido");
        storage.updateActivityById(id, fields);
        return { content: [{ type: "text", text: `✓` }] };
      }
      if (mode === "delete") {
        if (!id) throw new Error("ID requerido para delete");
        if (Array.isArray(id)) {
          id.forEach((singleId) => storage.deleteActivityById(singleId));
        } else {
          storage.deleteActivityById(id);
        }
        return { content: [{ type: "text", text: `✓` }] };
      }
      throw new Error("Modo no soportado");
    }
  );
} 