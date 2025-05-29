# Contexto MCP: Gestión de Actividades y Tareas (ClickUp)

Este archivo describe cómo utilizar las tools MCP expuestas por este context provider para registrar actividades diarias y gestionar tareas de ClickUp de forma complementaria, siguiendo un flujo colaborativo entre usuario e IA. El objetivo es facilitar la trazabilidad, el reporte y la automatización de tareas en un entorno de desarrollo o gestión.

---

## Configuración del contexto (requerido por el usuario)

Antes de comenzar, el usuario debe añadir al contexto dos datos fundamentales:

### 1. ID de usuario de ClickUp
- **¿Para qué sirve?** Permite a la IA asignar tareas correctamente.
- **¿Cómo obtenerlo?** Ejecuta la tool `get_clickup_user_info` y copia el campo `id` del usuario autenticado.
- **Formato en el contexto:**
  ```json
  {
    "clickup_user_id": "<TU_USER_ID>"
  }
  ```

### 2. List ID de ClickUp
- **¿Para qué sirve?** Es necesario para crear o buscar tareas en la lista correcta.
- **¿Cómo obtenerlo?** Puedes verlo en la URL de ClickUp o pedirlo a tu administrador.
- **Formato en el contexto:**
  ```json
  {
    "clickup_list_id": "<TU_LIST_ID>"
  }
  ```

> **Nota:** Si la IA no encuentra estos valores en el contexto, debe pedirle al usuario que los añada usando el formato anterior.

---

## Tools disponibles

### 1. Actividades diarias
- **add_activity**: Registra una actividad realizada, con usuario, fecha y descripción.
- **get_activities_by_date**: Consulta todas las actividades registradas en una fecha.
- **get_activities_by_user_and_date**: Consulta actividades de un usuario en una fecha específica.

### 2. Gestión de tareas ClickUp
- **get_clickup_user_info**: Obtiene la información del usuario autenticado en ClickUp (incluye el ID de usuario).
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

## Buenas prácticas
- **Descripciones claras:** Las actividades deben ser precisas y útiles para informes.
- **Templates:** Nunca modificar los títulos de los templates, solo completar la información.
- **Sincronización:** Mantener la información de ClickUp y el registro de actividades alineados.
- **Cierre explícito:** No cerrar tareas hasta que el usuario lo indique.
- **Registro de tiempo:** Siempre preguntar al usuario el tiempo real invertido antes de registrar el tiempo en la tarea.
- **Contexto completo:** Si la IA no tiene el `clickup_user_id` o el `clickup_list_id`, debe pedirle al usuario que los añada al contexto usando el formato indicado arriba.

---

Este contexto MCP está diseñado para ser usado como archivo context MDC en Cursor, facilitando la colaboración y el seguimiento automatizado de tareas y actividades. 