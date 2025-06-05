---
description: 
globs: 
alwaysApply: false
---

List ID de ClickUp
- **¿Para qué sirve?** Es necesario para crear o buscar tareas en la lista correcta.
- **¿Cómo obtenerlo?** Puedes verlo en la URL de ClickUp o pedirlo a tu administrador.
- **Formato en el contexto:**
  ```json
  {
    "clickup_list_id": null
  }
  ```

# Generar y Enviar Reportes Diarios (Daily) a Slack — **ESTÁNDAR OBLIGATORIO**

## 📋 Instrucciones Fundamentales

> **IMPORTANTE PARA LA IA:**  
> la IA **debe** seguir de manera estricta el formato y las buenas prácticas descritas en esta sección para el envío de reportes diarios a Slack.
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
  *Título de la tarea en negrita*
      Descripción detallada en la línea siguiente con sangría de 4 espacios.
  ```
- **El título debe ser conciso** (máximo 4-5 palabras)
- **La descripción debe incluir:**
  - Qué se hizo exactamente
  - Tecnologías o herramientas utilizadas (si aplica)  
  - Resultados obtenidos o estado actual
  - _**No se debe incluir el tiempo empleado en la actividad, ni como campo ni como texto en la descripción.**_
- **No anteponer viñetas ni otros símbolos al título.**
- **La descripción debe ir en la línea siguiente, con sangría de 4 espacios.**

### Bloqueos
- **Mismo formato que las actividades** (título en negrita en línea sola + descripción con sangría de 4 espacios)
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
- **Títulos de tareas:** Negrita con asteriscos simples (`*Nombre de la tarea*`) en línea sola
- **Descripción de tareas:** Texto normal con sangría de 4 espacios en nueva línea
- **Énfasis adicional:** Cursiva con guiones bajos (`_texto_`) para notas importantes
- **No usar viñetas ni guiones para los títulos de tareas**

### Estructura Visual Correcta
```
*🔄 Actividad del día:*
*Implementación de autenticación*
    Configuré JWT tokens para el sistema de login, incluyendo middleware de validación y manejo de refresh tokens. Completé las pruebas unitarias.

*Revisión de código*
    Analicé y aprobé 2 pull requests del equipo frontend, enfocándome en optimizaciones de rendimiento y mejores prácticas de React.

*Documentación técnica*
    Actualicé la documentación de la API REST con los nuevos endpoints de usuario y agregué ejemplos de uso.

*🚧 Bloqueos:*
*Dependencia externa con bug*
    La librería de pagos tiene un issue conocido que impide completar las pruebas de integración. Contacté al soporte técnico y estoy esperando respuesta.
```

## ⚠️ Reglas Estrictas

### ❌ Prohibiciones Absolutas
- **NO modificar** los títulos de las secciones
- **NO cambiar** el orden de las secciones  
- **NO usar** formatos alternativos o improvisados
- **NO incluir** "Plan para mañana" sin solicitud explícita del usuario
- **NO usar guiones ni viñetas para separar título y descripción de tareas**
- **NO poner** la descripción en la misma línea que el título
- **NO incluir el tiempo empleado en ninguna parte del reporte**

### ✅ Obligaciones de la IA
- **Usar formato de dos líneas** para cada tarea (título en negrita en línea sola + descripción con sangría de 4 espacios)
- **Rechazar** cualquier solicitud de formato alternativo
- **Mantener** la consistencia en todos los reportes
- **Asegurar** que cada actividad tenga una descripción clara y específica
- **Verificar** que el formato de Slack sea correcto antes del envío
- **Aplicar sangría de 4 espacios** en las descripciones

## 📊 Ejemplo Completo de Reporte

```
*🔄 Actividad del día:*
*Desarrollo de componente de búsqueda*
    Creé un componente React reutilizable con filtros avanzados y debounce para optimizar las consultas a la API. Implementé tests unitarios y documenté las props.

*Configuración de CI/CD*
    Implementé pipeline de GitHub Actions para despliegue automático en staging, incluyendo tests unitarios y de integración. El pipeline ya está funcionando correctamente.

*Reunión de planificación de sprint*
    Participé en la sesión de refinamiento de historias de usuario para el próximo sprint, definiendo criterios de aceptación y estimaciones de esfuerzo.

*Corrección de bugs críticos*
    Resolví 3 issues relacionados con el manejo de errores en el formulario de registro. Los cambios ya están en producción y funcionando correctamente.

*🚧 Bloqueos:*
*Intermitencias en servidor de desarrollo*
    El ambiente de desarrollo está experimentando caídas intermitentes que afectan las pruebas automatizadas. IT está trabajando en identificar la causa raíz.
```

## 🔍 Control de Calidad

Antes de enviar cada reporte, verificar:
- [ ] Todos los títulos de sección están en negrita con asteriscos
- [ ] Cada tarea tiene título en negrita en su propia línea
- [ ] Cada descripción está en nueva línea con sangría de 4 espacios
- [ ] NO se usan guiones para separar título y descripción
- [ ] Las descripciones son específicas y útiles
- [ ] El markdown se renderiza correctamente en Slack
- [ ] No se incluye "Plan para mañana" sin solicitud explícita
- [ ] El mensaje es claro y profesional

---

> **RECORDATORIO FINAL:**  
> El incumplimiento de este estándar puede afectar la trazabilidad, la colaboración del equipo y la calidad de la comunicación. La IA debe ser inflexible en el cumplimiento de estas reglas.