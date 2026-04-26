'use client';

import { useState, useEffect } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { createClient } from '@/lib/supabase/client';
import type { TMACharacterData } from '@/features/characters/api';
import { useRouter } from 'next/navigation';
import { Shield, Skull, Users, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const PLACEHOLDER_IMG_1 = 'https://picsum.photos/seed/tma/200/200';


interface TMARoom {
  id: string;
  name: string;
  is_private: boolean;
  is_hidden?: boolean;
  coordination_stage?: string;
  target_murder_room_id?: string | null;
}

interface LiveIntelRoom {
  id: string;
  name: string;
  is_private: boolean;
  coordination_stage: string;
  target_murder_room_id: string | null;
  characters: TMACharacterData[];
  isBlockedEntry: boolean;
}

export function AcademyMap() {
  const [rooms, setRooms] = useState<LiveIntelRoom[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userRole = useTmaStore((state) => state.userRole);
  const myChar = useTmaStore((state) => state.originalCharacter);
  const toggleNervalis = useTmaStore((state) => state.toggleNervalis);
  const currentRoomId = useTmaStore((state) => state.selectedRoomId);
  
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const fetchLiveIntel = async () => {
      const supabase = createClient();
      
      const { data: roomsData } = await supabase.from('tma_rooms').select('*');
      const { data: charsData } = await supabase.from('tma_characters').select('*');
      
      if (!roomsData || !charsData) return;

      const performMerge = (dbRooms: TMARoom[], dbChars: TMACharacterData[]) => {
          const isStaff = userRole === 'staff' || userRole === 'superadmin';
          const isAssassin = myChar?.is_assassin || false;

          const blockedIds = new Set(dbRooms.map(r => r.target_murder_room_id).filter(id => id));

          const mergedRooms = dbRooms.filter(r => {
            if (r.id === '00000000-0000-0000-0000-000000000000') return false; // Hide Global Comm Chat
            
            const isStaff = userRole === 'staff' || userRole === 'superadmin';
            // Regla: Salas ocultas no se muestran a estudiantes
            if (r.is_hidden && !isStaff) return false;
            if (r.name.includes('ADMIN') && !isStaff) return false;

            if (r.name === 'COORDINACIÓN DE ASESINATO') {
              if (isStaff) return true;
              return isAssassin && r.coordination_stage !== 'FINISHED';
            }
            return true;
          }).map(r => {
            let displayName = r.name;
            if (r.name === 'COORDINACIÓN DE ASESINATO' && r.coordination_stage === 'PLANNING' && !isStaff) {
               displayName = 'INVITACIÓN DE ASESINO';
            }

            const isTargeted = blockedIds.has(r.id);
            const charsInRoom = dbChars.filter(c => {
               if (c.current_room_id !== r.id) return false;
               // Regla de Sigilo: No se muestran personajes ocultos a menos que seas Staff o el propio personaje
               if (c.is_hidden) {
                  return isStaff || c.id === myChar?.id;
               }
               return true;
            });

            return {
              id: r.id,
              name: displayName,
              is_private: r.is_private,
              coordination_stage: r.coordination_stage || 'PLANNING',
              target_murder_room_id: r.target_murder_room_id || null,
              characters: charsInRoom as TMACharacterData[],
              isBlockedEntry: isTargeted && !isStaff && !isAssassin,
            };
          });

          if (mounted) {
              // Ordénarlos alfabéticamente para mantener consistencia
              setRooms(mergedRooms.sort((a,b) => a.name.localeCompare(b.name)));
              setLoading(false);
          }
      };

      performMerge(roomsData, charsData);

      // Suscripciones Tiempo Real
      const channel = supabase.channel('live_intel_global')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tma_characters' }, async () => {
            // Un update re-evalúa todo
            const { data: newChars } = await supabase.from('tma_characters').select('*');
            if (newChars && mounted) performMerge(roomsData, newChars);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tma_rooms' }, async () => {
            const { data: newRooms } = await supabase.from('tma_rooms').select('*');
            const { data: currentChars } = await supabase.from('tma_characters').select('*');
            if (newRooms && currentChars && mounted) performMerge(newRooms, currentChars);
        })
        .subscribe();

      return () => {
          mounted = false;
          supabase.removeChannel(channel);
      };
    };

    fetchLiveIntel();
  }, [userRole, myChar?.is_assassin, myChar?.id]);

  const handleTransit = (room: LiveIntelRoom) => {
      // Redirige al cuarto
      router.push(`/rooms/${room.id}`);
      // Cierra Nervalis automáticamente para forzar la inmersión del tránsito
      toggleNervalis(false);
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4 p-2 bg-black overflow-y-auto custom-scrollbar">
       <div className="flex items-center justify-between border-b border-blue-500/20 pb-2 shrink-0">
          <h2 className="font-mono text-xs text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={14} /> EXPLORACIÓN_GLOBAL
          </h2>
          <span className="font-mono text-[8px] text-zinc-500">[{rooms.length}_SECTORES_DETECTADOS]</span>
       </div>

       {loading ? (
         <div className="flex-1 flex flex-col items-center justify-center text-blue-500/50">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="font-mono text-xs tracking-widest uppercase">Escaneando Biometría...</p>
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
            <AnimatePresence>
              {rooms.map(room => {
                 const isCurrent = room.id === currentRoomId;
                 return (
                   <motion.button
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     key={room.id}
                     onClick={() => handleTransit(room)}
                     disabled={room.isBlockedEntry}
                     className={`text-left p-4 border relative overflow-hidden transition-all group flex flex-col gap-2 min-h-[110px] ${
                       room.isBlockedEntry 
                         ? 'bg-zinc-950 border-yellow-500/30 opacity-70 cursor-not-allowed shadow-[inset_0_0_20px_rgba(202,138,4,0.1)]' 
                         : isCurrent
                           ? 'bg-blue-600/10 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                           : room.is_private
                             ? 'bg-red-900/10 border-red-500/50 hover:bg-red-900/20 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]'
                             : 'bg-blue-900/10 border-blue-500/30 hover:border-blue-500/80 hover:bg-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                     }`}
                   >
                      {/* Efecto hover de escaneo scanline */}
                      {!room.isBlockedEntry && (
                         <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-400/10 to-transparent h-[150%] -top-[150%] group-hover:animate-scan pointer-events-none" />
                      )}

                      {/* Glitch Overlay for Maintenance */}
                      {room.isBlockedEntry && (
                         <div className="absolute inset-0 pointer-events-none bg-amber-500/5 group-hover:animate-pulse opacity-20">
                            <div className="absolute inset-0 crt-scanline opacity-10" />
                         </div>
                      )}

                      <div className="flex justify-between items-start z-10 w-full relative">
                         <div className="flex flex-col">
                            <h3 className={`font-mono text-[10px] sm:text-xs font-bold tracking-wider ${
                              room.isBlockedEntry ? 'text-yellow-500/70' :
                              isCurrent ? 'text-white' :
                              room.is_private ? 'text-red-400' : 'text-blue-400'
                            }`}>
                              {room.name}
                            </h3>
                            {isCurrent && (
                               <span className="font-mono text-[7px] text-blue-400 animate-pulse font-bold tracking-widest mt-0.5">
                                 [ LOCALIZACIÓN_ACTUAL ]
                               </span>
                            )}
                         </div>
                         <div className="flex gap-2">
                            {room.isBlockedEntry && <span title="Mantenimiento Táctico"><Skull size={14} className="text-yellow-600 animate-pulse" /></span>}
                            {!room.isBlockedEntry && room.target_murder_room_id && (
                               <span title="Preparación Táctica"><Skull size={14} className="text-red-500 animate-ping" /></span>
                            )}
                            {room.is_private && <span title="Canal Privado"><Shield size={14} className="text-red-500 animate-pulse" /></span>}
                         </div>
                      </div>

                      <div className="z-10 mt-2 min-h-[40px] w-full">
                         {room.characters.filter(c => !c.is_hidden).length === 0 ? (
                            <p className="font-mono text-[9px] text-zinc-600 uppercase">Sin Actividad Registrada</p>
                         ) : (
                            <div className="flex flex-col gap-1 w-full">
                               <div className="flex items-center gap-1 font-mono text-[8px] text-blue-500/60 uppercase mb-1">
                                  <Users size={10} /> Sujetos Detectados: {room.characters.filter(c => !c.is_hidden).length}
                               </div>
                               
                               {/* Avatars on Hover Tooltip (Internal version for list) */}
                               <div className="flex flex-wrap gap-1 relative overflow-visible">
                                  {room.characters.filter(c => !c.is_hidden).map(c => (
                                     <div key={c.id} className="group/char relative">
                                        <div className="w-6 h-6 border border-blue-500/30 bg-zinc-900 relative overflow-hidden">
                                            <Image 
                                              src={c.sprite_idle_url || c.image_url || PLACEHOLDER_IMG_1} 
                                              alt={c.tma_name || 'Estudiante'}
                                              width={24}
                                              height={24}
                                              className="w-full h-full object-cover"
                                              unoptimized={!!(c.sprite_idle_url || c.image_url)?.includes('picsum.photos')}
                                            />
                                        </div>
                                        {/* Presence Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/char:block z-50 pointer-events-none">
                                           <div className="bg-black border border-blue-500 px-2 py-1 shadow-[0_0_15px_rgba(59,130,246,0.5)] whitespace-nowrap">
                                              <p className="font-mono text-[8px] text-blue-400 uppercase tracking-widest">{c.tma_name}</p>
                                           </div>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         )}
                      </div>
                   </motion.button>
                 );
              })}
            </AnimatePresence>
         </div>
       )}
    </div>
  );
}
