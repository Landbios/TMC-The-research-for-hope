'use client';

import { useState, useEffect, useRef } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { updateVolunteerStatus, getTMACharacter } from '@/features/characters/api';
import { createClient } from '@/lib/supabase/client';

export function GlobalPollOverlay() {
  const pendingPolls = useTmaStore(state => state.pendingPolls);
  const setGameState = useTmaStore(state => state.setGameState);
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const [isVolunteer, setIsVolunteer] = useState<boolean | null>(null);
  const isAssassinPollActive = useTmaStore(state => state.isAssassinPollActive);
  const [isBodyDismissed, setIsBodyDismissed] = useState(false);
  const isBodyDiscoveryActive = useTmaStore(state => state.isBodyDiscoveryActive);

  const prevDiscoveryRef = useRef(isBodyDiscoveryActive);

  // Reset dismissal when a NEW body discovery starts
  useEffect(() => {
    if (isBodyDiscoveryActive && !prevDiscoveryRef.current) {
      // Defer state update to avoid cascading render warning
      const timer = setTimeout(() => setIsBodyDismissed(false), 0);
      return () => clearTimeout(timer);
    }
    prevDiscoveryRef.current = isBodyDiscoveryActive;
  }, [isBodyDiscoveryActive]);

  const isStoreInitialized = useTmaStore(state => state.isStoreInitialized);
  const userRole = useTmaStore(state => state.userRole);
  const isPossessing = useTmaStore(state => state.isPossessing);

  // 1. Suscripción en tiempo real al estado global del juego (Singleton ID=1)
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('global_game_state')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tma_game_state', filter: 'id=eq.1' },
        (payload) => {
          console.log('TMA_SYSTEM: Game State Updated', payload.new);
          setGameState(payload.new as import('@/features/characters/api').TMAGameState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setGameState]);

  // Obtener estado de voluntario
  useEffect(() => {
    const fetchData = async () => {
      if (myCharacterId && isStoreInitialized) {
        const char = await getTMACharacter();
        if (char) setIsVolunteer(char.is_volunteer);
      }
    };
    
    if (isAssassinPollActive && isStoreInitialized) {
      fetchData();
    }
  }, [isAssassinPollActive, myCharacterId, isStoreInitialized]);

  const handleVolunteerChoice = async (choice: boolean) => {
    if (!myCharacterId) return;
    try {
      await updateVolunteerStatus(myCharacterId, choice);
      setIsVolunteer(choice);
    } catch (error) {
      console.error('Error updating volunteer status:', error);
    }
  };

  const investigationPoints = useTmaStore(state => state.investigationPoints);
  const gamePeriod = useTmaStore(state => state.gamePeriod);
  const isInvestigationPeriod = gamePeriod === 'INVESTIGATION';

  if (!isStoreInitialized) return null;
  
  const isTimeUp = isInvestigationPeriod && investigationPoints === 0;

  if (!isAssassinPollActive && (!isBodyDiscoveryActive || isBodyDismissed) && !isTimeUp) return null;

  return (
    <div className="fixed inset-0 z-9999 pointer-events-none flex items-center justify-center p-4">
      
      {/* INVESTIGATION EXHAUSTED / JUDGEMENT TRANSITION */}
      {isTimeUp && (
        <div className="fixed inset-0 bg-blue-950/40 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in pointer-events-auto">
           <div className="relative w-full max-w-3xl bg-black border-2 border-blue-500 shadow-[0_0_60px_rgba(59,130,246,0.4)] overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <div className="absolute inset-0 bg-linear-to-b from-blue-600/10 via-transparent to-blue-600/10 animate-scanline"></div>
              
              <div className="p-8 md:p-12 flex flex-col items-center text-center gap-8 relative z-10">
                 <div className="space-y-2">
                    <h2 className="font-mono text-blue-500 text-xs tracking-[0.5em] uppercase opacity-70">
                      ！！ alert: neural exhaustion detected ！！
                    </h2>
                    <h1 className="font-cinzel text-4xl md:text-6xl text-white uppercase tracking-tighter shadow-blue-500/50 drop-shadow-md">
                       TIEMPO AGOTADO
                    </h1>
                 </div>

                 <div className="w-full h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent"></div>

                 <div className="font-mono text-lg md:text-xl text-blue-400 italic animate-pulse">
                    &quot;hiss el tiempo de espera ha finalissado , se abrira la sala de juicio hiss&quot;
                 </div>

                 <div className="flex flex-col gap-4 w-full max-w-md">
                    <button 
                      className="w-full py-4 bg-blue-600 text-black font-mono font-bold text-sm uppercase tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                      onClick={() => alert('SALA DE JUICIO: Work In Progress (W.I.P). El staff iniciará el juicio manualmente.')}
                    >
                      [ ABRIR SALA DE JUICIO (W.I.P) ]
                    </button>
                    <p className="font-mono text-[9px] text-zinc-500 uppercase">
                      Nota: El sistema de juicio se encuentra en fase de desarrollo beta.
                    </p>
                 </div>
              </div>

              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
           </div>
        </div>
      )}

      {/* BODY DISCOVERY OVERLAY */}
      {isBodyDiscoveryActive && !isBodyDismissed && (
         <div className="fixed inset-0 bg-red-950/40 backdrop-blur-sm z-50 flex items-center justify-center animate-glitch-heavy overflow-hidden pointer-events-auto">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
            <div className="absolute inset-0 bg-linear-to-b from-red-600/20 via-transparent to-red-600/20 animate-scanline"></div>
            
            <div className="relative w-full py-12 bg-black border-y-4 border-red-600 shadow-[0_0_100px_rgba(239,68,68,0.8)] flex flex-col items-center gap-6">
               <div className="flex gap-4 animate-pulse">
                  <div className="w-4 h-12 bg-red-600"></div>
                  <div className="w-1 h-12 bg-red-600"></div>
                  <div className="w-8 h-12 bg-red-600"></div>
               </div>
               
               <h2 className="font-cinzel text-4xl md:text-6xl text-white text-center uppercase tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                  ！！ CUERPO DESCUBIERTO ！！
               </h2>
               
               <div className="py-2 px-8 bg-red-600 text-black font-mono font-black text-sm uppercase tracking-[0.5em] animate-bounce">
                  blackout protocol active: investigation required
               </div>

               <div className="flex gap-1">
                  {[...Array(20)].map((_, i) => (
                     <div key={i} className="w-2 h-1 bg-red-600/40"></div>
                  ))}
               </div>

               <button 
                 onClick={() => setIsBodyDismissed(true)}
                 className="mt-4 px-8 py-2 bg-white text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border-2 border-transparent hover:border-white"
               >
                 [ ACUSAR RECIBO / CERRAR ]
               </button>
            </div>

            {/* Cinematic text bits */}
            <div className="absolute bottom-10 left-10 font-mono text-[10px] text-red-500/60 uppercase flex flex-col gap-1">
               <p>STATUS: UNKNOWN_VICTIM_DETECTED</p>
               <p>LOCATION: SCANNING_ACADEMY_GROUNDS...</p>
               <p>TIME_LOG: {new Date().toLocaleTimeString()}</p>
            </div>
         </div>
      )}


      {/* ASSASSIN POLL UI */}
      {isAssassinPollActive && pendingPolls.length === 0 && isVolunteer === null && 
       (userRole === 'roleplayer' || ((userRole === 'staff' || userRole === 'superadmin') && !isPossessing)) && (
        <div className="pointer-events-auto w-full max-w-md bg-black border-2 border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.6)] animate-pulse relative overflow-hidden">
           <div className="bg-red-900/40 text-red-500 p-2 font-mono text-[10px] text-center uppercase tracking-widest border-b border-red-500/50">
              ！！ blackout protocol: intention established ！！
           </div>
           
           <div className="p-8 space-y-6 text-center">
              <div className="space-y-4">
                 <h3 className="font-cinzel text-2xl text-white uppercase tracking-wider">
                    ¿DESEAS COMETER UN ASESINATO?
                 </h3>
                 <p className="font-mono text-xs text-red-500/80 uppercase leading-relaxed">
                    Al aceptar, serás añadido a la lista de candidatos para el próximo incidente. 
                    La selección final será aleatoria y privada.
                 </p>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4">
                 <button 
                   onClick={() => handleVolunteerChoice(true)}
                   className="w-full py-4 font-mono text-sm uppercase tracking-widest transition-all border-2 bg-transparent text-red-500 border-red-500 hover:bg-red-500 hover:text-black shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                 >
                    [ SÍ / POSTULARSE ]
                 </button>
                 <button 
                   onClick={() => handleVolunteerChoice(false)}
                   className="w-full py-3 font-mono text-xs uppercase tracking-widest transition-all border border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:text-white"
                 >
                    [ NO / DECLINAR ]
                 </button>
              </div>
           </div>
           <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20 animate-scanline pointer-events-none" />
        </div>
      )}
    </div>
  );
}
