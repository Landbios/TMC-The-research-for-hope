'use client';

import { VNDialogBox } from '@/features/vn-ui/components/VNDialogBox';
import { useTmaStore } from '@/store/useTmaStore';

export function RoomNavigation() {
  const vnState = useTmaStore(state => state.vnState);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-end z-45">
      {/* Si hacemos clic en un jugador, esto lo invoca */}
      <VNDialogBox />
      
      {/* Caja de enviar chat público con burbuja flotante en 3D */}
      {!vnState.isActive && (
         <div className="absolute bottom-6 md:bottom-8 right-6 pointer-events-auto flex items-stretch gap-2 animate-fade-in-up">
           <input 
             type="text" 
             placeholder="Hablar en la sala..." 
             className="px-4 py-2 bg-black/70 backdrop-blur border border-(--glow) font-mono text-xs md:text-sm shadow-[0_0_15px_rgba(59,130,246,0.2)] text-(--glow) outline-none w-[250px] md:w-[350px]"
            />
            <button className="px-5 py-2 border border-(--glow) bg-(--glow)/10 text-(--glow) hover:bg-(--glow) hover:text-black transition-colors font-mono text-xs uppercase cursor-pointer tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              &gt;_ ENVIAR
            </button>
         </div>
      )}
    </div>
  );
}
