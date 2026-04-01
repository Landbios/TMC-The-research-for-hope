'use client';

import React from 'react';
import Image from 'next/image';
import { User, X } from 'lucide-react';

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
  messages: VNChatMessage[];  // Array of private messages (whispers) targeting or sent by the current user
  onClose: () => void;
}

export function VNChatOverlay({ messages, onClose }: VNChatOverlayProps) {
  if (!messages || messages.length === 0) return null;

  const lastMsg = messages[messages.length - 1];
  const isSystem = lastMsg.is_system_message;
  const speakerName = lastMsg.sender_name || 'Sistema';

  // Find the most recent message from a DIFFERENT character to display as the ghost on the left
  const prevMsg = [...messages].reverse().find(m => 
    m.sender_tma_id && 
    m.sender_tma_id !== lastMsg.sender_tma_id && 
    !m.is_system_message
  );

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
        {/* Sprites Area */}
        <div className="absolute bottom-0 w-full h-[600px] pointer-events-none flex items-end justify-center z-20 px-[10%] mb-32 md:mb-40">
          
          {/* Previous Speaker Sprite - Dimmed and Left */}
          {prevMsg && prevMsg.sprite_url && !isSystem && (
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
          {!isSystem && lastMsg.sprite_url && (
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

          {!isSystem && !lastMsg.sprite_url && (
             <div className="absolute bottom-0 right-[20%] w-[450px] h-[600px] flex justify-center items-end pb-10">
                <User size={200} className="text-blue-500/20 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
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
           <div className="relative group min-h-20">
             <p className="text-white text-lg md:text-xl leading-relaxed font-sans font-medium drop-shadow-[1px_1px_2px_rgba(0,0,0,0.5)] max-w-[90%]">
                {isSystem ? lastMsg.content : `"${lastMsg.content}"`}
             </p>
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
