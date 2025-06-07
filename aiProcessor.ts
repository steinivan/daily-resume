export async function generateReport(prompt: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: prompt }] }
      ]
    })
  });
  if (!response.ok) throw new Error(`Google Gemini API error: ${response.statusText}`);
  const data = await response.json();
  // El texto generado está en data.candidates[0].content.parts[0].text
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
} 