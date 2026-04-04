'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTmaStore } from '@/store/useTmaStore';
import { getTmaNpcs } from '@/features/characters/api';
import type { TMACharacterData } from '@/features/characters/api';
import { Loader2, LogOut, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function StaffIdentitySwitcher() {
  const [npcs, setNpcs] = useState<TMACharacterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const originalCharacter = useTmaStore(state => state.originalCharacter);
  const userRole = useTmaStore(state => state.userRole);
  const setPossession = useTmaStore(state => state.setPossession);
  
  const [isPossessing, setIsPossessing] = useState(false);

  useEffect(() => {
    const checkPossession = () => {
      const pid = typeof window !== 'undefined' ? localStorage.getItem('tma_possessed_id') : null;
      setIsPossessing(!!pid);
    };
    checkPossession();
    console.log('TMA_SWITCHER_DEBUG:', { 
      myCharacterId, 
      originalCharacterId: originalCharacter?.id, 
      localStoragePid: typeof window !== 'undefined' ? localStorage.getItem('tma_possessed_id') : null 
    });
    
    window.addEventListener('storage', checkPossession);
    return () => window.removeEventListener('storage', checkPossession);
  }, [myCharacterId, originalCharacter]);

  useEffect(() => {
    if (userRole !== 'superadmin' && userRole !== 'staff') return;
    
    const fetchNpcs = async () => {
      try {
        const data = await getTmaNpcs();
        setNpcs(data);
      } catch (err) {
        console.error('Error fetching NPCs for switcher:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNpcs();
    const interval = setInterval(fetchNpcs, 30000);
    return () => clearInterval(interval);
  }, [userRole]);

  const handleSwitch = async (char: TMACharacterData, isOriginal = false) => {
    if (myCharacterId === char.id) return;

    try {
      if (isOriginal) {
        setPossession(null); // Clear possession and revert
        setIsPossessing(false);
        toast.info(`REGRESO AL ORIGEN: Ahora eres ${char.tma_name}`);
      } else {
        setPossession(char);
        setIsPossessing(true);
        toast.success(`POSESIÓN: Ahora controlas a ${char.tma_name}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error en la transferencia de conciencia');
    }
  };

  if (userRole !== 'superadmin' && userRole !== 'staff') return null;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6 items-center animate-in slide-in-from-right duration-700">
      
      {/* Label Indicator */}
      <div className="absolute -top-10 font-mono text-[9px] text-(--glow) opacity-40 uppercase tracking-[0.3em] whitespace-nowrap rotate-90 origin-left translate-x-3 mt-1">
        identity_matrix_active
      </div>

      {/* ORIGINAL CHARACTER DIAMOND (PC) */}
      {originalCharacter && (
        <div className="relative">
           <button
             onClick={() => handleSwitch(originalCharacter, true)}
             className={`
               w-16 h-16 relative transition-all duration-300 hover:scale-110 group
               ${myCharacterId === originalCharacter.id 
                 ? 'shadow-[0_0_30px_rgba(59,130,246,0.8)] scale-110' 
                 : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100 ring-2 ring-blue-500/30'}
             `}
             style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
           >
             <div className={`absolute inset-0 bg-black ${myCharacterId === originalCharacter.id ? 'border-2 border-blue-500' : 'border border-blue-500/40'}`} style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
                <Image 
                  src={originalCharacter.tmc_character?.image_url || originalCharacter.image_url || 'https://picsum.photos/100/100'} 
                  alt="PC" 
                  fill 
                  className="object-cover" 
                  unoptimized
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-blue-500/10" />
                
                {isPossessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <LogOut className="text-white w-8 h-8 drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]" />
                  </div>
                )}

                <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10">
                  <Shield size={10} className="text-blue-400 drop-shadow-md" />
                </div>
             </div>
           </button>
           
           {/* Tooltip */}
           <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black border border-blue-500 p-2 font-mono text-[10px] text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] z-50">
             <div className="flex flex-col items-end">
               <span className="font-bold uppercase tracking-widest leading-none mb-1">{originalCharacter.tma_name}</span>
               <span className="text-[8px] opacity-70 uppercase font-black">
                 {myCharacterId === originalCharacter.id ? 'ESTADO: IDENTIDAD_BASE' : 'ORDEN: RECUPERAR_CONCIENCIA'}
               </span>
             </div>
           </div>
        </div>
      )}

      {/* NPC DIAMONDS */}
      <div className="flex flex-col gap-4">
        {npcs.map((npc) => (
          <div key={npc.id} className="relative group">
            <button
              onClick={() => handleSwitch(npc)}
              className={`
                w-12 h-12 relative transition-all duration-300 hover:scale-110
                ${myCharacterId === npc.id 
                  ? 'shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-110 opacity-100 grayscale-0' 
                  : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100'}
              `}
              style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
            >
              <div className={`absolute inset-0 bg-black ${myCharacterId === npc.id ? 'border-2 border-purple-500' : 'border border-purple-500/30'}`} style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
                 <Image 
                   src={npc.tmc_character?.image_url || npc.image_url || 'https://picsum.photos/100/100'} 
                   alt={npc.tma_name || 'NPC'} 
                   fill 
                   className="object-cover" 
                   unoptimized
                 />
              </div>
            </button>

             {/* Tooltip */}
             <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black border border-purple-500 p-2 font-mono text-[10px] text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] z-50">
               <div className="flex flex-col min-w-[120px]">
                 <span className="font-bold uppercase leading-none mb-1">{npc.tma_name}</span>
                 <div className="flex justify-between text-[8px] opacity-70 font-black gap-4">
                    <span>STATUS: {npc.status}</span>
                    <span>MP: {npc.murder_points || 0}</span>
                 </div>
               </div>
             </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="animate-spin text-(--glow) opacity-30">
          <Loader2 size={16} />
        </div>
      )}
      
      {/* Column Line */}
      <div className="absolute inset-y-0 right-[27px] w-px bg-linear-to-b from-transparent via-(--glow)/20 to-transparent pointer-events-none -z-10" />
    </div>
  );
}
