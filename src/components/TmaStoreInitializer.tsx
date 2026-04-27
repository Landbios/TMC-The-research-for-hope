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
          // Guardamos siempre el original sin cambiar el ID activo aún
          store.setOriginalCharacter(character);
          
          if (!character.is_npc) {
             // Si hay posesión y somos staff, priorizamos al NPC
             if (possessedId && possessedId !== character.id && (userRole === 'staff' || userRole === 'superadmin')) {
               const npc = await getTmaCharacterById(possessedId);
               if (npc) {
                  store.setPossession(npc);
               } else {
                  store.setCharacterData(character);
               }
             } else {
               // Si no hay posesión, el original es el activo
               store.setCharacterData(character);
             }
          } else {
             // Si el personaje inicial ES un NPC, necesitamos buscar el original real
             const pc = await getTMACharacter();
             if (pc) store.setOriginalCharacter(pc);
             store.setPossession(character);
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
