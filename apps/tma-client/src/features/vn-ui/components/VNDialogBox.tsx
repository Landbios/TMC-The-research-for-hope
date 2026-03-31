'use client';
import { useEffect, useState } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { useRouter } from 'next/navigation';

export function VNDialogBox() {
  const vnState = useTmaStore((state) => state.vnState);
  const setVnState = useTmaStore((state) => state.setVnState);
  const selectedRoomId = useTmaStore((state) => state.selectedRoomId);
  const setSelectedRoomId = useTmaStore((state) => state.setSelectedRoomId);
  const [displayedText, setDisplayedText] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    setDisplayedText(''); 
    if (!vnState.text || !vnState.isActive) return;
    
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(vnState.text!.slice(0, i + 1));
      i++;
      if (i >= vnState.text!.length) {
        clearInterval(intervalId);
      }
    }, 25); // Velocidad clásica VN
    
    return () => clearInterval(intervalId);
  }, [vnState.text, vnState.isActive]);

  const handleClose = () => {
    setVnState({ isActive: false });
    setSelectedRoomId(null);
  };

  const handleEnterRoom = () => {
    if (selectedRoomId) {
      router.push(`/rooms/${selectedRoomId}`);
    }
  };

  if (!vnState.isActive) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 pointer-events-auto animate-fade-in-up">
      {/* Etiqueta del Hablante */}
      {vnState.speaker && (
        <div className="absolute -top-7 left-4 bg-indigo-950/90 border-2 border-(--glow) px-6 py-1 z-10 skew-x-[-15deg] shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-sm">
          <span className="font-mono text-base md:text-lg font-bold text-blue-100 uppercase transform skew-x-15 inline-block tracking-widest text-shadow">
            {vnState.speaker}
          </span>
        </div>
      )}
      
      {/* Contenedor principal de texto */}
      <div className="bg-black/85 backdrop-blur-md border-[1.5px] border-(--glow) p-5 md:p-6 min-h-[140px] relative shadow-[inset_0_0_20px_rgba(59,130,246,0.1),0_0_20px_rgba(59,130,246,0.2)] flex flex-col justify-between">
        
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-(--glow) -translate-x-px -translate-y-px" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-(--glow) translate-x-px translate-y-px" />

        <p className="font-mono text-base md:text-lg text-blue-50 leading-relaxed min-h-16">
          {displayedText}
          <span className="animate-pulse ml-1 opacity-70">_</span>
        </p>

        {/* Botonera VN */}
        <div className="self-end flex gap-4 mt-3">
           <button 
             onClick={handleEnterRoom}
             className="px-4 py-1.5 border border-(--glow) text-(--glow) font-mono text-xs uppercase hover:bg-(--glow) hover:text-black transition-colors shadow-[0_0_10px_rgba(59,130,246,0.2)]"
           >
             [ ENTRAR A LA SALA ]
           </button>
           <button 
             onClick={handleClose}
             className="px-4 py-1.5 border border-red-500/50 text-red-500 font-mono text-xs uppercase hover:bg-red-500/20 transition-colors"
           >
             [ CANCELAR ]
           </button>
        </div>
      </div>
    </div>
  );
}
