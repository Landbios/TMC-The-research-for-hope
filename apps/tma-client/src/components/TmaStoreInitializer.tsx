'use client';

import { useEffect, useRef } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { TMACharacterData, TMAGameState } from '@/features/characters/api';

interface StateInitializerProps {
  gameState: TMAGameState | null;
  character: TMACharacterData | null;
  userRole?: 'roleplayer' | 'staff' | 'superadmin';
}

export function TmaStoreInitializer({ gameState, character, userRole }: StateInitializerProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      const store = useTmaStore.getState();
      
      if (gameState) {
        store.setGameState(gameState);
      }
      
      // PERSISTENCE LOGIC: Check if we are possessing someone
      const possessedId = typeof window !== 'undefined' ? localStorage.getItem('tma_possessed_id') : null;
      
      if (character) {
        // If we have a possessed ID, we set that as the current ID but still sync the original data to the store
        // so we know which character is the "real" one.
        store.setCharacterData(character);
        
        if (possessedId && (userRole === 'staff' || userRole === 'superadmin')) {
           store.setMyCharacterId(possessedId);
        }
      }

      if (userRole) {
        store.setUserRole(userRole);
      }
      
      store.setStoreInitialized(true);
      initialized.current = true;
    }
  }, [gameState, character, userRole]);

  return null;
}
