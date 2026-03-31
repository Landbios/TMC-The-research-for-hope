'use client';

import { VNDialogBox } from '@/features/vn-ui/components/VNDialogBox';
import { useTmaStore } from '@/store/useTmaStore';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function RoomNavigation() {
  const vnState = useTmaStore(state => state.vnState);
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const params = useParams();
  const roomId = params?.roomId as string;

  const handleSend = async () => {
    if (!text.trim() || !myCharacterId || !roomId || isSending) return;
    setIsSending(true);
    const supabase = createClient();
    
    await supabase.from('tma_messages').insert({
       room_id: roomId,
       character_id: myCharacterId,
       content: text.trim(),
       message_type: 'public'
    });
    
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
           <input 
             type="text" 
             value={text}
             onChange={e => setText(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && handleSend()}
             placeholder="Hablar en la sala..." 
             className="px-4 py-2 bg-black/70 backdrop-blur border border-(--glow) font-mono text-xs md:text-sm shadow-[0_0_15px_rgba(59,130,246,0.2)] text-(--glow) outline-none w-[250px] md:w-[350px] disabled:opacity-50"
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
