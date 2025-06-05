export async function generateReport(prompt: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null; // Si no hay API key, no se usa IA
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3-8b-instant",
      messages: [
        { role: "system", content: "Eres un generador de reportes para tareas y actividades." },
        { role: "user", content: prompt }
      ],
      max_tokens: 512,
      temperature: 0.7
    })
  });
  if (!response.ok) throw new Error(`Groq API error: ${response.statusText}`);
  const data = await response.json();
  // El resultado está en data.choices[0].message.content
  return data.choices?.[0]?.message?.content || null;
} 