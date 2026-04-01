import { createClient } from '@/lib/supabase/client';

export async function getAllVolunteers() {
  const supabase = createClient();
  // Esta query asume que existe una forma de saber quién se postuló
  // Por ahora buscaremos a todos los personajes vivos
  const { data, error } = await supabase
    .from('tma_characters')
    .select('*')
    .eq('status', 'ALIVE');

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
  description: string;
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

