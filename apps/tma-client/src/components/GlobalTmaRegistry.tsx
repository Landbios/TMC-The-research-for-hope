'use client';

import { TmaStoreInitializer } from '@/components/TmaStoreInitializer';
import { PollRealtimeListener } from '@/features/investigation/components/PollRealtimeListener';
import { GlobalPollOverlay } from '@/features/dashboard/components/GlobalPollOverlay';
import { GlobalCharacterListener } from './GlobalCharacterListener';
import type { TMACharacterData, TMAGameState } from '@/features/characters/api';

interface GlobalTmaRegistryProps {
  character: TMACharacterData;
  gameState: TMAGameState | null;
  userRole: 'roleplayer' | 'staff' | 'superadmin';
}

/**
 * GlobalTmaRegistry: A client component that manages all core TMA state 
 * synchronization and global overlays.
 */
export function GlobalTmaRegistry({ character, gameState, userRole }: GlobalTmaRegistryProps) {
  return (
    <>
      <TmaStoreInitializer 
        character={character} 
        gameState={gameState} 
        userRole={userRole} 
      />
      <GlobalCharacterListener />
      <PollRealtimeListener />
      <GlobalPollOverlay />
    </>
  );
}
