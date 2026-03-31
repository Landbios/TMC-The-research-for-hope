'use client';
import { useParams, useRouter } from 'next/navigation';
import { InsideRoomArena } from '@/features/exploration/components/InsideRoomArena';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId || 'UNKNOWN_SECTOR';
  const [roomName, setRoomName] = useState('CARGANDO DATOS...');

  useEffect(() => {
    if (roomId && roomId !== 'UNKNOWN_SECTOR') {
      const fetchRoomName = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('tma_rooms').select('name').eq('id', roomId).single();
        if (data) setRoomName(data.name.toUpperCase());
        else setRoomName('ZONA DESCONOCIDA');
      };
      fetchRoomName();
    }
  }, [roomId]);
  
  const handleLeaveRoom = async () => {
     // Modificar Realtime: Abandonamos el cuarto
     const supabase = createClient();
     const { data: { user } } = await supabase.auth.getUser();
     if (user) {
        await supabase.from('tma_characters').update({ current_room_id: null }).eq('user_id', user.id);
     }
     router.push('/map');
  };

  return (
    <div className="flex flex-col w-full h-screen min-h-screen bg-black text-(--glow) relative overflow-hidden pointer-events-auto">
      {/* Botón Volver (Nervalis) */}
      <div className="absolute top-4 left-4 z-50">
        <button onClick={handleLeaveRoom} className="px-5 py-2.5 border-[1.5px] border-(--glow) bg-black/70 backdrop-blur-md hover:bg-(--glow) hover:text-black transition-all font-mono text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          SISTEMA NERVALIS / MAPA
        </button>
      </div>

      <div className="absolute top-4 right-4 z-50 pointer-events-none">
        <div className="px-6 py-2 border-[1.5px] border-(--glow) bg-black/70 backdrop-blur-md opacity-80 uppercase font-mono text-sm tracking-widest text-(--glow)">
          CURRENT_ZONE: {roomName}
        </div>
      </div>

      {/* Room Environment Layer Z-0 */}
      <InsideRoomArena />

      {/* Efectos de CRT */}
      <div className="fixed inset-0 crt-scanline pointer-events-none z-40 opacity-50 mix-blend-overlay" />
    </div>
  );
}
