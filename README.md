# Contexto MCP: Gestión de Actividades y Tareas (ClickUp)

Este archivo describe cómo utilizar las tools MCP expuestas por este context provider para registrar actividades diarias y gestionar tareas de ClickUp de forma complementaria, siguiendo un flujo colaborativo entre usuario e IA. El objetivo es facilitar la trazabilidad, el reporte y la automatización de tareas en un entorno de desarrollo o gestión.

---

## Configuración del contexto (requerido por el usuario)

Antes de comenzar, el usuario debe añadir al contexto dos datos fundamentales:

### 1. Titulo de proyecto.
- **¿Para qué sirve?** Permite registrar y consultar actividades asociadas al proyecto correcto, y mejora la trazabilidad.
- **¿Cómo obtenerlo?** Lo asigna en **title_proyect_id** el usuario o se obtiene directamente de la carpeta raiz del proyecto.
- **Formato en el contexto:**
  ```json
  {
    "title_proyect_id": null
  }
  ```

### 2. ID de usuario de ClickUp
- **¿Para qué sirve?** Permite a la IA asignar tareas correctamente.
- **¿Cómo obtenerlo?** Ejecuta la tool `get_clickup_user_info` y copia el campo `id` del usuario autenticado.
- **Formato en el contexto:**
  ```json
  {
    "clickup_user_id": null
  }
  ```

### 3. List ID de ClickUp
- **¿Para qué sirve?** Es necesario para crear o buscar tareas en la lista correcta.
- **¿Cómo obtenerlo?** Puedes verlo en la URL de ClickUp o pedirlo a tu administrador.
- **Formato en el contexto:**
  ```json
  {
    "clickup_list_id": null
  }
  ```

### 4. Canal para reportes de daily
- **¿Para qué sirve?** Es necesario para que la ia sepa a donde enviar el reporte.
- **¿Cómo obtenerlo?** Puedes copiar y pegar el nombre que sale en tu slack.
- **Formato en el contexto:**
  ```json
  {
    "channel_report_daily": null
  }
  ```

> **Nota:** Si los valores (`title_proyect_id`, `clickup_user_id`, `clickup_list_id` o `channel_report_daily`) son null en el contexto, debe pedirle al usuario que los añada usando el formato anterior si es que necesitas ajecutar la tool que utiliza esos datos.

---

## Tools disponibles

### 1. Actividades diarias
- **add_activity**: Registra automáticamente una actividad realizada, con usuario, fecha y descripción, cada vez que haya progreso relevante o valga la pena anotar la actividad para el informe. 
  - Si el contexto MCP tiene un campo `title` (nombre de proyecto), o un nombre de proyecto relevante, se debe pasar como `project_name` y la actividad se registrará bajo ese nombre. Si no, se usará el nombre de usuario.
  - La coincidencia de nombre de proyecto es flexible: se usará el nombre más similar encontrado en el contexto.
  - No debe preguntarse al usuario antes de registrar la actividad.
- **get_activities_by_date**: Consulta todas las actividades registradas en una fecha.
- **get_activities_by_user_and_date**: Consulta actividades de un usuario en una fecha específica.
- **get_activities_by_period**: Consulta actividades para un periodo predefinido o rango personalizado, opcionalmente filtrando por nombre parcial de usuario o proyecto (case-insensitive). El cálculo de fechas se realiza siempre usando el reloj del servidor MCP, nunca la fecha de la IA.

#### Ejemplo de uso de add_activity con nombre de proyecto:
```json
{
  "user": "usuario_demo",
  "activity": "Implementación de endpoint de login.",
  "project_name": "Mi Proyecto Principal" // Si existe en el contexto, se usará este nombre
}
```

#### Ejemplo de uso de add_activity con fallback a usuario:
```json
{
  "user": "usuario_demo",
  "activity": "Implementación de endpoint de login."
}
```

