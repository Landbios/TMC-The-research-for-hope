'use client';

import { useEffect } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { createClient } from '@/lib/supabase/client';
import { TMAEvidencePoll } from '../api';

export function PollRealtimeListener() {
  const setPendingPolls = useTmaStore(state => state.setPendingPolls);

  useEffect(() => {
    const supabase = createClient();
    
    // Fetch initial pending polls
    const fetchPendingPolls = async () => {
      const { data: polls } = await supabase
        .from('tma_evidence_polls')
        .select('*, evidence:tma_evidences(*)')
        .eq('status', 'PENDING');
        
      if (polls) {
        setPendingPolls(polls as TMAEvidencePoll[]);
      }
    };
    
    fetchPendingPolls();

    // Subscribe to changes in polls
    const channel = supabase
      .channel('tma_polls_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tma_evidence_polls' },
        async (payload) => {
          const newPoll = payload.new as TMAEvidencePoll;
          if (newPoll.status !== 'PENDING') return;

          const { data: evidence } = await supabase
            .from('tma_evidences')
            .select('*')
            .eq('id', newPoll.evidence_id)
            .single();
          
          const fullPoll = { ...newPoll, evidence };
          setPendingPolls(prev => [...prev, fullPoll]);
          
          if (!useTmaStore.getState().isNervalisOpen) {
            useTmaStore.getState().setHasUnreadSignals(true);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tma_evidence_polls' },
        (payload) => {
          const updatedPoll = payload.new as TMAEvidencePoll;
          
          if (updatedPoll.status !== 'PENDING') {
             // Remove from pending polls
             setPendingPolls(prev => prev.filter(p => p.id !== updatedPoll.id));
          } else {
             // Update counts
             setPendingPolls(prev => prev.map(p => p.id === updatedPoll.id ? { ...p, ...updatedPoll } : p));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setPendingPolls]);

  return null;
}
