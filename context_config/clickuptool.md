## Recomendacion de uso de las tools de clickup.

ID de usuario de ClickUp
- **¿Para qué sirve?** Permite a la IA asignar tareas correctamente.
- **¿Cómo obtenerlo?** Ejecuta la tool `get_clickup_user_info` y copia el campo `id` del usuario autenticado.
- **Formato en el contexto:**
  ```json
  {
    "clickup_user_id": null
  }

  List ID de ClickUp
- **¿Para qué sirve?** Es necesario para crear o buscar tareas en la lista correcta.
- **¿Cómo obtenerlo?** Puedes verlo en la URL de ClickUp o pedirlo a tu administrador.
- **Formato en el contexto:**
  ```json
  {
    "clickup_list_id": null
  }
  ```

### 1. Inicio de una tarea
- **Opción A:** Si la tarea ya existe en ClickUp, la IA debe buscarla usando `get_task` (por ID) o `get_tasks` (por nombre).
- **Opción B:** Si la tarea no existe, la IA debe preguntar al usuario si desea crearla. Si el usuario acepta, usar `create_task` con la información proporcionada.
- **Template:** Si la tarea tiene un template (ejemplo: campos como Title, Testing, etc.), la IA debe respetar los títulos y completar solo la información correspondiente, sin modificar los encabezados del template.
- **Estado:** Una vez creada o localizada la tarea, moverla a "in progress" si no está ya en ese estado.

### 2. Modificación de tareas y descripciones
- Antes de modificar la descripción de una tarea, la IA debe obtener la descripción actual.
- Si la descripción contiene un template o títulos/secciones (por ejemplo: "Objetivo", "Testing", etc.), la IA debe:
  - Respetar todos los títulos y encabezados existentes.
  - Completar o expandir la información bajo cada sección relevante, agregando lo nuevo sin eliminar ni sobrescribir los títulos ni el contenido útil ya presente.
  - Si falta información bajo algún título, la IA debe agregarla en el lugar correspondiente.
  - Si se requiere agregar una nueva sección, debe hacerlo siguiendo el formato de los títulos existentes.
- Ejemplo: Si la descripción ya tiene:
  ```
  Objetivo:
  - Describir el objetivo aquí

  Testing:
  - Pasos para testear
  ```
  Y la IA debe agregar información sobre el objetivo y el testing, debe completar cada sección con la información nueva, sin borrar los títulos ni el contenido útil ya presente.
- Si la tarea NO tiene un template ni títulos/secciones, la IA debe crear la descripción siguiendo este formato estándar:
  ```
  Descripción:
  - Explicación general de la tarea

  Objetivo:
  - Qué se busca lograr con la tarea

  Pruebas:
  - Cómo debe testearse lo realizado
  ```