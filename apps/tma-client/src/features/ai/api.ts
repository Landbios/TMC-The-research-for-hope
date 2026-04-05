'use client';

import { createClient } from '@/lib/supabase/client';

export interface SuggestedClue {
  title: string;
  description_brief: string;
  description_full: string;
  is_fake: boolean;
}

export interface AnalysisResult {
  evaluation: string;
  advice: string;
  suggestedClues: SuggestedClue[];
}

export async function analyzeCoordinationLogs(roomId: string): Promise<AnalysisResult> {
  const supabase = createClient();
  
  // 1. Obtener los últimos 50 mensajes de la sala de coordinación
  const { data: messages, error } = await supabase
    .from('tma_messages')
    .select(`
      content,
      sender_tma_id,
      created_at
    `)
    .eq('tma_room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(50);

  if (error || !messages || messages.length === 0) {
    throw new Error('No hay suficientes datos para el análisis.');
  }

  // 2. Formatear logs para el prompt
  const logDump = messages.map(m => `[ID:${m.sender_tma_id}]: ${m.content}`).join('\n');

  // 3. Prompt para Gemini
  const prompt = `
    ACT AS "SCION ANALYTICS", AN AI THAT HELPS ASASSIANS IN A DANGANRONPA-LIKE ROLEPLAY.
    CONTEXT: The characters are coordinating a murder in a secret room.
    
    LOGS OF THE PLANNING PHASE:
    ${logDump}
    
    ANALYSIS REQUEST:
    1. Evaluate the risk of being caught based on the conversation.
    2. Provide general advice.
    3. IMPORTANT: Suggest 3 physical clues (EVIDENCES) to be placed in the game world to support this plan or misdirect others.
    
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

    REGLAS DE GENERACIÓN:
    1. Las pistas deben basarse DIRECTAMENTE en lo que el asesino y el staff han hablado en los logs.
    2. Al menos una de las 3 pistas DEBE ser falsa (is_fake: true) para sembrar confusión.
    3. La 'description_full' debe sonar científica, fría y analítica (Estilo Danganronpa/SCION).
  `;

  // 4. Llamada a Gemini (Conceptual / Simulada)
  console.log("Analyzing logs with SCION AI...", prompt);

  // Simulación de respuesta IA basada en el flujo solicitado
  return {
    evaluation: "Riesgo Moderado. El plan de usar veneno es sólido, pero la falta de rastro en la cocina puede ser sospechosa.",
    advice: "Asegúrense de que el asesino tenga una coartada sólida durante el 'Nighttime'.",
    suggestedClues: [
      {
        title: "CUCHILLO CON RESIDUO",
        description_brief: "Un cuchillo de cocina con algo pegado.",
        description_full: "Análisis SCION: El residuo no es sangre, sino lubricante industrial. Sugiere manipulación previa en la lavandería.",
        is_fake: false
      },
      {
        title: "CELULAR ENCRIPTADO",
        description_brief: "Un dispositivo bloqueado por PIN.",
        description_full: "Análisis SCION: Dispositivo perteneciente a la víctima. Contiene mensajes borrados sobre una cita en la capilla.",
        is_fake: false
      },
      {
        title: "CARTA DE DESPEDIDA",
        description_brief: "Una nota escrita a mano.",
        description_full: "Análisis SCION: La caligrafía es inconsistente con los registros de la víctima. Probabilidad de falsificación: 89%.",
        is_fake: true
      }
    ]
  };
}
