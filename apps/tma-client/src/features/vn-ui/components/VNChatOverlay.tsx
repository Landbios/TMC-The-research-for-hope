'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User, X, Zap, Trash2, Monitor, Loader2 } from 'lucide-react';
import { useTmaStore } from '@/store/useTmaStore';
import { startEvidencePoll } from '@/features/investigation/api';
import { toast } from 'sonner';

export interface VNChatMessage {
  id: string;
  sender_tma_id: string;
  sender_name: string;
  target_tma_id?: string;
  content: string;
  is_whisper: boolean;
  is_system_message: boolean;
  sprite_url?: string;
  scale?: number;
  position_y?: number;
}

interface VNChatOverlayProps {
  messages: VNChatMessage[];
  onClose: () => void;
  clueData?: import('@/features/investigation/api').TMAEvidence;
}

export function VNChatOverlay({ messages, onClose, clueData }: VNChatOverlayProps) {
  const [isStartingPoll, setIsStartingPoll] = useState(false);
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const investigationPoints = useTmaStore(state => state.investigationPoints);
  const vnMode = useTmaStore(state => state.vnMode);

  const isClueMode = !!clueData;
  const isMessageMode = messages && messages.length > 0;
  const isGroupActive = vnMode === 'GROUP';

  // Solo retornamos null si no hay pista, no hay mensajes, y NO estamos explícitamente en modo grupo
  if (!isClueMode && !isMessageMode && !isGroupActive) return null;

  const lastMsg = isMessageMode ? messages[messages.length - 1] : null;
  const isSystem = lastMsg?.is_system_message || isClueMode || (!isMessageMode && isGroupActive);
  const speakerName = isClueMode ? clueData.title : (lastMsg?.sender_name || 'Sistema');

  // Find the most recent message from a DIFFERENT character to display as the ghost on the left
  const prevMsg = isMessageMode ? [...messages].reverse().find(m => 
    m.sender_tma_id && 
    lastMsg && m.sender_tma_id !== lastMsg.sender_tma_id && 
    !m.is_system_message
  ) : null;

  const handleProposeEvidence = async () => {
     if (!clueData || !myCharacterId || isStartingPoll) return;
     if (investigationPoints < 1) {
        toast.error('ENERGÍA INSUFICIENTE (IP)');
        return;
     }

     try {
        setIsStartingPoll(true);
        await startEvidencePoll(clueData.id, myCharacterId);
        toast.success('PROTOCOLO DE CONSENSO INICIADO');
        onClose();
     } catch (err) {
        console.error("Error starting evidence poll:", err);
        toast.error('ERROR EN EL PROTOCOLO');
     } finally {
        setIsStartingPoll(false);
     }
  };

  return (
    <div className="absolute inset-0 z-40 pointer-events-auto flex flex-col justify-end overflow-hidden animate-fade-in">
      
      {/* Background Dimmer */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-500 z-0"></div>
      
      {/* Close Button Top Right */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-black/80 border border-red-500/50 text-red-500 px-4 py-2 hover:bg-red-500/20 transition-all font-mono text-xs uppercase tracking-widest rounded-sm"
      >
        <X size={14} /> Cerrar Conexión Segura
      </button>

      {/* Cinematic Corner Accents */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-(--glow)/40 after:absolute after:top-[-2px] after:left-[-2px] after:w-2 after:h-2 after:bg-(--glow) z-10 pointer-events-none"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-(--glow)/40 after:absolute after:top-[-2px] after:right-[-2px] after:w-2 after:h-2 after:bg-(--glow) z-10 pointer-events-none"></div>

      <div className="relative w-full flex flex-col justify-end mt-auto pointer-events-none h-full">
        {/* Sprites / Clue Area */}
        <div className="absolute bottom-0 w-full h-[600px] pointer-events-none flex items-end justify-center z-20 px-[10%] mb-32 md:mb-40">
          
          {/* CLUE MODE: Large Central Evidence Image */}
          {isClueMode && (
             <div className="absolute bottom-20 w-[500px] h-[500px] transition-all duration-700 animate-in zoom-in-95 fade-in">
                <div className="relative w-full h-full p-8 bg-zinc-950/40 border border-red-500/30 backdrop-blur-sm">
                   <Image 
                     src={clueData.image_url || 'https://picsum.photos/seed/clue/600/600'} 
                     alt={clueData.title}
                     fill
                     className="object-contain p-4 drop-shadow-[0_0_40px_rgba(239,68,68,0.3)]"
                   />
                   {/* Scanline overlay for clue */}
                   <div className="absolute inset-0 bg-linear-to-b from-transparent via-red-500/5 to-transparent h-1 w-full animate-scanline opacity-20 pointer-events-none"></div>
                </div>
                {/* Discovery Tag */}
                <div className="absolute -top-4 -left-4 bg-red-600 text-white font-mono text-[10px] px-3 py-1 uppercase tracking-tighter shadow-lg -rotate-2">
                   Hallazgo Crítico Detectado
                </div>
             </div>
          )}

          {/* CHAT MODE: Multi-sprite layout */}
          {!isClueMode && isMessageMode && (
             <>
                {/* Previous Speaker Sprite - Dimmed and Left */}
                {prevMsg && prevMsg.sprite_url && (
                  <div 
                    className="absolute bottom-0 left-[12%] w-[400px] h-[550px] transition-all duration-700 ease-in-out brightness-[0.35] contrast-[1.1] z-10"
                    style={{ 
                      transform: `scale(${prevMsg.scale ?? 0.9}) translateY(${(prevMsg.position_y ?? 0) * -1}px) translateX(-20px)`, 
                      transformOrigin: 'bottom center' 
                    }}
                  >
                    <Image 
                      src={prevMsg.sprite_url} 
                      alt="Previous Speaker" 
                      fill
                      className="object-contain object-bottom" 
                    />
                  </div>
                )}

                {/* Current Speaker Sprite - Bright and Right/Center */}
                {lastMsg && lastMsg.sprite_url && (
                  <div 
                    className="absolute bottom-0 right-[12%] w-[450px] h-[600px] pointer-events-auto transition-all duration-500 z-20 animate-in fade-in slide-in-from-bottom-5"
                    style={{ 
                      transform: `scale(${lastMsg.scale ?? 1.0}) translateY(${(lastMsg.position_y ?? 0) * -1}px)`, 
                      transformOrigin: 'bottom center' 
                    }}
                  >
                    <Image 
                      src={lastMsg.sprite_url} 
                      alt={speakerName} 
                      fill
                      className="object-contain object-bottom drop-shadow-[0_0_30px_rgba(0,0,0,0.9)]" 
                    />
                  </div>
                )}

                {lastMsg && !lastMsg.sprite_url && (
                   <div className="absolute bottom-0 right-[20%] w-[450px] h-[600px] flex justify-center items-end pb-10">
                      <User size={200} className="text-blue-500/20 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
                   </div>
                )}
             </>
          )}

          {/* GRUPO VACÍO: Mostramos un estado de espera cinemática */}
          {isGroupActive && !isMessageMode && !isClueMode && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-32 md:mb-40">
                <div className="flex flex-col items-center gap-6 animate-pulse">
                   <Monitor size={80} className="text-(--glow)/30" />
                   <div className="flex items-center gap-3">
                      <Loader2 size={16} className="text-(--glow) animate-spin" />
                      <span className="font-mono text-xs uppercase tracking-[0.5em] text-(--glow)/50">
                         Sintonizando Canal Grupal
                      </span>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Text Box - Full Width, elevated slightly above RoomNavigation */}
        <div className="w-full bg-[#0a0a0a]/95 backdrop-blur-3xl p-8 pb-12 shadow-[0_-10px_60px_rgba(0,0,0,0.8)] relative overflow-hidden pointer-events-auto z-30 min-h-[180px] transition-all duration-500 border-t border-(--glow)/30 mb-20 md:mb-24">
         
         {/* Top Scanline effect */}
         <div className="absolute top-0 left-0 w-full h-px shadow-[0_0_10px_var(--glow)] bg-(--glow)/50"></div>
         
         {/* Subtle Gradient Shadow */}
         <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/20 to-transparent pointer-events-none"></div>
         
         <div className="flex flex-col gap-4 relative max-w-7xl mx-auto">
           {/* Speaker Name Label - Cinematic Style */}
           {!isSystem && (
             <div className="inline-block self-start mb-1">
               <h3 className="text-(--glow) font-serif italic text-2xl md:text-3xl font-extrabold tracking-[0.08em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-b-2 border-(--glow)/30 pb-1">
                 {speakerName}
               </h3>
             </div>
           )}

           {isSystem && (
             <div className="inline-block self-start mb-1">
               <h3 className="text-red-500 font-mono text-xl font-bold tracking-widest uppercase px-3 py-1 bg-red-500/10 border border-red-500/30">
                 SISTEMA
               </h3>
             </div>
           )}
           
           {/* Message Content */}
           <div className="relative group min-h-20 flex justify-between items-start">
             <div className="max-w-[70%]">
                <p className="text-white text-lg md:text-xl leading-relaxed font-sans font-medium drop-shadow-[1px_1px_2px_rgba(0,0,0,0.5)]">
                   {isClueMode 
                     ? clueData.description_brief 
                     : (isMessageMode 
                         ? (isSystem ? lastMsg?.content : `"${lastMsg?.content}"`)
                         : "Protocolo de Charla Grupal Iniciado. Esperando transmisiones de otros estudiantes en esta zona..."
                       )
                   }
                </p>
                {isClueMode && (
                   <p className="text-red-400 font-mono text-[10px] mt-2 uppercase tracking-widest animate-pulse">
                      &gt;&gt; PROTOCOLO DE INVESTIGACIÓN REQUERIDO
                   </p>
                )}
             </div>

             {/* Action Buttons for Clue Mode */}
             {isClueMode && (
                <div className="flex flex-col gap-3">
                   <button 
                     onClick={handleProposeEvidence}
                     disabled={isStartingPoll}
                     className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-mono text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50"
                   >
                      <Zap size={16} fill="white" /> {isStartingPoll ? 'Iniciando...' : 'Proponer Evidencia'}
                   </button>
                   <button 
                     onClick={onClose}
                     className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 font-mono text-xs uppercase tracking-widest flex items-center gap-3 transition-all"
                   >
                      <Trash2 size={16} /> Ignorar Hallazgo
                   </button>
                </div>
             )}
           </div>
         </div>
         
         {/* Cinematic corner decorations */}
         <div className="absolute bottom-6 right-6 opacity-40 flex gap-2">
            <div className="w-1.5 h-1.5 bg-(--glow) rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            <div className="w-12 h-px bg-(--glow) self-center"></div>
         </div>
       </div>
      </div>
    </div>
  );
}
