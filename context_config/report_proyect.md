Titulo de proyecto.
- **¿Para qué sirve?** Permite registrar y consultar actividades asociadas al proyecto correcto, y mejora la trazabilidad.
- **¿Cómo obtenerlo?** Lo asigna en **title_proyect_id** el usuario o se obtiene directamente de la carpeta raiz del proyecto.
- **Formato en el contexto:**
  ```json
  {
    "title_proyect_id": null
  }
  ```


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
