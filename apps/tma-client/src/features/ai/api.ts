'use client';

import { createClient } from '@/lib/supabase/client';

export interface AnalysisResult {
  evaluation: string;
  advice: string;
  suggestions: string[];
}

export async function analyzeCoordinationLogs(roomId: string): Promise<AnalysisResult> {
  const supabase = createClient();
  
  // 1. Obtener los últimos 50 mensajes de la sala de coordinación
  const { data: messages, error } = await supabase
    .from('tma_messages')
    .select(`
      content,
      sender_name,
      created_at
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(50);

  if (error || !messages || messages.length === 0) {
    throw new Error('No hay suficientes datos para el análisis.');
  }

  // 2. Formatear logs para el prompt
  const logDump = messages.map(m => `[${m.sender_name}]: ${m.content}`).join('\n');

  // 3. Prompt para Gemini
  const prompt = `
    ACT AS "SCION ANALYTICS", AN AI THAT HELPS ASASSIANS IN A DANGANRONPA-LIKE ROLEPLAY.
    CONTEXT: The characters are coordinating a murder in a secret room.
    LOGS:
    ${logDump}
    
    ANALYSIS REQUEST:
    1. Evaluate the risk of being caught.
    2. Suggest 3 specific ways to improve their alibi or confuse the investigation.
    3. Identify any weak points in their plan.
    
    RESPOND IN JSON FORMAT:
    {
      "evaluation": "string summary",
      "advice": "string general advice",
      "suggestions": ["list of items"]
    }
  `;

  // 4. Llamada a Gemini (Conceptual / Requiere API Key del usuario)
  // En este MVP devolvemos una simulación realista o instruimos cómo conectarlo.
  console.log("Analyzing logs with SCION AI...", prompt);

  // Simulación de respuesta IA (Para el demo)
  return {
    evaluation: "Riesgo Moderado. La coordinación es fluida, pero el rastro de IP puede revelar inconsistencias si no se planta una pista falsa pronto.",
    advice: "El sistema detecta una brecha en la narrativa del Lobby. Consideren usar un 'Glitch' en los sensores.",
    suggestions: [
      "Plantar evidencia de cabello (NPC) en la Capilla.",
      "Desactivar el log de movimientos durante 10 segundos antes del golpe.",
      "Asegurar que al menos dos estudiantes puedan testificar que el NPC estaba en su habitación."
    ]
  };
}
