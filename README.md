# MCP: Gestión de Actividades, Tareas y Reportes Automáticos

Herramienta para gestionar tareas en ClickUp, registrar actividades y enviar reportes automáticos a Slack, con soporte flexible para IA local o remota para la generación de reportes.

---

## Instalación

```bash
npm install
```

---

## Configuración de IA para generación de reportes

Toda la configuración del backend de IA se realiza **exclusivamente mediante variables de entorno**. No es necesario ni posible editar archivos de configuración internos.

### Ejemplo para Hugging Face

Define las siguientes variables de entorno antes de ejecutar el MCP:

```bash
export AI_BACKEND=huggingface
export MODEL_URL=https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf
export HF_TOKEN=tu_token_de_huggingface
```

- `AI_BACKEND`: (opcional, por defecto `huggingface`) Tipo de backend de IA a usar.
- `MODEL_URL`: URL del modelo a usar (obligatorio para Hugging Face).
- `HF_TOKEN`: Token de autenticación de Hugging Face.

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

## Extensión y soporte para otros backends

Puedes agregar soporte para otros backends de IA (locales o remotos) editando `aiProcessor.ts` y ampliando la lógica para leer la configuración desde variables de entorno.

---

## Notas adicionales

- El sistema es modular y seguro: toda la configuración se realiza por variables de entorno.
- El usuario final no puede modificar archivos internos ni el código fuente.
- El resto de la funcionalidad (gestión de tareas, actividades y reportes a Slack) se mantiene igual y puede integrarse con la generación automática de reportes usando IA.
