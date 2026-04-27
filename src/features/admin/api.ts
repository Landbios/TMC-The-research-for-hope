import { createClient } from '@/lib/supabase/client';

export async function getAllVolunteers() {
  const supabase = createClient();
  // Esta query asume que existe una forma de saber quién se postuló
  // Por ahora buscaremos a todos los personajes vivos
  const { data, error } = await supabase
    .from('tma_characters')
    .select('*')
    .eq('status', 'ALIVE')
    .eq('is_volunteer', true);

  if (error) return [];
  return data;
}

export async function updateEvidencePosition(evidenceId: string, x: number, y: number, z: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tma_evidences')
    .update({ pos_x: x, pos_y: y, pos_z: z })
    .eq('id', evidenceId);

  if (error) throw error;
  return data;
}

export async function createTmaEvidence(evidence: {
  room_id: string;
  title: string;
  description_brief?: string;
  description_full?: string;
  image_url?: string;
  is_fake?: boolean;
  investigation_cost?: number;
  pos_x?: number;
  pos_y?: number;
  pos_z?: number;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tma_evidences')
    .insert(evidence);

  if (error) throw error;
  return data;
}

export async function getRoomEvidences(roomId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tma_evidences')
    .select('*')
    .eq('room_id', roomId);

  if (error) return [];
  return data;
}

export async function getAllRooms() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tma_rooms')
    .select('*');

  if (error) return [];
  return data;
}

// Resetea los puntos de investigación para todos los personajes vivos
export async function resetAllInvestigationPoints() {
  const supabase = createClient();
  const { error } = await supabase
    .from('tma_characters')
    .update({ investigation_points: 7, murder_points: 7 })
 
    .eq('status', 'ALIVE');

  if (error) throw error;
}

// Activa o desactiva el poll de asesinato en el estado del juego
export async function updateAssassinPollStatus(active: boolean) {
  const supabase = createClient();
  
  // Si estamos activando el poll, reseteamos las elecciones de todos para que les aparezca el overlay
  if (active) {
    await supabase
      .from('tma_characters')
      .update({ is_volunteer: null })
      .eq('status', 'ALIVE');
  }

  const { error } = await supabase
    .from('tma_game_state')
    .update({ assassin_poll_active: active})
    .eq('id', 1)
    .select(); 

  if (error) {
    console.error("Error completo:", error);
    throw error;
  }
}

/**
 * Resetea los puntos de asesinato (MP) para todos los personajes vivos
 */
export async function resetAllMurderPoints() {
  const supabase = createClient();
  const { error } = await supabase
    .from('tma_characters')
    .update({ murder_points: 7 })
    .eq('status', 'ALIVE');

  if (error) throw error;
}

/**
 * Escoge un asesino al azar de la lista de voluntarios y lo inicializa
 */
export async function selectRandomAssassin() {
  const supabase = createClient();
  
  // 1. Obtener todos los voluntarios vivos
  const { data: volunteers, error: fetchError } = await supabase
    .from('tma_characters')
    .select('id, tma_name')
    .eq('status', 'ALIVE')
    .eq('is_volunteer', true);

  if (fetchError) throw fetchError;
  if (!volunteers || volunteers.length === 0) {
    throw new Error('No hay voluntarios disponibles.');
  }

  // 2. Seleccionar uno al azar
  const randomIndex = Math.floor(Math.random() * volunteers.length);
  const selectedAssassin = volunteers[randomIndex];

  // 3. Inicializar al asesino (is_assassin = true, murder_points = 7)
  const { error: charUpdateError } = await supabase
    .from('tma_characters')
    .update({ 
      is_assassin: true, 
      murder_points: 7,
      is_volunteer: null // Limpiar estado de voluntario
    })
    .eq('id', selectedAssassin.id);

  if (charUpdateError) throw charUpdateError;

  // 4. Desactivar el poll global
  const { error: updateError } = await supabase
    .from('tma_game_state')
    .update({ assassin_poll_active: false })
    .eq('id', 1);

  if (updateError) throw updateError;

  // 5. Asegurar que los demás voluntarios sean reseteados
  await supabase
    .from('tma_characters')
    .update({ is_volunteer: null })
    .neq('id', selectedAssassin.id)
    .not('is_volunteer', 'is', null);

  return selectedAssassin;
}

