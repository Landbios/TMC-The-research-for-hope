'use client';

import { useEffect } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { createClient } from '@/lib/supabase/client';
import { TMAEvidencePoll } from '../api';

export function PollRealtimeListener() {
  const setActivePoll = useTmaStore(state => state.setActivePoll);
  const activePoll = useTmaStore(state => state.activePoll);

  useEffect(() => {
    const supabase = createClient();

    // Suscribirse a cambios en los polls
    const channel = supabase
      .channel('tma_polls_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tma_evidence_polls' },
        async (payload) => {
          const newPoll = payload.new as TMAEvidencePoll;
          // Cargar datos de la evidencia vinculada para mostrar en el overlay
          const { data: evidence } = await supabase
            .from('tma_evidences')
            .select('*')
            .eq('id', newPoll.evidence_id)
            .single();
          
          setActivePoll({ ...newPoll, evidence });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tma_evidence_polls' },
        (payload) => {
          const updatedPoll = payload.new as TMAEvidencePoll;
          
          if (updatedPoll.status !== 'PENDING') {
            // Si el poll se resolvió, esperamos un poco y lo quitamos
            setTimeout(() => {
              setActivePoll(null);
            }, 3000);
          } else if (activePoll && activePoll.id === updatedPoll.id) {
            // Actualizar conteos
            setActivePoll({ ...activePoll, ...updatedPoll });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activePoll, setActivePoll]);

  return null;
}
