'use client';

import { VNDialogBox } from '@/features/vn-ui/components/VNDialogBox';
import { useTmaStore } from '@/store/useTmaStore';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TMACharacterData } from '@/features/characters/api';
import { Monitor, MonitorOff } from 'lucide-react';

interface RoomNavigationProps {
  characters?: TMACharacterData[];
}

export function RoomNavigation({ characters = [] }: RoomNavigationProps) {
  const vnState = useTmaStore(state => state.vnState);
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const vnMode = useTmaStore(state => state.vnMode);
  const setVnMode = useTmaStore(state => state.setVnMode);
  
  const [text, setText] = useState('');
  const [targetId, setTargetId] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const params = useParams();
  const roomId = params?.roomId as string;

  const handleSend = async () => {
    if (!text.trim() || !myCharacterId || !roomId || isSending) return;
    setIsSending(true);
    const supabase = createClient();
    
    const { error } = await supabase.from('tma_messages').insert({
       tma_room_id: roomId,
       sender_tma_id: myCharacterId,
       target_tma_id: targetId || null,
       content: text.trim(),
       is_whisper: !!targetId,
       is_system_message: false
    });
    
    if (error) {
       console.error("Supabase Insert Error:", error);
       alert("Error enviando el mensaje: " + error.message);
    }
    
    setText('');
    setIsSending(false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-end z-45">
      {/* Si hacemos clic en un jugador, esto lo invoca */}
      <VNDialogBox />
      
      {/* Caja de enviar chat público con burbuja flotante en 3D */}
      {!vnState.isActive && (
         <div className="absolute bottom-6 md:bottom-8 right-6 pointer-events-auto flex items-stretch gap-2 animate-fade-in-up">
           
           {/* Toggle Modo VN (Charla Grupal) */}
           <button 
             onClick={() => setVnMode(vnMode === 'GROUP' ? 'WHISPER' : 'GROUP')}
             className={`px-3 flex items-center justify-center border transition-all duration-300 pointer-events-auto ${
               vnMode === 'GROUP' 
                 ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]' 
                 : 'bg-black/70 border-(--glow) text-(--glow)/50 hover:text-(--glow)'
             }`}
             title={vnMode === 'GROUP' ? "Desactivar Modo VN" : "Activar Modo VN (Charla Grupal)"}
           >
             {vnMode === 'GROUP' ? <Monitor size={18} /> : <MonitorOff size={18} />}
           </button>

           {/* Selector de Objetivo (Susurros) */}
           <div className="flex gap-1">
             <select
               value={targetId}
               onChange={(e) => setTargetId(e.target.value)}
               className="px-2 py-2 bg-black/70 backdrop-blur border border-(--glow) font-mono text-[9px] uppercase shadow-[0_0_15px_rgba(59,130,246,0.2)] text-(--glow) outline-none md:w-[150px] cursor-pointer"
               title="Seleccionar Canal"
             >
               <option value="">🗣️ PÚBLICO (SALA)</option>
               {characters.map(c => (
                  <option key={c.id} value={c.id}>Susurro: {c.tma_name}</option>
               ))}
             </select>
             
             {targetId && (
               <button 
                 onClick={() => setTargetId('')}
                 className="px-3 border border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black transition-colors font-mono tracking-wider font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)] cursor-pointer text-xs"
                 title="Cancelar Susurro"
               >
                 X
               </button>
             )}
           </div>

           <input 
             type="text" 
             value={text}
             onChange={e => setText(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && handleSend()}
             placeholder={targetId ? "Susurrar mensaje privado..." : "Hablar al resto de la sala..."}
             className="px-4 py-2 bg-black/70 backdrop-blur border border-(--glow) font-mono text-xs md:text-sm shadow-[0_0_15px_rgba(59,130,246,0.2)] text-(--glow) outline-none w-[200px] md:w-[350px] disabled:opacity-50"
             disabled={isSending}
            />
            <button 
               onClick={handleSend}
               disabled={isSending || !text.trim()}
               className="px-5 py-2 border border-(--glow) bg-(--glow)/10 text-(--glow) hover:bg-(--glow) hover:text-black transition-colors font-mono text-xs uppercase cursor-pointer tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;_ ENVIAR
            </button>
         </div>
      )}
    </div>
  );
}
