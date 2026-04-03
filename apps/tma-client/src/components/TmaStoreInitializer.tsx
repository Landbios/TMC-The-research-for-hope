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
      if (gameState) {
        useTmaStore.getState().setGameState(gameState);
      }
      if (character) {
        useTmaStore.getState().setCharacterData(character);
      }
      if (userRole) {
        useTmaStore.getState().setUserRole(userRole);
      }
      initialized.current = true;
    }
  }, [gameState, character, userRole]);

  return null;
}