/**
 * Actualiza la fase de coordinación de una sala específica
 */
export async function updateCoordinationStage(roomId: string, stage: 'PLANNING' | 'PREPARATION' | 'EXECUTION' | 'FINISHED') {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tma_rooms')
    .update({ coordination_stage: stage })
    .eq('id', roomId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Define la sala objetivo del asesinato y la bloquea virtualmente
 */
export async function setTargetMurderRoom(coordinationRoomId: string, targetRoomId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tma_rooms')
    .update({ target_murder_room_id: targetRoomId })
    .eq('id', coordinationRoomId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createTmaRoom(room: { name: string; is_invisible?: boolean }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tma_rooms')
    .insert(room)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function ensureMurderRoom() {
  const supabase = createClient();
  
  // 1. Verificar si ya existe
  const { data: existing, error: checkError } = await supabase
    .from('tma_rooms')
    .select('id')
    .eq('name', 'COORDINACIÓN DE ASESINATO')
    .maybeSingle();

  if (checkError && checkError.code !== 'PGRST116') {
     console.error("Error al buscar el cuarto de asesinato:", checkError);
  }

  if (existing) return existing.id;

  // 2. Crear si no existe
  const { data: newRoom, error } = await supabase
    .from('tma_rooms')
    .insert({
      name: 'COORDINACIÓN DE ASESINATO',
      is_invisible: true
    })
    .select()
    .single();

  if (error) throw error;
  return newRoom.id;
}

export async function createTmaNpc(npc: {
  tma_name: string;
  tma_title: string;
  tma_biography: string;
  image_url: string;
  sprite_idle_url?: string;
  status?: 'ALIVE' | 'DEAD' | 'MISSING' | 'GUILTY';
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('NO_AUTH_SESSION');

  const { data, error } = await supabase
    .from('tma_characters')
    .insert({
      ...npc,
      user_id: user.id,
      is_npc: true,
      investigation_points: 7,
      murder_points: 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Agrega o quita el rol de asesino a un personaje.
 */
export async function assignAssassinStatus(characterId: string, is_assassin: boolean) {
  const supabase = createClient();
  const updates: { is_assassin: boolean; murder_points?: number } = { is_assassin };
  if (is_assassin) updates.murder_points = 7; // El asesino siempre empieza con 7 MP

  const { data, error } = await supabase
    .from('tma_characters')
    .update(updates)
    .eq('id', characterId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtiene todos los alumnos vivos (No NPCs) para invitar a la cámara de asesinato.
 */
export async function getAllAliveCandidates() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tma_characters')
    .select(`
      id,
      tma_name,
      tma_title,
      image_url,
      is_assassin
    `)
    .eq('status', 'ALIVE')
    .eq('is_npc', false)
    .order('tma_name', { ascending: true });

  if (error) return [];
  return data;
}

/**
 * Actualiza los detalles de una evidencia (Título/Descripciones/Imagen/Coste)
 */
export async function updateTmaEvidenceDetail(evidenceId: string, updates: { 
  title?: string; 
  description_brief?: string; 
  description_full?: string;
  image_url?: string;
  is_fake?: boolean;
  investigation_cost?: number;
  is_hidden?: boolean;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tma_evidences')
    .update(updates)
    .eq('id', evidenceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Elimina una evidencia por completo
 */
export async function deleteTmaEvidence(evidenceId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('tma_evidences')
    .delete()
    .eq('id', evidenceId);

  if (error) throw error;
  return true;
}

/**
 * Loguea una acción del asesino en el cuarto de coordinación
 */
export async function logAssassinAction(characterId: string, actionName: string, details: string) {
  const supabase = createClient();
  const roomId = await ensureMurderRoom();

  const { error } = await supabase
    .from('tma_messages')
    .insert({
      tma_room_id: roomId,
      sender_tma_id: characterId,
      content: `[SISTEMA - ACCIÓN DE TIENDA]: ${actionName} - ${details}`,
      is_system_message: true
    });

  if (error) {
    console.error("Error al loguear acción del asesino:", error);
  }
}

/**
 * Finaliza el proceso de coordinación, genera un resumen con IA y bloquea el acceso.
 */
export async function finalizeAssassination(coordinationRoomId: string, characterId: string) {
  const supabase = createClient();
  
  // 1. Obtener logs de la tienda para el resumen
  const { data: messages } = await supabase
    .from('tma_messages')
    .select('content')
    .eq('tma_room_id', coordinationRoomId)
    .ilike('content', '[SISTEMA - ACCIÓN DE TIENDA]%')
    .order('created_at', { ascending: true });

  const actionsLog = messages?.map(m => m.content).join('\n') || 'No se registraron acciones de sistema.';

  // 1b. Obtener logs de CONVERSACIÓN para que Gemini tenga contexto real de lo hablado
  const { data: chatMessages } = await supabase
    .from('tma_messages')
    .select('content, sender_tma_id')
    .eq('tma_room_id', coordinationRoomId)
    .eq('is_system_message', false)
    .order('created_at', { ascending: true });

  const conversationLog = chatMessages?.map(m => `[ID:${m.sender_tma_id}]: ${m.content}`).join('\n') || 'No hubo conversación detectada.';

  // 2. Llamada real a Gemini a través de nuestra API route
  let summary = '';
  try {
    const response = await fetch('/api/ai/case-builder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionsLog, conversationLog })
    });
    
    if (response.ok) {
      const data = await response.json();
      summary = data.summary;
    } else {
      throw new Error('AI_API_ERROR');
    }
  } catch (err) {
    console.error("Fallo al generar resumen con AI:", err);
    summary = `INFORME FINAL DE COORDINACIÓN - SCION\n\n[ERROR_EN_PROCESAMIENTO_NEURAL]\n\nACCIONES DETECTADAS:\n${actionsLog}`;
  }

  // 3. Actualizar la sala: Fase FINISHED y guardar resumen
  const { error } = await supabase
    .from('tma_rooms')
    .update({ 
      coordination_stage: 'FINISHED',
      murder_case_summary: summary 
    })
    .eq('id', coordinationRoomId);

  if (error) throw error;

  // 4. Log final
  await logAssassinAction(characterId, 'CLAUSURA', 'El asesino ha finalizado la coordinación. El expediente ha sido sellado.');
  
  return summary;
}

/**
 * Reabre una sala bloqueada (quital el target_murder_room_id para quitar Mantenimiento)
 * pero conserva el resumen para que el staff lo siga viendo.
 */
export async function reopenCrimeScene(coordinationRoomId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('tma_rooms')
    .update({ 
      target_murder_room_id: null
    })
    .eq('id', coordinationRoomId);

  if (error) throw error;
  return true;
}

/**
 * Borra todos los mensajes de una sala específica.
 * Útil para limpiar la sala de coordinación de asesinato.
 */
export async function clearRoomMessages(roomId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('tma_messages')
    .delete()
    .eq('tma_room_id', roomId);

  if (error) throw error;
  return true;
}

/**
 * Resetea completamente el caso actual para permitir uno nuevo.
 */
export async function resolveCurrentCase(coordinationRoomId: string) {
  const supabase = createClient();

  // 1. Resetear la sala de coordinación
  const { error: roomError } = await supabase
    .from('tma_rooms')
    .update({
      coordination_stage: 'PLANNING',
      murder_case_summary: null,
      target_murder_room_id: null
    })
    .eq('id', coordinationRoomId);

  if (roomError) throw roomError;

  // 1b. Borrar todos los mensajes de la sala de coordinación para que Gemini empiece de cero
  const { error: msgError } = await supabase
    .from('tma_messages')
    .delete()
    .eq('tma_room_id', coordinationRoomId);

  if (msgError) console.error('Error al limpiar mensajes de coordinación:', msgError);

  // 2. Resetear roles de asesino en personajes (Limpiar asesinos anteriores)
  const { error: charError } = await supabase
    .from('tma_characters')
    .update({ 
      is_assassin: false,
      murder_points: 0 
    })
    .eq('is_assassin', true);

  if (charError) throw charError;

  // 3. Limpiar pistas del mundo (Opcional: puedes filtrar si guardas el ID del caso, 
  // pero por ahora limpiamos todas las evidencias activas para el nuevo caso)
  const { error: evidenceError } = await supabase
    .from('tma_evidences')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (evidenceError) throw evidenceError;

  return true;
}
