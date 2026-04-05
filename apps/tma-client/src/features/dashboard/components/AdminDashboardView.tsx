'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, User, MapPin, Activity, Terminal } from 'lucide-react';
import { useTmaStore } from '@/store/useTmaStore';
import type { TMACharacterData } from '@/features/characters/api';
import { createClient } from '@/lib/supabase/client';

interface AdminDashboardViewProps {
  initialCharacters: TMACharacterData[];
}

export function AdminDashboardView({ initialCharacters }: AdminDashboardViewProps) {
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const [characters, setCharacters] = useState<TMACharacterData[]>(initialCharacters);
  const [rooms, setRooms] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    
    // Fetch room names for mapping
    const fetchRooms = async () => {
      const { data } = await supabase.from('tma_rooms').select('id, name');
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(r => map[r.id] = r.name);
        setRooms(map);
      }
    };
    fetchRooms();

    // Subscribe to character updates (room/status changes)
    const channel = supabase.channel('admin_monitoring')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tma_characters' }, (payload) => {
        const updated = payload.new as TMACharacterData;
        setCharacters(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tma_characters' }, (payload) => {
        const newChar = payload.new as TMACharacterData;
        setCharacters(prev => [...prev, newChar]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      
      {/* Header Admin */}
      <div className="flex items-center justify-between border-b border-red-500/50 pb-4">
        <div className="flex items-center gap-3">
          <Terminal className="text-red-500" />
          <h2 className="font-mono text-xl font-bold text-red-500 tracking-[0.2em] uppercase">
            MONITOR DE SUJETOS [ STAFF_ACCESS ]
          </h2>
        </div>
        <div className="flex gap-4">
          <Link href="/admin" className="px-4 py-1.5 border border-red-500/50 bg-red-500/10 text-red-500 font-mono text-[10px] uppercase hover:bg-red-500 hover:text-black transition-all">
            Panel Maestro
          </Link>
          <Link href="/map" className="px-4 py-1.5 border border-red-500/50 bg-red-500/10 text-red-500 font-mono text-[10px] uppercase hover:bg-red-500 hover:text-black transition-all">
            Vista de Mapa
          </Link>
        </div>
      </div>

      {/* Grid de Estudiantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.filter(char => !char.is_npc || char.id === useTmaStore.getState().originalCharacter?.id).map((char) => (
          <div 
            key={char.id} 
            className={`sci-border p-4 bg-zinc-950/50 relative overflow-hidden transition-all border-l-4 ${
              char.status === 'DEAD' ? 'border-l-red-600 opacity-60' : 'border-l-blue-500'
            }`}
          >
            {/* Background Glitch Effect */}
            <div className="absolute inset-0 pointer-events-none crt-scanline opacity-10"></div>
            <div className="absolute top-2 right-2 flex gap-1 items-center">
               <div className={`w-1.5 h-1.5 rounded-full ${char.status === 'ALIVE' ? 'bg-green-500 animate-pulse' : 'bg-red-600'}`} />
               <span className="font-mono text-[8px] opacity-70 uppercase tracking-tighter">
                 {char.status}
               </span>
            </div>

            <div className="flex gap-4 relative z-10">
              {/* Mini Avatar */}
              <div className="w-16 h-16 bg-black border border-zinc-800 shrink-0 relative overflow-hidden">
                {(char.image_url || char.tmc_character?.image_url) ? (
                   <Image 
                     src={char.image_url || char.tmc_character?.image_url || ''} 
                     alt={char.tma_name || ''} 
                     fill
                     className="object-cover grayscale" 
                     unoptimized
                   />
                ) : (
                   <div className="w-full h-full flex items-center justify-center"><User size={24} className="opacity-20" /></div>
                )}
                 <div className="absolute inset-0 bg-blue-500/10 pointer-events-none mix-blend-color" />
              </div>

              {/* Data */}
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <h3 className="font-mono text-xs font-bold text-blue-400 uppercase truncate">
                  {char.tmc_character?.name || char.tma_name}
                </h3>
                <p className="font-mono text-[9px] text-zinc-500 truncate mb-1 italic">
                  {char.tma_title}
                </p>
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] mt-auto">
                   <MapPin size={12} className="text-blue-500" />
                   <span className="truncate uppercase">{rooms[char.current_room_id || ''] || 'Sector Desconocido'}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px]">
                   <Activity size={12} className="text-red-500" />
                   <span>{char.investigation_points} IP AVAILABLE</span>
                </div>
              </div>
            </div>

            {/* Overlay if hidden */}
            {char.is_hidden && (
              <div className="absolute inset-x-0 bottom-0 bg-amber-500/20 py-0.5 px-2 flex items-center justify-between pointer-events-none">
                 <span className="font-mono text-[7px] text-amber-500 font-bold uppercase">Estado: Sigilo Detectado</span>
                 <ShieldCheck size={10} className="text-amber-500" />
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
