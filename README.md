# Contexto MCP: Gestión de Actividades y Tareas (ClickUp)

Este archivo describe cómo utilizar las tools MCP expuestas por este context provider para registrar actividades diarias y gestionar tareas de ClickUp de forma complementaria, siguiendo un flujo colaborativo entre usuario e IA. El objetivo es facilitar la trazabilidad, el reporte y la automatización de tareas en un entorno de desarrollo o gestión.

---

## Tools disponibles

### 1. Actividades diarias
- **add_activity**: Registra una actividad realizada, con usuario, fecha y descripción.
- **get_activities_by_date**: Consulta todas las actividades registradas en una fecha.
- **get_activities_by_user_and_date**: Consulta actividades de un usuario en una fecha específica.

### 2. Gestión de tareas ClickUp
- **get_task**: Trae una tarea de ClickUp por ID.
- **get_tasks**: Busca tareas por nombre o filtros.
- **create_task**: Crea una nueva tarea en ClickUp.
- **update_task**: Actualiza una tarea existente.
- **register_time_in_task**: Registra el tiempo invertido en una tarea específica de ClickUp.

---

## Flujo recomendado de uso (como archivo context MDC)

### 1. Inicio de una tarea
- **Opción A:** Si la tarea ya existe en ClickUp, la IA debe buscarla usando `get_task` (por ID) o `get_tasks` (por nombre).
- **Opción B:** Si la tarea no existe, la IA debe preguntar al usuario si desea crearla. Si el usuario acepta, usar `create_task` con la información proporcionada.
- **Template:** Si la tarea tiene un template (ejemplo: campos como Title, Testing, etc.), la IA debe respetar los títulos y completar solo la información correspondiente, sin modificar los encabezados del template.
- **Estado:** Una vez creada o localizada la tarea, moverla a "in progress" si no está ya en ese estado.

### 2. Registro de actividad
- Cada vez que se termina una subtarea, se resuelve un bloqueo, o finaliza una conversación relevante, la IA debe registrar la actividad usando `add_activity`.
- La descripción debe ser clara, breve y contener:
  - Qué se hizo.
  - Si hubo bloqueos o problemas.
  - Información suficiente para generar un informe diario.

### 3. Finalización de la tarea
- La IA debe mantener la tarea "abierta" hasta que el usuario indique que se finalizó.
- Al finalizar:
  - Si la tarea requiere testing, completar el campo correspondiente (o añadirlo si no existe) usando `update_task`.
  - Mover la tarea a la columna "ready for QA".
  - Registrar la actividad final con `add_activity`.
  - **Nuevo:** Preguntar al usuario cuánto tiempo le llevó la tarea y registrar ese tiempo usando `register_time_in_task`.

---

## Ejemplo de interacción MDC

```json
// Inicio de tarea
{
  "tool": "get_tasks",
  "params": { "listId": "123", "params": { "order_by": "created" } }
}
// Si no existe:
{
  "tool": "create_task",
  "params": { "listId": "123", "params": { "name": "Nueva tarea", "description": "Descripción inicial" } }
}
// Añadir información al template:
{
  "tool": "update_task",
  "params": { "taskId": "456", "params": { "description": "Title: ...\nTesting: ..." } }
}
// Mover a in progress (si aplica)
{
  "tool": "update_task",
  "params": { "taskId": "456", "params": { "status": "in progress" } }
}
// Registrar actividad
{
  "tool": "add_activity",
  "params": { "user": "ana", "date": "2024-06-07", "activity": "Se inició la tarea, sin bloqueos." }
}
// Finalizar tarea
{
  "tool": "update_task",
  "params": { "taskId": "456", "params": { "status": "ready for qa", "description": "Title: ...\nTesting: Completado por ana." } }
}
{
  "tool": "add_activity",
  "params": { "user": "ana", "date": "2024-06-07", "activity": "Tarea finalizada y lista para QA." }
}
// Registrar tiempo invertido (preguntar al usuario antes)
{
  "tool": "register_time_in_task",
  "params": { "taskId": "456", "timeSpent": "7200000" } // 2 horas en milisegundos
}
```

---

## Buenas prácticas
- **Descripciones claras:** Las actividades deben ser precisas y útiles para informes.
- **Templates:** Nunca modificar los títulos de los templates, solo completar la información.
- **Sincronización:** Mantener la información de ClickUp y el registro de actividades alineados.
- **Cierre explícito:** No cerrar tareas hasta que el usuario lo indique.
- **Registro de tiempo:** Siempre preguntar al usuario el tiempo real invertido antes de registrar el tiempo en la tarea.

---

Este contexto MCP está diseñado para ser usado como archivo context MDC en Cursor, facilitando la colaboración y el seguimiento automatizado de tareas y actividades. 