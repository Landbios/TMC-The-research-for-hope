'use client';

import { useState, useEffect, useRef } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { createClient } from '@/lib/supabase/client';
import { Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_tma_id: string;
  content: string;
  is_whisper: boolean;
  is_system_message: boolean;
  created_at: string;
  sender?: {
    tma_name: string;
    image_url: string;
  };
}

export function VerticalChatLog() {
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const selectedRoomId = useTmaStore(state => state.selectedRoomId);
  const [activeChannel, setActiveChannel] = useState<'GLOBAL' | 'LOCAL'>('GLOBAL');
  
  const currentRoomId = activeChannel === 'GLOBAL' 
    ? '00000000-0000-0000-0000-000000000000' 
    : selectedRoomId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (instant = false) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: instant ? 'instant' : 'smooth'
      });
    }
  };

  useEffect(() => {
    if (!currentRoomId) {
      return;
    }
    
    const supabase = createClient();
    
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('tma_messages')
        .select(`
          id,
          sender_tma_id,
          content,
          is_whisper,
          is_system_message,
          created_at,
          sender:tma_characters!tma_messages_sender_tma_id_fkey (
            tma_name,
            image_url
          )
        `)
        .eq('tma_room_id', currentRoomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error fetching chat history:', error);
        toast.error('Error al sincronizar historial de red');
      } else if (data) {
        setMessages(data as unknown as Message[]);
      }
      setLoading(false);
      scrollToBottom();
    };

    fetchHistory();

    // Subscribe to new messages
    const channel = supabase.channel(`vertical_chat_${currentRoomId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'tma_messages',
        filter: `tma_room_id=eq.${currentRoomId}`
      }, async (payload) => {
        const msg = payload.new as Message;
        
        let senderData = null;
        if (!msg.is_system_message && msg.sender_tma_id) {
           const { data } = await supabase
             .from('tma_characters')
             .select('tma_name, image_url')
             .eq('id', msg.sender_tma_id)
             .maybeSingle();
           senderData = data;
        }

        const fullMsg = { 
           ...msg, 
           sender: senderData as { tma_name: string; image_url: string } 
        };
        
        setMessages(prev => [...prev, fullMsg]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoomId]);


  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !myCharacterId || !currentRoomId || isSending) return;
    
    setIsSending(true);
    const supabase = createClient();
    const { error } = await supabase.from('tma_messages').insert({
      tma_room_id: currentRoomId,
      sender_tma_id: myCharacterId,
      content: inputText.trim(),
      is_whisper: false,
      is_system_message: false
    });

    if (error) {
       toast.error('Error al enviar mensaje');
    } else {
       setInputText('');
    }
    setIsSending(false);
    scrollToBottom();
  };

  if (loading) return <div className="h-full flex items-center justify-center font-mono text-[10px] text-blue-500 animate-pulse uppercase">Conectando con red troncal...</div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
            {/* Channel Switcher */}
      <div className="flex gap-2 p-2 border-b border-blue-500/10 bg-black/20">
         <button 
           onClick={() => setActiveChannel('GLOBAL')}
           className={`flex-1 py-1 font-mono text-[9px] uppercase tracking-widest border transition-all ${
             activeChannel === 'GLOBAL' 
               ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
               : 'bg-transparent border-zinc-800 text-zinc-600 hover:border-blue-500/30'
           }`}
         >
           [RED_GLOBAL]
         </button>
         <button 
           onClick={() => setActiveChannel('LOCAL')}
           className={`flex-1 py-1 font-mono text-[9px] uppercase tracking-widest border transition-all ${
             activeChannel === 'LOCAL' 
               ? 'bg-green-600/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
               : 'bg-transparent border-zinc-800 text-zinc-600 hover:border-green-500/30'
           }`}
         >
           [SECTOR_LOCAL]
         </button>
      </div>

      {/* Messages Log */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar relative"
      >
        <button 
           onClick={() => scrollToBottom()}
           className="sticky top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-blue-600/20 border border-blue-500/50 backdrop-blur-md rounded-full text-[8px] text-blue-400 uppercase tracking-widest opacity-0 hover:opacity-100 transition-opacity"
        >
           Sincronizar Scroll
        </button>
        {messages.length === 0 && (
          <p className="text-center font-mono text-[8px] text-zinc-600 uppercase py-10 italic">
            Sin transmisiones registradas en este sector.
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_tma_id === myCharacterId;
          const isSystem = msg.is_system_message;
          
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isSystem ? 'items-center w-full' : ''}`}
            >
              {!isSystem && (
                 <span className="font-mono text-[7px] text-zinc-500 mb-0.5 px-1 uppercase">
                    {msg.sender?.tma_name || 'Estudiante'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
              )}
              <div className={`
                max-w-[85%] px-3 py-2 text-[11px] font-sans
                ${isSystem ? 'bg-red-500/5 border border-red-500/20 text-red-500 italic text-[10px]' : 
                  (isMe ? `${activeChannel === 'GLOBAL' ? 'bg-blue-600/20 border-blue-500/30 text-blue-100' : 'bg-green-600/20 border-green-500/30 text-green-100'} rounded-l-md rounded-br-sm` : 
                   'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-r-md rounded-bl-sm')}
              `}>
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="mt-2 border-t border-blue-500/20 pt-3">
         <div className="relative flex items-center">
            <input 
              type="text" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Transmitir en la red local..."
              className="w-full bg-black/40 border border-blue-500/30 p-2.5 pr-12 font-mono text-[11px] text-white focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
              disabled={isSending}
            />
            <button 
              onClick={handleSend}
              disabled={isSending || !inputText.trim()}
              className="absolute right-2 p-1.5 text-blue-500 hover:text-blue-400 disabled:opacity-30 transition-colors"
            >
              <Send size={18} />
            </button>
         </div>
         <div className="flex justify-between mt-1 px-1">
            <span className="font-mono text-[7px] text-blue-500/50 uppercase tracking-tighter flex items-center gap-1">
              <MessageSquare size={8} /> RED: ${activeChannel === 'GLOBAL' ? 'GLOBAL_COMM' : 'SECTOR_LINK'}
            </span>
            <span className="font-mono text-[7px] text-green-500 uppercase tracking-tighter">ESTADO: ${activeChannel === 'GLOBAL' ? 'PÚBLICO' : 'ENCRIPTADO_SECTOR'}</span>
         </div>
      </div>
    </div>
  );
}
