'use client';

import { useState, useEffect } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { submitPrivacyVote, resolvePrivacyPoll } from '../privacy_api';
import { Shield, X, Check, Timer } from 'lucide-react';

export function PrivacyPollModal() {
  const activePrivacyPoll = useTmaStore(state => state.activePrivacyPoll);
  const setActivePrivacyPoll = useTmaStore(state => state.setActivePrivacyPoll);
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const setSelectedRoomId = useTmaStore(state => state.setSelectedRoomId);
  
  const [hasVoted, setHasVoted] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (activePrivacyPoll) {
      setHasVoted(false);
      
      const expiry = new Date(activePrivacyPoll.expires_at).getTime();
      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
        setTimeLeft(remaining);
      };
      
      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [activePrivacyPoll]);

  // Auto-cerrar si el poll ya no está pendiente (resolución en tiempo real)
  useEffect(() => {
    if (activePrivacyPoll && activePrivacyPoll.status !== 'PENDING') {
      const timer = setTimeout(() => {
        setActivePrivacyPoll(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activePrivacyPoll, setActivePrivacyPoll]);

  if (!activePrivacyPoll || !myCharacterId) return null;

  const handleVote = async (vote: boolean) => {
    if (hasVoted) return;
    try {
      await submitPrivacyVote(activePrivacyPoll.id, myCharacterId, vote);
      setHasVoted(true);
      
      // Si el usuario vota que NO, debe abandonar la sala (según requerimiento)
      if (vote === false) {
         setSelectedRoomId(null);
         setActivePrivacyPoll(null);
      }
    } catch (error) {
      console.error('Error voting privacy:', error);
    }
  };

  const majority = Math.floor(activePrivacyPoll.total_voters / 2) + 1;
  const isAccepted = activePrivacyPoll.yes_count >= majority;
  const isRejected = activePrivacyPoll.no_count >= majority || (activePrivacyPoll.yes_count + activePrivacyPoll.no_count >= activePrivacyPoll.total_voters && !isAccepted);

  const handleResolve = async () => {
    if (isResolving) return;
    try {
      setIsResolving(true);
      await resolvePrivacyPoll(
        activePrivacyPoll.id, 
        activePrivacyPoll.room_id, 
        isAccepted ? 'ACCEPTED' : 'REJECTED'
      );
      setActivePrivacyPoll(null);
    } catch (error) {
      console.error('Error resolving privacy poll:', error);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm bg-[#050505] border border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] p-6 relative overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* CRT Overlay */}
        <div className="absolute inset-0 pointer-events-none crt-scanline opacity-20"></div>

        <div className="flex flex-col gap-5 relative z-10">
          <div className="flex items-center gap-3 border-b border-blue-500/30 pb-3">
            <Shield className="text-blue-500 animate-pulse" size={24} />
            <div>
              <h3 className="font-mono text-sm font-bold text-blue-400 tracking-widest uppercase">
                PROTOCOLO DE PRIVACIDAD
              </h3>
              <p className="font-mono text-[9px] text-blue-500/70 tracking-tighter uppercase">
                ESTABLECIENDO CONEXIÓN SEGURA...
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-xs text-white leading-relaxed text-justify">
              UN ESTUDIANTE HA PROPUESTO CERRAR ESTA SALA PARA UNA CHARLA PRIVADA. SI ACEPTAS, LA SALA SERÁ ENCRIPTADA. SI RECHAZAS, DEBERÁS ABANDONAR EL ÁREA.
            </p>
            
            <div className="flex items-center justify-between font-mono text-[10px] text-blue-500/80 uppercase">
              <div className="flex items-center gap-1">
                <Timer size={12} className="animate-spin-slow" />
                TIEMPO LÍMITE: {timeLeft}s
              </div>
              <div className="text-right">
                MAYORÍA REQUERIDA: {majority}
              </div>
            </div>
          </div>

          {/* Votación Progreso */}
          <div className="h-1.5 w-full bg-blue-900/20 flex rounded-full overflow-hidden">
             <div 
               className="h-full bg-blue-500 transition-all duration-500" 
               style={{ width: `${(activePrivacyPoll.yes_count / activePrivacyPoll.total_voters) * 100}%` }}
             />
             <div 
               className="h-full bg-red-500 transition-all duration-500" 
               style={{ width: `${(activePrivacyPoll.no_count / activePrivacyPoll.total_voters) * 100}%` }}
             />
          </div>

          {!hasVoted && activePrivacyPoll.initiator_id !== myCharacterId ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => handleVote(true)}
                className="flex items-center justify-center gap-2 py-3 border border-blue-500/50 bg-blue-500/10 text-blue-400 font-mono text-[10px] uppercase hover:bg-blue-500 hover:text-black transition-all"
              >
                <Check size={14} /> ACEPTAR
              </button>
              <button 
                onClick={() => handleVote(false)}
                className="flex items-center justify-center gap-2 py-3 border border-red-500/50 bg-red-500/10 text-red-500 font-mono text-[10px] uppercase hover:bg-red-500 hover:text-black transition-all"
              >
                <X size={14} /> RECHAZAR
              </button>
            </div>
          ) : (
             <div className="py-4 border border-blue-500/30 bg-blue-500/5 text-center">
                 <p className="font-mono text-[10px] text-blue-400 animate-pulse uppercase tracking-[0.2em]">
                   {activePrivacyPoll.status !== 'PENDING' 
                     ? `PROTOCOLO ${activePrivacyPoll.status}` 
                     : activePrivacyPoll.initiator_id === myCharacterId 
                       ? 'ESPERANDO CONSENSO...' 
                       : 'VOTO REGISTRADO.'}
                 </p>
              </div>
          )}

          {/* Automática resolución si hay mayoría o tiempo agotado */}
          {(isAccepted || isRejected || timeLeft === 0) && activePrivacyPoll.initiator_id === myCharacterId && (
            <button 
              onClick={handleResolve}
              disabled={isResolving}
              className="w-full py-2 bg-blue-600 text-black font-mono text-xs font-bold uppercase hover:bg-blue-400 transition-all animate-pulse"
            >
              {isResolving ? 'PROCESANDO...' : 'RESOLVER PROTOCOLO'}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
