# MCP: Gestión de Tareas, Actividades, Reportes y Registro de Tiempo

Herramienta MCP para automatizar la gestión de tareas en ClickUp, registro de actividades, reportes diarios a Slack y registro de tiempos en Clockify. El usuario no interactúa con el código ni la base de datos; toda acción es gestionada por IA y herramientas internas.

---

## Variables de entorno requeridas

```
"mcpServers": {
    "daily_tasks": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-daily-tasks"
      ],
      "env": {
        "SLACK_TOKEN": "{apiKey}" // opcional,
        "CLOCKIFY_API_KEY": "{apiKey} // opcional",
        "CLICKUP_API_KEY": "{apiKey} // opcional"
      }
    }
  }
```

---

## Funcionalidades principales

- Gestión automatizada de tareas en ClickUp (creación, actualización, consulta, validación de formato y metadatos).
- Registro y consulta de actividades diarias asociadas a proyectos (persistencia en SQLite).
- Envío de reportes diarios a Slack con formato estructurado y validado.
- Registro y consulta de tiempos en Clockify (por usuario, proyecto o tarea, con filtros por fecha).