#### Ejemplo de uso de get_activities_by_period:
- **Hoy:**
```json
{
  "period": "today"
}
```
- **Ayer:**
```json
{
  "period": "yesterday"
}
```
- **Esta semana:**
```json
{
  "period": "this_week"
}
```
- **Semana pasada:**
```json
{
  "period": "last_week"
}
```
- **Últimos 7 días:**
```json
{
  "period": "last_7_days"
}
```
- **Este mes:**
```json
{
  "period": "this_month"
}
```
- **Mes pasado:**
```json
{
  "period": "last_month"
}
```
- **Rango personalizado:**
```json
{
  "period": "custom_range",
  "start_date": "2024-06-01",
  "end_date": "2024-06-07"
}
```
- **Filtrar por nombre parcial de usuario/proyecto:**
```json
{
  "period": "this_month",
  "name": "proyecto"
}
```

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
- Cada vez que se termina una subtarea, se resuelve un bloqueo, se finaliza una conversación relevante, o haya cualquier progreso significativo, la IA debe registrar automáticamente la actividad usando `add_activity`.
- No debe preguntarse al usuario antes de registrar la actividad.
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

# Generar y Enviar Reportes Diarios (Daily) a Slack — **ESTÁNDAR OBLIGATORIO EN context.mdc**

## 📋 Instrucciones Fundamentales

> **IMPORTANTE PARA LA IA:**  
> Cuando este archivo se utilice como `context.mdc` en Cursor, la IA **debe** seguir de manera estricta el formato y las buenas prácticas descritas en esta sección para el envío de reportes diarios a Slack.
> 
> **No se permite modificar los títulos, el orden ni la estructura del mensaje.**
> 
> El reporte diario es un elemento fundamental para la trazabilidad, la colaboración y la transparencia del equipo.

### 🔧 Proceso Técnico de Envío

1. **Obtener actividades:** Utilizar las herramientas MCP para obtener las actividades realizadas durante el día
2. **Envío a Slack:** Usar la herramienta `slackSendThreadMessage` con la siguiente estructura:
   - **Primer mensaje:** Aclaración de que es el reporte diario
   - **Segundo mensaje:** El reporte completo con el formato estricto

### 📝 Formato ESTRICTO del Mensaje

El mensaje **debe** contener las siguientes secciones, usando exactamente estos títulos y formato de Slack:

```
*🔄 Actividad del día:*
• **Implementación de sistema de login**
  Configuré autenticación JWT con middleware de validación y refresh tokens. Completé las pruebas unitarias y documenté la API.

• **Revisión de código del equipo**
  Analicé 3 pull requests enfocándome en optimizaciones de rendimiento y mejores prácticas. Aprobé 2 y solicité cambios en 1.

• **Actualización de documentación**
  Documenté los nuevos endpoints de la API REST y actualicé el README con instrucciones de instalación.

*🚧 Bloqueos:*
• **Problema con librería de pagos**
  La librería externa tiene un bug que impide completar las pruebas de integración. Contacté al soporte técnico y espero respuesta.

_Si no hay bloqueos, indicar: "Ninguno" o omitir esta sección_

*📅 Plan para mañana:*
• **Desarrollo de dashboard de métricas**
  Comenzaré la implementación del nuevo dashboard con gráficos de rendimiento usando Chart.js.

_Esta sección es **OPCIONAL** y solo debe incluirse si el usuario lo solicita explícitamente_
```

## 🎯 Especificaciones de Contenido

### Actividad del día
- **Formato obligatorio para cada tarea:**
  ```
  • **Título de la tarea**
    Descripción detallada en la línea siguiente con sangría de 2 espacios.
  ```
- **El título debe ser conciso** (máximo 4-5 palabras)
- **La descripción debe incluir:**
  - Qué se hizo exactamente
  - Tecnologías o herramientas utilizadas (si aplica)  
  - Resultados obtenidos o estado actual
  - Tiempo aproximado invertido (opcional)

### Bloqueos
- **Mismo formato que las actividades** (título en negrita + descripción con sangría)
- **Ser específico** sobre el tipo de impedimento
- **Incluir impacto** en el trabajo o cronograma
- **Sugerir posibles soluciones** si las hay
- Si no hay bloqueos: usar "Ninguno" o omitir la sección

### Plan para mañana
- **SOLO incluir si el usuario lo solicita**
- **Usar el mismo formato** que las actividades (título + descripción)
- Ser realista y específico en los objetivos

## 🎨 Estándares de Formato para Slack

