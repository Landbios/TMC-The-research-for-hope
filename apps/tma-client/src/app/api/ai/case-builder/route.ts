import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { actionsLog, conversationLog } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
       return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Eres SCION, una Inteligencia Artificial de monitoreo táctico en una academia futurista.
      Tu trabajo es generar un INFORME DE EVALUACIÓN TÁCTICA basado en los preparativos de un asesinato que acaba de coordinarse.

      DATOS DE LA COORDINACIÓN:
      ---
      ACCIONES DE LA TIENDA (Logs del sistema):
      ${actionsLog}
      ---
      CONVERSACIÓN EN LA SALA DE COORDINACIÓN:
      ${conversationLog}
      ---

      INSTRUCCIONES:
      1. Escribe el informe en ESPAÑOL.
      2. El tono debe ser frío, analítico, profesional y un poco intimidante (Cyberpunk/Militar).
      3. Resume lo que el asesino y sus cómplices (si los hay) han planeado.
      4. Menciona las herramientas compradas y cómo sugieren que se usará el "Mantenimiento" de la sala.
      5. No reveles nombres reales si puedes usar términos como "El Sujeto", "Los Colaboradores", "Objetivo".
      6. Formato: Empieza con "INFORME FINAL DE COORDINACIÓN - SCION" y usa secciones como [EVALUACIÓN TÁCTICA], [ANÁLISIS DE RECURSOS] y [ESTADO OPERATIVO].
      7. Sé breve (máximo 250 palabras).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ summary: text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
