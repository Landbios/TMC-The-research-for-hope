'use client';

import { TmaStoreInitializer } from '@/components/TmaStoreInitializer';
import { PollRealtimeListener } from '@/features/investigation/components/PollRealtimeListener';
import { GlobalPollOverlay } from '@/features/dashboard/components/GlobalPollOverlay';
import { GlobalCharacterListener } from './GlobalCharacterListener';
import { GlobalNotificationListener } from './GlobalNotificationListener';
import { StaffIdentitySwitcher } from '@/features/admin/components/StaffIdentitySwitcher';
import { AssassinRevealOverlay } from '@/features/dashboard/components/AssassinRevealOverlay';
import { NervalisOverlay } from '@/features/dashboard/components/NervalisOverlay';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const isInsideRoom = pathname.startsWith('/rooms/');

  return (
    <>
      <TmaStoreInitializer 
        character={character} 
        gameState={gameState} 
        userRole={userRole} 
      />
      <GlobalCharacterListener />
      <GlobalNotificationListener />
      <PollRealtimeListener />
      <GlobalPollOverlay />
      <AssassinRevealOverlay />
      <NervalisOverlay />
      {(userRole === 'staff' || userRole === 'superadmin') && !isInsideRoom && <StaffIdentitySwitcher />}
    </>
  );
}
