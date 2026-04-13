import { createClient } from '@/lib/supabase/client';

export interface TMAEvidence {
  id: string;
  room_id: string;
  title: string;
  description_brief?: string;
  description_full?: string;
  image_url?: string;
  investigation_cost: number;
  is_hidden: boolean;
  is_fake: boolean;
  pos_x: number;
  pos_y: number;
  pos_z: number;
}

export interface TMAEvidencePoll {
  id: string;
  evidence_id: string;
  initiator_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  yes_count: number;
  no_count: number;
  created_at: string;
  evidence?: TMAEvidence;
}

export async function getRoomClues(roomId: string): Promise<TMAEvidence[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tma_evidences')
    .select('*')
    .eq('room_id', roomId);
  
  if (error) return [];
  return data as TMAEvidence[];
}

export async function startEvidencePoll(evidenceId: string, initiatorId: string) {
  const supabase = createClient();
  
  // Verificar si ya existe un poll pendiente o aceptado para esta evidencia
  const { data: existingPolls } = await supabase
    .from('tma_evidence_polls')
    .select('id, status')
    .eq('evidence_id', evidenceId)
    .in('status', ['PENDING', 'ACCEPTED']);

  if (existingPolls && existingPolls.length > 0) {
    throw new Error('ESTA EVIDENCIA YA ESTÁ SIENDO PROCESADA O YA FUE ACEPTADA EN EL REGISTRO.');
  }

  const { data, error } = await supabase
    .from('tma_evidence_polls')
    .insert({
      evidence_id: evidenceId,
      initiator_id: initiatorId,
      status: 'PENDING'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as TMAEvidencePoll;
}

export async function submitVote(pollId: string, voterId: string, vote: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from('tma_evidence_votes')
    .upsert(
      { poll_id: pollId, voter_id: voterId, vote: vote },
      { onConflict: 'poll_id,voter_id' }
    );
  
  if (error) throw error;
}

export async function resolvePoll(pollId: string, status: 'ACCEPTED' | 'REJECTED', initiatorId: string, evidenceId: string) {
  const supabase = createClient();
  
  // 1. Actualizar estado del poll
  const { error: pollError } = await supabase
    .from('tma_evidence_polls')
    .update({ status })
    .eq('id', pollId);
  
  if (pollError) throw pollError;

  if (status === 'ACCEPTED') {
    // 2. Obtener el coste de la evidencia
    const { data: evidence } = await supabase
      .from('tma_evidences')
      .select('investigation_cost')
      .eq('id', evidenceId)
      .single();

    const cost = evidence?.investigation_cost ?? 1;

    // 3. Descontar IP al iniciador
    const { data: charData } = await supabase
      .from('tma_characters')
      .select('investigation_points')
      .eq('id', initiatorId)
      .single();
    
    if (charData) {
      await supabase
        .from('tma_characters')
        .update({ investigation_points: Math.max(0, charData.investigation_points - cost) })
        .eq('id', initiatorId);
    }

    // 4. Añadir al Log de Investigación
    await supabase
      .from('tma_character_evidences')
      .insert({
        character_id: initiatorId,
        evidence_id: evidenceId
      });
  }
}

export async function getCharacterLog(characterId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tma_character_evidences')
    .select(`
      added_at,
      evidence:evidence_id (*)
    `)
    .eq('character_id', characterId);
  
  if (error) return [];
  return data;
}
