'use client';

import { useEffect } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { createClient } from '@/lib/supabase/client';
import type { TMACharacterData } from '@/features/characters/api';

/**
 * GlobalCharacterListener: Subscribes to the specific character row of the 
 * current user to keep points and status in sync.
 */
export function GlobalCharacterListener() {
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const setCharacterData = useTmaStore(state => state.setCharacterData);

  useEffect(() => {
    if (!myCharacterId) return;

    const supabase = createClient();
    console.log('TMA_SYSTEM: Initializing GlobalCharacterListener for:', myCharacterId);

    const channel = supabase
      .channel(`global_char_${myCharacterId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'tma_characters',
          filter: `id=eq.${myCharacterId}`
        },
        (payload) => {
          console.log('TMA_SYSTEM: Live Character Update', payload.new);
          setCharacterData(payload.new as TMACharacterData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myCharacterId, setCharacterData]);

  return null;
}
