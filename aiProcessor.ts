import { generateGeminiResponse } from "./tools/google_gemini/index.js";

export interface ProcessableData {
  tasks?: any[];
  metrics?: any;
  context?: any;
  [key: string]: any;
}

export async function generateReport(prompt: string, data: ProcessableData): Promise<string | null> {
  try {
    // Preparar el contexto para la IA
    const context = {
      timestamp: new Date().toISOString(),
      data: data,
      instructions: prompt
    };

    // Generar el prompt completo
    const fullPrompt = `
Contexto:
${JSON.stringify(context, null, 2)}

Instrucciones:
${prompt}

Por favor, genera un reporte basado en el contexto y las instrucciones proporcionadas.
El reporte debe ser conciso, estructurado y fácil de entender.
`;

    // Obtener respuesta de Gemini
    const response = await generateGeminiResponse(fullPrompt);
    if (!response) {
      throw new Error("No se pudo generar respuesta de la IA");
    }

    return response;
  } catch (error) {
    console.error("Error generando reporte:", error);
    return null;
  }
} 