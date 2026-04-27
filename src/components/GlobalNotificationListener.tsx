'use client';

import { useEffect } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { createClient } from '@/lib/supabase/client';

/**
 * GlobalNotificationListener: Watches for global events (like background chat messages)
 * to trigger the HUD unread signal indicator.
 */
export function GlobalNotificationListener() {
  const isNervalisOpen = useTmaStore(state => state.isNervalisOpen);
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const setHasUnreadSignals = useTmaStore(state => state.setHasUnreadSignals);
  const GLOBAL_ROOM_ID = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    if (!myCharacterId) return;

    const supabase = createClient();

    // 1. Listen for new messages in the Global Room
    const chatChannel = supabase.channel('global_notifications_chat')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'tma_messages',
          filter: `tma_room_id=eq.${GLOBAL_ROOM_ID}`
        },
        (payload) => {
          const msg = payload.new as { sender_tma_id: string };
          // If message is from someone else and terminal is closed, trigger signal
          if (msg.sender_tma_id !== myCharacterId && !useTmaStore.getState().isNervalisOpen) {
            setHasUnreadSignals(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [myCharacterId, setHasUnreadSignals]);

  return null;
}
