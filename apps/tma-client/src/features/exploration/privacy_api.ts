import { createClient } from '@/lib/supabase/client';
import type { TMARoomPrivacyPoll } from '@/store/useTmaStore';

export async function startPrivacyPoll(roomId: string, initiatorId: string, currentVoters: number) {
  const supabase = createClient();
  
  // 1. Insert the poll
  const { data: poll, error: pollError } = await supabase
    .from('tma_room_privacy_polls')
    .insert({
      room_id: roomId,
      initiator_id: initiatorId,
      total_voters: currentVoters,
      status: 'PENDING'
    })
    .select()
    .single();
  
  if (pollError) throw pollError;

  // 2. Automatically insert initiator's YES vote
  const { error: voteError } = await supabase
    .from('tma_room_privacy_votes')
    .insert({
      poll_id: poll.id,
      voter_id: initiatorId,
      vote: true
    });
  
  if (voteError) console.error("Error auto-voting for initiator:", voteError);

  return poll as TMARoomPrivacyPoll;
}

export async function submitPrivacyVote(pollId: string, voterId: string, vote: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from('tma_room_privacy_votes')
    .upsert({
      poll_id: pollId,
      voter_id: voterId,
      vote: vote
    });
  
  if (error) throw error;
}

export async function resolvePrivacyPoll(pollId: string, roomId: string, status: 'ACCEPTED' | 'REJECTED') {
  const supabase = createClient();
  
  // 1. Actualizar estado del poll
  const { error: pollError } = await supabase
    .from('tma_room_privacy_polls')
    .update({ status })
    .eq('id', pollId);
  
  if (pollError) throw pollError;

  if (status === 'ACCEPTED') {
    // 2. Marcar sala como privada
    const { error: roomError } = await supabase
      .from('tma_rooms')
      .update({ is_private: true })
    .eq('id', roomId);
    
    if (roomError) throw roomError;
  }
}

export async function updateRoomPrivacy(roomId: string, isPrivate: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from('tma_rooms')
    .update({ is_private: isPrivate })
    .eq('id', roomId);
  
  if (error) throw error;
}
