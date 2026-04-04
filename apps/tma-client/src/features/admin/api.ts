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
  description_detailed?: string;
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
    .update({ investigation_points: 7 })
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
// Escoge un asesino al azar de la lista de voluntarios
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

  // 3. Desactivar el poll y limpiar voluntarios
  const { error: updateError } = await supabase
    .from('tma_game_state')
    .update({ assassin_poll_active: false })
    .eq('id', 1);

  if (updateError) throw updateError;

  // Limpiar voluntarios para la próxima (Resetear a NULL)
  await supabase
    .from('tma_characters')
    .update({ is_volunteer: null })
    .not('is_volunteer', 'is', null);

  return selectedAssassin;
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
  const { data: existing } = await supabase
    .from('tma_rooms')
    .select('id')
    .eq('name', 'COORDINACIÓN DE ASESINATO')
    .single();

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
