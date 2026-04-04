'use client';

import { useEffect, useRef } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { TMACharacterData, TMAGameState, getTmaCharacterById } from '@/features/characters/api';

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
      
      const setupPossession = async () => {
        const possessedId = typeof window !== 'undefined' ? localStorage.getItem('tma_possessed_id') : null;
        
        if (character) {
          store.setCharacterData(character);
        }

        if (possessedId && (userRole === 'staff' || userRole === 'superadmin')) {
          try {
            const npcChar = await getTmaCharacterById(possessedId);
            if (npcChar) {
              store.setPossession(npcChar);
            }
          } catch (err) {
            console.error('TMA_SYSTEM: Error restoring possession:', err);
          }
        }

        if (userRole) {
          store.setUserRole(userRole);
        }
        
        store.setStoreInitialized(true);
      };

      setupPossession();
      initialized.current = true;
    }
  }, [gameState, character, userRole]);

  return null;
}