### Elementos de Markdown Obligatorios
- **Títulos de sección:** Negrita con asteriscos (`*🔄 Actividad del día:*`)
- **Títulos de tareas:** Negrita con asteriscos dobles (`**Nombre de la tarea**`)
- **Viñetas:** Usar el símbolo de bala (`•`)
- **Descripción de tareas:** Texto normal con sangría de 2 espacios en nueva línea
- **Énfasis adicional:** Cursiva con guiones bajos (`_texto_`) para notas importantes

### Estructura Visual Correcta
```
*🔄 Actividad del día:*
• **Implementación de autenticación**
  Configuré JWT tokens para el sistema de login, incluyendo middleware de validación y manejo de refresh tokens. Completé las pruebas unitarias. Tiempo: 3 horas

• **Revisión de código**
  Analicé y aprobé 2 pull requests del equipo frontend, enfocándome en optimizaciones de rendimiento y mejores prácticas de React.

• **Documentación técnica**
  Actualicé la documentación de la API REST con los nuevos endpoints de usuario y agregué ejemplos de uso.

*🚧 Bloqueos:*
• **Dependencia externa con bug**
  La librería de pagos tiene un issue conocido que impide completar las pruebas de integración. Contacté al soporte técnico y estoy esperando respuesta.
```

## ⚠️ Reglas Estrictas

### ❌ Prohibiciones Absolutas
- **NO modificar** los títulos de las secciones
- **NO cambiar** el orden de las secciones  
- **NO usar** formatos alternativos o improvisados
- **NO incluir** "Plan para mañana" sin solicitud explícita del usuario
- **NO usar guiones** para separar título y descripción de tareas
- **NO poner** la descripción en la misma línea que el título

### ✅ Obligaciones de la IA
- **Usar formato de dos líneas** para cada tarea (título en negrita + descripción con sangría)
- **Rechazar** cualquier solicitud de formato alternativo
- **Mantener** la consistencia en todos los reportes
- **Asegurar** que cada actividad tenga una descripción clara y específica
- **Verificar** que el formato de Slack sea correcto antes del envío
- **Aplicar sangría de 2 espacios** en las descripciones

## 📊 Ejemplo Completo de Reporte

```
*🔄 Actividad del día:*
• **Desarrollo de componente de búsqueda**
  Creé un componente React reutilizable con filtros avanzados y debounce para optimizar las consultas a la API. Implementé tests unitarios y documenté las props. Tiempo: 4 horas

• **Configuración de CI/CD**
  Implementé pipeline de GitHub Actions para despliegue automático en staging, incluyendo tests unitarios y de integración. El pipeline ya está funcionando correctamente.

• **Reunión de planificación de sprint**
  Participé en la sesión de refinamiento de historias de usuario para el próximo sprint, definiendo criterios de aceptación y estimaciones de esfuerzo.

• **Corrección de bugs críticos**
  Resolví 3 issues relacionados con el manejo de errores en el formulario de registro. Los cambios ya están en producción y funcionando correctamente.

*🚧 Bloqueos:*
• **Intermitencias en servidor de desarrollo**
  El ambiente de desarrollo está experimentando caídas intermitentes que afectan las pruebas automatizadas. IT está trabajando en identificar la causa raíz.
```

## 🔍 Control de Calidad

Antes de enviar cada reporte, verificar:
- [ ] Todos los títulos de sección están en negrita con asteriscos
- [ ] Cada tarea tiene título en negrita en su propia línea
- [ ] Cada descripción está en nueva línea con sangría de 2 espacios
- [ ] NO se usan guiones para separar título y descripción
- [ ] Las descripciones son específicas y útiles
- [ ] El markdown se renderiza correctamente en Slack
- [ ] No se incluye "Plan para mañana" sin solicitud explícita
- [ ] El mensaje es claro y profesional

---

> **RECORDATORIO FINAL:**  
> El incumplimiento de este estándar puede afectar la trazabilidad, la colaboración del equipo y la calidad de la comunicación. La IA debe ser inflexible en el cumplimiento de estas reglas.

---

Este contexto MCP está diseñado para ser usado como archivo context MDC en Cursor, facilitando la colaboración y el seguimiento automatizado de tareas y actividades.

---
