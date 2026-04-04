'use client';

import { useState, useEffect } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { getTmaNpcs, getTmaCharacterById } from '@/features/characters/api';
import type { TMACharacterData } from '@/features/characters/api';
import { Ghost, UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminCharacterPossessor() {
  const [npcs, setNpcs] = useState<TMACharacterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const setCharacterData = useTmaStore(state => state.setCharacterData);
  const userRole = useTmaStore(state => state.userRole);

  useEffect(() => {
    if (userRole !== 'superadmin' && userRole !== 'staff') return;
    
    getTmaNpcs()
      .then(setNpcs)
      .finally(() => setIsLoading(false));
  }, [userRole]);

  const handlePossess = async (npcId: string) => {
    try {
      setIsLoading(true);
      const npcData = await getTmaCharacterById(npcId);
      if (npcData) {
        setCharacterData(npcData);
        toast.success(`POSESIÓN COMPLETADA: Ahora controlas a ${npcData.tma_name}`);
      }
    } catch (error) {
      console.error('Error possessing NPC:', error);
      toast.error('Error en el protocolo de posesión');
    } finally {
      setIsLoading(false);
    }
  };

  if (userRole !== 'superadmin' && userRole !== 'staff') return null;

  return (
    <div className="sci-border p-4 bg-black/60 backdrop-blur-md border-(--glow)/30">
      <h3 className="font-mono text-xs border-b border-(--glow)/30 pb-2 mb-4 flex items-center gap-2">
        <Ghost size={14} className="text-purple-500" /> | SISTEMA DE POSESIÓN DE NPC
      </h3>

      {isLoading ? (
        <div className="flex items-center gap-2 font-mono text-[10px] py-4 opacity-50">
          <Loader2 size={12} className="animate-spin" /> Sincronizando conciencias...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {npcs.map((npc) => (
            <button
              key={npc.id}
              onClick={() => handlePossess(npc.id)}
              disabled={myCharacterId === npc.id}
              className={`w-full p-2 border flex items-center justify-between transition-all group ${
                myCharacterId === npc.id
                  ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                  : 'border-(--glow)/20 hover:border-purple-500/50 hover:bg-purple-500/5 text-(--glow)/80'
              }`}
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-mono text-xs font-bold uppercase tracking-tighter">
                  {npc.tma_name}
                </span>
                <span className="font-mono text-[9px] opacity-50 italic">
                  {npc.tma_title}
                </span>
              </div>
              {myCharacterId === npc.id ? (
                <UserCheck size={14} />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500/30 group-hover:bg-purple-400 animate-pulse" />
              )}
            </button>
          ))}
          
          {npcs.length === 0 && (
            <p className="font-mono text-[10px] opacity-40 italic py-4 text-center">
              No hay NPCs registrados en la base de datos.
            </p>
          )}
        </div>
      )}

      <p className="mt-4 font-mono text-[9px] opacity-40 leading-tight">
        * Al poseer un NPC, todos tus mensajes y acciones aparecerán bajo su identidad en tiempo real.
      </p>
    </div>
  );
}
