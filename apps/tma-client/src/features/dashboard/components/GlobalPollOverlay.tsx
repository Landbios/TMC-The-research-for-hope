'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { useTmaStore } from '@/store/useTmaStore';
import { submitVote, resolvePoll } from '@/features/investigation/api';
import { updateVolunteerStatus, getTMACharacter } from '@/features/characters/api';
import { createClient } from '@/lib/supabase/client';

export function GlobalPollOverlay() {
  const activePoll = useTmaStore(state => state.activePoll);
  const setActivePoll = useTmaStore(state => state.setActivePoll);
  const setGameState = useTmaStore(state => state.setGameState);
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const [hasVoted, setHasVoted] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
   const [isVolunteer, setIsVolunteer] = useState<boolean | null>(null);
  const isAssassinPollActive = useTmaStore(state => state.isAssassinPollActive);
  const isBodyDiscoveryActive = useTmaStore(state => state.isBodyDiscoveryActive);
  const isStoreInitialized = useTmaStore(state => state.isStoreInitialized);

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

  // Obtener el total de estudiantes vivos para calcular la mayoría y estado de voluntario
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from('tma_characters')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'ALIVE');
      setTotalStudents(count || 1);

      if (myCharacterId && isStoreInitialized) {
        const char = await getTMACharacter();
        if (char) setIsVolunteer(char.is_volunteer);
      }
    };
    
    if (activePoll || isAssassinPollActive) {
      if (isStoreInitialized) fetchData();
      setHasVoted(false);
    }
  }, [activePoll, isAssassinPollActive, myCharacterId, isStoreInitialized]);

  const handleVolunteerChoice = async (choice: boolean) => {
    if (!myCharacterId) return;
    try {
      await updateVolunteerStatus(myCharacterId, choice);
      setIsVolunteer(choice);
    } catch (error) {
      console.error('Error updating volunteer status:', error);
    }
  };

  if (!isStoreInitialized) return null;
  if (!isAssassinPollActive && (!activePoll || !activePoll.evidence)) return null;

  const handleVote = async (vote: boolean) => {
    if (!myCharacterId || hasVoted || !activePoll) return;
    try {
      await submitVote(activePoll.id, myCharacterId, vote);
      setHasVoted(true);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleResolve = async () => {
    if (isResolving || !activePoll) return;
    const majority = Math.floor(totalStudents / 2) + 1;
    const isAccepted = activePoll.yes_count >= majority;
    const isRejected = activePoll.no_count >= majority || (activePoll.yes_count + activePoll.no_count >= totalStudents && !isAccepted);

    if (!isAccepted && !isRejected) {
       alert(`Aún no hay mayoría. Necesitamos ${majority} votos.`);
       return;
    }

    try {
      setIsResolving(true);
      await resolvePoll(
        activePoll.id, 
        isAccepted ? 'ACCEPTED' : 'REJECTED', 
        activePoll.initiator_id, 
        activePoll.evidence_id
      );
      setActivePoll(null);
    } catch (error) {
      console.error('Error resolving poll:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const majority = Math.floor(totalStudents / 2) + 1;
  const canResolve = activePoll ? (activePoll.yes_count >= majority || activePoll.no_count >= majority || (activePoll.yes_count + activePoll.no_count >= totalStudents)) : false;

  return (
    <div className="fixed inset-0 z-9999 pointer-events-none flex items-center justify-center p-4">
      {/* BODY DISCOVERY OVERLAY */}
      {isBodyDiscoveryActive && (
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
            </div>

            {/* Cinematic text bits */}
            <div className="absolute bottom-10 left-10 font-mono text-[10px] text-red-500/60 uppercase flex flex-col gap-1">
               <p>STATUS: UNKNOWN_VICTIM_DETECTED</p>
               <p>LOCATION: SCANNING_ACADEMY_GROUNDS...</p>
               <p>TIME_LOG: {new Date().toLocaleTimeString()}</p>
            </div>
         </div>
      )}

      {/* INVESTIGATION POLL UI */}
      {activePoll && activePoll.evidence && (
        <div className="pointer-events-auto w-full max-w-md bg-zinc-950 border-2 border-red-600 shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-glitch-entry relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-red-500/10 via-transparent to-red-500/10 animate-scanline"></div>

          <div className="bg-red-600 text-black p-2 font-mono font-bold text-center uppercase tracking-[0.3em] text-xs">
            ！！！ system override: investigation consensus ！！！
          </div>

          <div className="p-6 space-y-6 relative z-10">
            <div className="text-center space-y-2">
              <h3 className="font-cinzel text-xl text-white uppercase tracking-tighter shadow-sm">
                ¿Añadir evidencia al registro?
              </h3>
              <p className="font-mono text-[10px] text-red-500 uppercase font-bold">
                Iniciado por: {activePoll.initiator_id === myCharacterId ? 'USTED' : 'OTRO ESTUDIANTE'}
              </p>
            </div>

            <div className="flex gap-4 bg-black/50 border border-red-900/40 p-3">
              <div className="w-16 h-16 relative shrink-0 border border-red-500/40">
                <NextImage 
                  src={activePoll.evidence.image_url || 'https://picsum.photos/100/100'} 
                  alt="clue"
                  fill
                  className="object-cover"
                  unoptimized={!activePoll.evidence.image_url?.includes('supabase')}
                />
              </div>
              <div className="flex-1">
                <h4 className="font-mono text-xs text-red-400 uppercase font-bold">{activePoll.evidence.title}</h4>
                <p className="font-mono text-[10px] text-zinc-400 leading-tight line-clamp-2 italic">
                  &quot;{activePoll.evidence.description_brief}&quot;
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between font-mono text-[10px] uppercase">
                <span className="text-green-500">ACEPTAR: {activePoll.yes_count}</span>
                <span className="text-zinc-500">Faltan: {Math.max(0, majority - (activePoll.yes_count || 0))}</span>
                <span className="text-red-500">RECHAZAR: {activePoll.no_count}</span>
              </div>
              <div className="h-1 bg-zinc-900 w-full flex">
                 <div 
                   className="h-full bg-green-500 transition-all duration-500" 
                   style={{ width: `${((activePoll.yes_count || 0) / totalStudents) * 100}%` }}
                 />
                 <div 
                   className="h-full bg-red-500 transition-all duration-500" 
                   style={{ width: `${((activePoll.no_count || 0) / totalStudents) * 100}%` }}
                 />
              </div>
            </div>

            {(!hasVoted && activePoll.initiator_id !== myCharacterId) ? (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleVote(true)}
                  className="py-3 bg-green-950/20 border border-green-500/50 text-green-500 font-mono text-xs uppercase hover:bg-green-500 hover:text-black transition-all"
                >
                  [ SÍ / ACEPTAR ]
                </button>
                <button 
                  onClick={() => handleVote(false)}
                  className="py-3 bg-red-950/20 border border-red-500/50 text-red-500 font-mono text-xs uppercase hover:bg-red-500 hover:text-black transition-all"
                >
                  [ NO / RECHAZAR ]
                </button>
              </div>
            ) : (
              <div className="text-center p-3 border border-zinc-800 bg-zinc-900/50">
                <p className="font-mono text-[10px] text-zinc-500 animate-pulse">
                  {activePoll.initiator_id === myCharacterId 
                    ? 'ESPERANDO CONSENSO DE LOS DEMÁS...' 
                    : 'VOTO REGISTRADO. ESPERANDO RESOLUCIÓN.'}
                </p>
              </div>
            )}

            {(activePoll.initiator_id === myCharacterId || canResolve) && (
              <button 
                onClick={handleResolve}
                disabled={isResolving}
                className={`w-full py-2 font-mono text-[10px] uppercase transition-all border ${
                  canResolve 
                    ? 'bg-red-600 border-red-400 text-black hover:scale-105' 
                    : 'bg-zinc-900 border-zinc-700 text-zinc-600 grayscale opacity-50'
                }`}
              >
                {isResolving ? 'PROCESANDO...' : 'RESOLVER PROTOCOLO DE INVESTIGACIÓN'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ASSASSIN POLL UI */}
      {isAssassinPollActive && !activePoll && isVolunteer === null && (
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
