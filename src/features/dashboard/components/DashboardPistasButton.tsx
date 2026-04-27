'use client';

import { useState } from 'react';
import { InvestigationLog } from '../../investigation/components/InvestigationLog';

export function DashboardPistasButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="sci-border p-2 flex flex-col items-center justify-center hover:bg-(--glow)/5 transition-colors group relative h-full min-h-[140px]"
      >
        <span className="font-mono text-[9px] opacity-80 self-start absolute top-2 left-2"> [ PISTAS ] </span>
        <div className="relative mt-4">
          <svg className="w-12 h-12 stroke-(--glow) opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" strokeWidth="1.5" />
            <line x1="16.5" y1="16.5" x2="22" y2="22" strokeWidth="2" strokeLinecap="round" />
            <path d="M6,11 L8.5,11 L9.5,8 L11.5,15 L12.5,11 L16,11" strokeWidth="1.5" stroke="#4ade80" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="w-full h-px bg-(--glow)/50 absolute bottom-3 right-0"><div className="w-1.5 h-1.5 bg-(--glow) absolute -top-[2px] right-2 rounded-full" /></div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 md:p-10 pointer-events-none">
          <div className="w-full h-full max-w-5xl pointer-events-auto bg-black border-2 border-(--glow) shadow-[0_0_50px_rgba(59,130,246,0.2)] animate-scale-in relative">
             <button 
               onClick={() => setIsOpen(false)}
               className="absolute -top-10 right-0 text-(--glow) font-mono text-xs uppercase hover:text-white"
             >
               [ SALIR / CERRAR ]
             </button>
             
             <div className="w-full h-full overflow-hidden">
                <InvestigationLog />
             </div>

             {/* Adornos Glitch */}
             <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-(--glow) -translate-x-1 -translate-y-1" />
             <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-(--glow) translate-x-1 translate-y-1" />
          </div>
          
          {/* Backdrop con click para cerrar */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto -z-10" 
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
}
