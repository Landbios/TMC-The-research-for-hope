'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { useTmaStore } from '@/store/useTmaStore';
import { submitVote, resolvePoll } from '@/features/investigation/api';
import { createClient } from '@/lib/supabase/client';

export function GlobalPollOverlay() {
  const activePoll = useTmaStore(state => state.activePoll);
  const setActivePoll = useTmaStore(state => state.setActivePoll);
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const [hasVoted, setHasVoted] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);

  // Obtener el total de estudiantes vivos para calcular la mayoría
  useEffect(() => {
    if (activePoll) {
      const fetchCount = async () => {
        const supabase = createClient();
        const { count } = await supabase
          .from('tma_characters')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'ALIVE');
        setTotalStudents(count || 1);
      };
      fetchCount();
      setHasVoted(false);
    }
  }, [activePoll, setActivePoll]);

  if (!activePoll || !activePoll.evidence) return null;

  const handleVote = async (vote: boolean) => {
    if (!myCharacterId || hasVoted) return;
    try {
      await submitVote(activePoll.id, myCharacterId, vote);
      setHasVoted(true);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleResolve = async () => {
    if (isResolving) return;
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
  const canResolve = activePoll.yes_count >= majority || activePoll.no_count >= majority || (activePoll.yes_count + activePoll.no_count >= totalStudents);

  return (
    <div className="fixed inset-0 z-200 pointer-events-none flex items-center justify-center p-4">
      <div className="pointer-events-auto w-full max-w-md bg-zinc-950 border-2 border-red-600 shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-glitch-entry relative overflow-hidden">
        
        {/* Scanlines y Glitch Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-red-500/10 via-transparent to-red-500/10 animate-scanline"></div>

        {/* Cabecera Alerta */}
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

          {/* Info de la Pista */}
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

          {/* Progreso de Votación */}
          <div className="space-y-3">
            <div className="flex justify-between font-mono text-[10px] uppercase">
              <span className="text-green-500">ACEPTAR: {activePoll.yes_count}</span>
              <span className="text-zinc-500">Faltan: {Math.max(0, majority - activePoll.yes_count)}</span>
              <span className="text-red-500">RECHAZAR: {activePoll.no_count}</span>
            </div>
            
            {/* Barra de progreso visual */}
            <div className="h-1 bg-zinc-900 w-full flex">
               <div 
                 className="h-full bg-green-500 transition-all duration-500" 
                 style={{ width: `${(activePoll.yes_count / totalStudents) * 100}%` }}
               />
               <div 
                 className="h-full bg-red-500 transition-all duration-500" 
                 style={{ width: `${(activePoll.no_count / totalStudents) * 100}%` }}
               />
            </div>
          </div>

          {/* Acciones de Voto */}
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

          {/* Botón de Resolución (Solo para el iniciador o si hay mayoría) */}
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
    </div>
  );
}
