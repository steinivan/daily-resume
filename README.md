# MCP: Gestión de Actividades, Tareas y Reportes Automáticos

Herramienta para gestionar tareas en ClickUp, registrar actividades y enviar reportes automáticos a Slack, con soporte flexible para IA (Google Gemini) para la generación de reportes.

---

## Instalación

```bash
npm install
```

---

## Configuración de IA para generación de reportes (Google Gemini)

Toda la configuración del backend de IA se realiza **exclusivamente mediante variables de entorno**. No es necesario ni posible editar archivos de configuración internos.

### **Obtener tu API Key de Google Gemini**

1. Ingresa a [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) con tu cuenta de Google.
2. Genera una nueva API Key si no tienes una.
3. Copia la clave y guárdala de forma segura.

### **Configura la variable de entorno**

Agrega en tu entorno o en un archivo `.env`:

```env
GOOGLE_GEMINI_API_KEY=tu_api_key_de_gemini
```

- `GOOGLE_GEMINI_API_KEY`: Tu API Key de Google Gemini obtenida en el paso anterior.

**No incluyas tu token en el código ni en el repositorio.**

---

## Uso de la función de generación de reportes

```typescript
import { generateReport } from './aiProcessor';

const prompt = "Genera un resumen de las actividades de hoy.";
const report = await generateReport(prompt);
console.log(report);
```

---

## Extensión y soporte para otros servicios

Puedes agregar soporte para otros backends de IA editando `aiProcessor.ts` y ampliando la lógica para leer la configuración desde variables de entorno.

---

## Notas adicionales

- El sistema es modular y seguro: toda la configuración se realiza por variables de entorno.
- El usuario final no puede modificar archivos internos ni el código fuente.
- El resto de la funcionalidad (gestión de tareas, actividades y reportes a Slack) se mantiene igual y puede integrarse con la generación automática de reportes usando IA.
