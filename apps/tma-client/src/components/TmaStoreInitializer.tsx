'use client';

import { useEffect, useRef } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { TMACharacterData, TMAGameState, getTmaCharacterById, getTMACharacter } from '@/features/characters/api';

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
          // Si el personaje inicial no es un NPC, es nuestro original
          if (!character.is_npc) {
             store.setCharacterData(character);
             // Si además había un ID de posesión en el storage, lo activamos ahora
             if (possessedId && possessedId !== character.id && (userRole === 'staff' || userRole === 'superadmin')) {
               getTmaCharacterById(possessedId).then(npc => {
                 if (npc) store.setPossession(npc);
               });
             }
          } else {
             // Si el personaje inicial ES un NPC, necesitamos buscar el original real
             getTMACharacter().then(pc => {
               if (pc) store.setCharacterData(pc);
               // Y mantenemos la posesión del NPC
               store.setPossession(character);
             });
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
