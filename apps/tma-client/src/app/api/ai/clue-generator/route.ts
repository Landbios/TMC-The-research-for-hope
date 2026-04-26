import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { logDump } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
       return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      ACT AS "SCION ANALYTICS", AN AI THAT HELPS ASSASSINS IN A DANGANRONPA-LIKE ROLEPLAY.
      CONTEXT: The characters are coordinating a murder in a secret room.
      
      LOGS OF THE PLANNING PHASE:
      ${logDump}
      
      ANALYSIS REQUEST:
      1. Evaluate the risk of being caught based on the conversation.
      2. Provide general advice.
      3. Suggest 3 physical clues (EVIDENCES) to be placed in the game world to support this plan or misdirect others.
      
      RESPOND IN JSON FORMAT:
      {
        "evaluation": "string summary",
        "advice": "string general advice",
        "suggestedClues": [
          {
            "title": "NOMBRE_PISTA",
            "description_brief": "Resumen muy breve (1 frase)",
            "description_full": "Explicación detallada de lo que SCION ha detectado o plantado",
            "is_fake": boolean
          }
        ]
      }

      GENERATION RULES:
      1. Clues MUST be based DIRECTLY on what players discussed in the logs.
      2. At least one of the 3 clues MUST be fake (is_fake: true) to create confusion.
      3. The 'description_full' must sound scientific, cold, and analytical (Danganronpa/SCION style).
      4. Language: SPANISH.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini Clue Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
