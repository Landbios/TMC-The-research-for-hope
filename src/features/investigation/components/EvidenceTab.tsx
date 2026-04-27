'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { useTmaStore } from '@/store/useTmaStore';
import { submitVote, resolvePoll, TMAEvidencePoll } from '@/features/investigation/api';
import { createClient } from '@/lib/supabase/client';
import { InvestigationLog } from './InvestigationLog';
import { toast } from 'sonner';

export function EvidenceTab() {
  const pendingPolls = useTmaStore(state => state.pendingPolls);
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const isStoreInitialized = useTmaStore(state => state.isStoreInitialized);
  
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from('tma_characters')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'ALIVE');
      setTotalStudents(count || 1);
    };
    
    if (pendingPolls.length > 0 && isStoreInitialized) {
      fetchData();
    }
  }, [pendingPolls.length, isStoreInitialized]);

  if (!isStoreInitialized) return null;

  if (pendingPolls.length === 0) {
    return <InvestigationLog />;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-start relative p-4 custom-scrollbar overflow-y-auto gap-8">
      {pendingPolls.map((poll) => (
         <PollCard 
           key={poll.id} 
           activePoll={poll} 
           myCharacterId={myCharacterId} 
           totalStudents={totalStudents} 
         />
      ))}
    </div>
  );
}

function PollCard({ activePoll, myCharacterId, totalStudents }: { activePoll: TMAEvidencePoll, myCharacterId: string | null, totalStudents: number }) {
  const [hasVoted, setHasVoted] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  
  useEffect(() => {
    setHasVoted(false);
    setIsVoting(false);
  }, [activePoll.id]);

  const handleVote = async (vote: boolean) => {
    if (!myCharacterId || hasVoted || isVoting) return;
    try {
      setIsVoting(true);
      await submitVote(activePoll.id, myCharacterId, vote);
      setHasVoted(true);
    } catch (error) {
      console.error('Error voting:', error);
      const msg = error instanceof Error ? error.message : 'Error al registrar tu voto.';
      toast.error(msg);
    } finally {
      setIsVoting(false);
    }
  };

  const majority = Math.floor(totalStudents / 2) + 1;
  const isAccepted = activePoll.yes_count >= majority;
  const isRejected = activePoll.no_count >= majority || (activePoll.yes_count + activePoll.no_count >= totalStudents && !isAccepted);
  const canResolve = isAccepted || isRejected || (activePoll.yes_count + activePoll.no_count >= totalStudents);

  const triggerClueRefresh = useTmaStore(state => state.triggerClueRefresh);

  const handleResolve = async () => {
    if (isResolving) return;

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
      
      // Force global refresh of world items
      triggerClueRefresh();
    } catch (error) {
      console.error('Error resolving poll:', error);
    } finally {
      setIsResolving(false);
    }
  };

  if (!activePoll.evidence) return null;

  return (
    <div className="w-full max-w-md bg-zinc-950 border-2 border-red-600 shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-glitch-entry relative overflow-hidden shrink-0 mt-8 mb-8">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-red-500/10 via-transparent to-red-500/10 animate-scanline"></div>

      <div className="bg-red-600 text-black p-2 font-mono font-bold text-center uppercase tracking-[0.3em] text-xs">
        ！！！ system override: investigation consensus ！！！
      </div>

      {activePoll.status !== 'PENDING' ? (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-fade-in border-4 border-black">
           <h1 className={`text-3xl md:text-4xl font-cinzel text-white uppercase tracking-widest text-center shadow-[0_0_20px_rgba(255,255,255,0.5)] p-4 ${activePoll.status === 'ACCEPTED' ? 'bg-green-600/20' : 'bg-red-600/20'}`}>
             EVIDENCIA {activePoll.status === 'ACCEPTED' ? 'ACEPTADA' : 'RECHAZADA'}
           </h1>
           <p className="font-mono text-zinc-500 mt-4 animate-pulse uppercase tracking-[0.2em] text-[10px]">Cerrando protocolo...</p>
        </div>
      ) : null}

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
                style={{ width: `${((activePoll.yes_count || 0) / (totalStudents || 1)) * 100}%` }}
              />
              <div 
                className="h-full bg-red-500 transition-all duration-500" 
                style={{ width: `${((activePoll.no_count || 0) / (totalStudents || 1)) * 100}%` }}
              />
          </div>
        </div>

        {(!hasVoted && activePoll.initiator_id !== myCharacterId) ? (
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleVote(true)}
              disabled={isVoting}
              className={`py-3 border font-mono text-xs uppercase transition-all ${
                isVoting 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-600 grayscale opacity-50 cursor-not-allowed'
                : 'bg-green-950/20 border-green-500/50 text-green-500 hover:bg-green-500 hover:text-black'
              }`}
            >
              [ {isVoting ? 'VOTANDO...' : 'SÍ / ACEPTAR'} ]
            </button>
            <button 
              onClick={() => handleVote(false)}
              disabled={isVoting}
              className={`py-3 border font-mono text-xs uppercase transition-all ${
                isVoting 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-600 grayscale opacity-50 cursor-not-allowed'
                : 'bg-red-950/20 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black'
              }`}
            >
              [ {isVoting ? 'VOTANDO...' : 'NO / RECHAZAR'} ]
            </button>
          </div>
        ) : (
          <div className="text-center p-4 border-2 border-red-900/50 bg-black shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]">
            <p className="font-mono text-xs text-red-500 animate-pulse uppercase tracking-[0.2em] font-bold">
              {activePoll.initiator_id === myCharacterId 
                ? '>> REGISTRO PENDIENTE. ESPERANDO CONSENSO DE LOS DEMÁS...' 
                : '>> VOTO REGISTRADO. ESPERANDO RESOLUCIÓN DEL SISTEMA.'}
            </p>
          </div>
        )}

        {(activePoll.initiator_id === myCharacterId || canResolve) && (
          <button 
            onClick={handleResolve}
            disabled={isResolving}
            className={`w-full py-3 font-mono text-xs uppercase tracking-widest transition-all border ${
              canResolve 
                ? 'bg-red-600 border-red-400 text-black hover:scale-105 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                : 'bg-zinc-900 border-zinc-700 text-zinc-600 grayscale opacity-50 cursor-not-allowed'
            }`}
          >
            {isResolving ? 'PROCESANDO PROTOCOLO...' : 'RESOLVER PROTOCOLO DE INVESTIGACIÓN'}
          </button>
        )}
      </div>
    </div>
  );
}
