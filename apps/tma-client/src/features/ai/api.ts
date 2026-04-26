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

  // 3. Llamada real a Gemini a través de nuestra API route
  try {
    const response = await fetch('/api/ai/clue-generator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logDump })
    });
    
    if (!response.ok) {
      throw new Error('FALLO_API_SCION');
    }

    const data = await response.json();
    return data as AnalysisResult;
  } catch (err) {
    console.error("Error al analizar con SCION:", err);
    throw new Error('ERROR_DE_COMUNICACIÓN_CON_SCION');
  }
}
