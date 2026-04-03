'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTmaStore } from '@/store/useTmaStore';
import { createClient } from '@/lib/supabase/client';
import { CharacterSprite3D } from './CharacterSprite3D';
import { RoomNavigation } from './RoomNavigation';
import type { TMACharacterData } from '@/features/characters/api';
import { VNChatOverlay } from '@/features/vn-ui/components/VNChatOverlay';
import { RoomCube } from './RoomCube';
import { EvidenceSprite3D } from './EvidenceSprite3D';
import { getRoomClues, TMAEvidence } from '@/features/investigation/api';
import { PrivacyPollModal } from './PrivacyPollModal';
import { StealthEntryDialog } from './StealthEntryDialog';
import { startPrivacyPoll, updateRoomPrivacy } from '../privacy_api';
import { Zap, Shield, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';

const PLACEHOLDER_IMG_1 = 'https://picsum.photos/seed/dangan1/400/600';

// Función auxiliar para esparcir personajes en la sala
function getPositionForIndex(index: number): [number, number, number] {
  const angle = index * (Math.PI / 4) + Math.PI; 
  const radius = 6 + (index % 2); // Variar un poco el radio
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 2];
}

export function InsideRoomArena() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const [characters, setCharacters] = useState<TMACharacterData[]>([]);
  const [clues, setClues] = useState<TMAEvidence[]>([]);
  
  const [showStealthEntry, setShowStealthEntry] = useState(false);
  const [isStealthing, setIsStealthing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const gamePeriod = useTmaStore((state) => state.gamePeriod);
  const setVnState = useTmaStore((state) => state.setVnState);
  
  const addVnWhisper = useTmaStore((state) => state.addVnWhisper);
  const addVnGroupMessage = useTmaStore((state) => state.addVnGroupMessage);
  const vnWhispers = useTmaStore((state) => state.vnWhispers);
  const activeGroupMessages = useTmaStore((state) => state.activeGroupMessages);
  const clearVnWhispers = useTmaStore((state) => state.clearVnWhispers);
  const clearVnGroupMessages = useTmaStore((state) => state.clearVnGroupMessages);
  
  const vnMode = useTmaStore((state) => state.vnMode);
  const setVnMode = useTmaStore((state) => state.setVnMode);
  const activeClue = useTmaStore((state) => state.activeClue);
  const setActiveClue = useTmaStore((state) => state.setActiveClue);

  const setActivePrivacyPoll = useTmaStore((state) => state.setActivePrivacyPoll);
  const activePrivacyPoll = useTmaStore((state) => state.activePrivacyPoll);
  const myCharacterId = useTmaStore((state) => state.myCharacterId);
  const setSelectedRoomId = useTmaStore((state) => state.setSelectedRoomId);
  
  const isNight = gamePeriod === 'NIGHTTIME';

  useEffect(() => {
    if (!roomId || roomId === 'UNKNOWN_SECTOR') return;
    let mounted = true;
    const supabase = createClient();
    
    // Carga inicial
    const fetchChars = async () => {
      // Obtenemos al personaje local para ocultar su propio cuerpo
      const { data: { user } } = await supabase.auth.getUser();
      const { data: myCharData } = await supabase.from('tma_characters').select('*').eq('user_id', user?.id).limit(1).single();
      const currentCharacterId = myCharData?.id;
      
      if (myCharData) {
         useTmaStore.getState().setCharacterData(myCharData as TMACharacterData);
         
         // 1. Verificar estado de privacidad
         const { data: roomData } = await supabase.from('tma_rooms').select('is_private').eq('id', roomId).single();
         if (roomData && mounted) setIsPrivate(roomData.is_private);

         // 2. Decidir si mostrar dialogo de sigilo
         if ((roomData?.is_private) && !isStealthing) {
            setShowStealthEntry(true);
         } else {
            // Si no hay necesidad de sigilo, actualizamos nuestra ubicación directamente
            await supabase.from('tma_characters').update({ current_room_id: roomId, is_hidden: false }).eq('id', currentCharacterId);
         }
      }

      const { data } = await supabase.from('tma_characters').select('*').eq('current_room_id', roomId);
      if (data && mounted) {
        // Solo ver personajes que NO estén ocultos (excepto yo que ya estoy filtrado)
        setCharacters(data.filter(c => c.id !== currentCharacterId && !c.is_hidden) as TMACharacterData[]);
      }

      // Carga de pistas
      if (mounted) {
        const roomClues = await getRoomClues(roomId);
        setClues(roomClues);
      }
      
      if (!mounted) return;

      // 1. Suscripción a Personajes
      supabase.channel(`room_chars_${roomId}_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tma_characters' }, (payload) => {
           const char = payload.new as TMACharacterData | undefined;
           if (!char) return; 

           // Jamás renderizamos nuestra propia entidad en 3D
            if (char.id === currentCharacterId) return;

            if (char.current_room_id === roomId && !char.is_hidden) {
               setCharacters(prev => {
                  if(prev.find(c => c.id === char.id)) return prev.map(c => c.id === char.id ? char : c);
                  return [...prev, char];
               });
            } else {
               setCharacters(prev => prev.filter(c => c.id !== char.id));
            }
          })
         .subscribe();

      // 2. Suscripción a Polls de Privacidad
      supabase.channel(`privacy_polls_${roomId}_${Date.now()}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tma_room_privacy_polls', filter: `room_id=eq.${roomId}` }, (payload) => {
           const poll = payload.new as import('@/store/useTmaStore').TMARoomPrivacyPoll;
           if (poll.status === 'PENDING' && mounted) {
              setActivePrivacyPoll(poll);
           }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tma_room_privacy_polls', filter: `room_id=eq.${roomId}` }, (payload) => {
           const poll = payload.new as import('@/store/useTmaStore').TMARoomPrivacyPoll;
           if (mounted) setActivePrivacyPoll(poll);
        })
        .subscribe();

      // 3. Suscripción a la propia Sala (Estado de Privacidad)
      supabase.channel(`room_meta_${roomId}_${Date.now()}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tma_rooms', filter: `id=eq.${roomId}` }, (payload) => {
           const room = payload.new as { is_private: boolean };
           if (mounted) setIsPrivate(room.is_private);
        })
        .subscribe();

      // 4. Suscripción a Mensajes (Burbujas Flotantes y VN-UI)
      supabase.channel(`chat_messages_${roomId}_${Date.now()}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tma_messages', filter: `tma_room_id=eq.${roomId}` }, (payload) => {
           const msg = payload.new as {
              id: string;
              is_whisper: boolean;
              is_system_message: boolean;
              sender_tma_id: string;
              target_tma_id?: string;
              content: string;
           } | undefined;
           if (!msg) return; 

           const isForMeOrByMe = msg.sender_tma_id === currentCharacterId || msg.target_tma_id === currentCharacterId || !msg.target_tma_id;
           
           if (msg.is_whisper && isForMeOrByMe) {
              let senderName = 'Sistema';
              let spriteUrl: string | undefined = undefined;
              
              if (msg.sender_tma_id === currentCharacterId && myCharData) {
                 senderName = myCharData.tma_name || 'Yo';
                 spriteUrl = myCharData.sprite_idle_url || myCharData.image_url;
              } else {
                 const found = characters.find(c => c.id === msg.sender_tma_id);
                 if (found) {
                    senderName = found.tma_name || 'Desconocido';
                    spriteUrl = found.sprite_idle_url || found.image_url;
                 }
              }
              
              addVnWhisper({
                 id: msg.id,
                 sender_tma_id: msg.sender_tma_id,
                 sender_name: senderName,
                 target_tma_id: msg.target_tma_id,
                 content: msg.content,
                 is_whisper: msg.is_whisper,
                 is_system_message: msg.is_system_message,
                 sprite_url: spriteUrl
              });
           }
           else if (!msg.is_whisper && !msg.is_system_message) {
              // 1. Burbujas flotantes 3D
              if (msg.sender_tma_id !== currentCharacterId) {
                 setCharacters(prev => prev.map(c => {
                    if (c.id === msg.sender_tma_id) {
                       return { ...c, publicMessage: msg.content };
                    }
                    return c;
                 }));
                 
                 setTimeout(() => {
                    if (!mounted) return;
                    setCharacters(prev => prev.map(c => {
                       if (c.id === msg.sender_tma_id && c.publicMessage === msg.content) {
                          return { ...c, publicMessage: undefined };
                       }
                       return c;
                    }));
                 }, 8000);
              }

              // 2. Ruteo a Conversación Grupal VN
              let senderName = 'Estudiante';
              let spriteUrl: string | undefined = undefined;
              
              const isMe = msg.sender_tma_id === currentCharacterId;
              if (isMe && myCharData) {
                 senderName = myCharData.tma_name || 'Yo';
                 spriteUrl = myCharData.sprite_idle_url || myCharData.image_url;
              } else {
                 const foundChar = characters.find(c => c.id === msg.sender_tma_id);
                 if (foundChar) {
                    senderName = foundChar.tma_name || 'Desconocido';
                    spriteUrl = foundChar.sprite_idle_url || foundChar.image_url;
                 }
              }

              addVnGroupMessage({
                 id: msg.id,
                 sender_tma_id: msg.sender_tma_id,
                 sender_name: senderName,
                 content: msg.content,
                 is_whisper: false,
                 is_system_message: false,
                 sprite_url: spriteUrl
              });
           }
        })
        .subscribe();
    };
    
    fetchChars();

    // Timer de auto-cierre para Group Talk después de 30s de inactividad
    const autoCloseInterval = setInterval(() => {
       const state = useTmaStore.getState();
       const now = Date.now();
       if (state.vnMode === 'GROUP' && state.activeGroupMessages.length > 0 && (now - state.lastVnActivity > 30000)) {
          state.clearVnGroupMessages();
          state.setVnMode('WHISPER');
       }
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(autoCloseInterval);
      if (myCharacterId) {
         supabase.from('tma_characters').update({ current_room_id: null, is_hidden: false }).eq('id', myCharacterId).then();
      }
      supabase.removeAllChannels();
    };
  }, [roomId, addVnWhisper, addVnGroupMessage, isStealthing, setActivePrivacyPoll, myCharacterId, characters]);

  const handleCharacterClick = (id: string, name: string) => {
    setVnState({
      isActive: true,
      speaker: name,
      text: `Entrando en chat privado con ${name}... ¿Qué pistas secretas tienes?`
    });
  };

  const handleJoinGroup = () => {
    setVnMode('GROUP');
  };

  const handleClueDiscovery = (clue: TMAEvidence) => {
    setActiveClue(clue);
    setVnMode('CLUE');
    setVnState({ isActive: true });
  };

  const handleProposePrivacy = async () => {
    if (!myCharacterId || characters.length === 0) return;
    try {
      await startPrivacyPoll(roomId, myCharacterId, characters.length + 1);
    } catch (err) {
      console.error("Error starting privacy poll:", err);
    }
  };

  const handleStealthResolve = async (action: 'STEALTH' | 'NORMAL') => {
     setShowStealthEntry(false);
     setIsStealthing(true);
     const supabase = createClient();
     
     if (action === 'STEALTH') {
        await supabase.from('tma_characters').update({ current_room_id: roomId, is_hidden: true }).eq('id', myCharacterId);
     } else {
        await supabase.from('tma_characters').update({ current_room_id: roomId, is_hidden: false }).eq('id', myCharacterId);
        await supabase.from('tma_messages').insert({
           tma_room_id: roomId,
           sender_tma_id: myCharacterId,
           content: `SISTEMA: Un nuevo estudiante ha entrado en la sala.`,
           is_system_message: true
        });
     }
  };

  const handleTogglePrivacy = async (val: boolean) => {
     try {
        await updateRoomPrivacy(roomId, val);
        toast.success(val ? 'SALA ENCRIPTADA' : 'SALA PÚBLICA');
     } catch {
        toast.error('ERROR AL CAMBIAR PRIVACIDAD');
     }
  };

  return (
    <>
      <div className="w-full h-full absolute inset-0 z-0 bg-black">
        <Canvas shadows camera={{ position: [0, 1.5, 0.1], fov: 60 }}>
          <color attach="background" args={['#050505']} />
          
          <ambientLight intensity={isNight ? 0.3 : 0.7} color={isNight ? '#ff3333' : '#ffffff'} />
          <pointLight position={[0, 6, 0]} intensity={isNight ? 0.5 : 1} color={isNight ? '#ff3333' : '#aaccff'} castShadow />

          <Suspense fallback={null}>
            <RoomCube />
            
            {characters.map((char, index) => (
              <Suspense key={char.id} fallback={null}>
                <CharacterSprite3D
                  id={char.id}
                  name={char.tma_name || 'Estudiante'}
                  imageUrl={char.sprite_idle_url || char.image_url || PLACEHOLDER_IMG_1}
                  position={getPositionForIndex(index)}
                  publicMessage={char.publicMessage} 
                  onClick={handleCharacterClick}
                  onJoinGroup={handleJoinGroup}
                />
              </Suspense>
            ))}

            {clues.map((clue) => (
              <Suspense key={clue.id} fallback={null}>
                <EvidenceSprite3D 
                  evidence={clue} 
                  onClick={(ev) => handleClueDiscovery(ev)} 
                />
              </Suspense>
            ))}
          </Suspense>

          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            target={[0, 1.5, 0]}
            maxPolarAngle={Math.PI / 2 + 0.05} 
            minPolarAngle={Math.PI / 3} 
            makeDefault 
          />
        </Canvas>
      </div>
      
      <Suspense fallback={null}>
        <RoomNavigation characters={characters} />
      </Suspense>
      
      {vnWhispers.length > 0 && vnMode === 'WHISPER' && (
         <VNChatOverlay messages={vnWhispers} onClose={clearVnWhispers} />
      )}

      {activeGroupMessages.length > 0 && vnMode === 'GROUP' && (
         <VNChatOverlay messages={activeGroupMessages} onClose={clearVnGroupMessages} />
      )}

      {activeClue && vnMode === 'CLUE' && (
         <VNChatOverlay 
           messages={[]} 
           onClose={() => setActiveClue(null)} 
           clueData={activeClue} 
         />
      )}

      {/* Poll de Privacidad */}
      {activePrivacyPoll && <PrivacyPollModal />}

      {/* Dialogo de Sigilo */}
      {showStealthEntry && (
         <StealthEntryDialog 
           roomName={roomId.replace(/_/g, ' ')} 
           onDecide={handleStealthResolve}
           onCancel={() => setSelectedRoomId(null)}
         />
      )}
      
      {/* Indicador de Privacidad (HUD) */}
      {isPrivate && (
         <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center z-50">
            <div className="px-6 py-1 bg-blue-600/20 border border-blue-500/50 backdrop-blur-md rounded-full flex items-center gap-2 animate-pulse">
               <Shield size={14} className="text-blue-400" />
               <span className="font-mono text-[10px] text-blue-400 uppercase tracking-[0.3em] font-bold">
                  Conexión Encriptada: Sesión Privada
               </span>
            </div>
         </div>
      )}

      {/* Botones de Control de Sala */}
      <div className="absolute top-24 right-6 flex flex-col gap-2 z-50">
         {characters.length > 0 && !activePrivacyPoll && !isPrivate && (
            <button 
              onClick={handleProposePrivacy}
              className="pointer-events-auto p-3 border border-blue-500/50 bg-black/80 text-blue-500 hover:bg-blue-500 hover:text-black transition-all flex items-center gap-2 font-mono text-[10px] uppercase shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              <Zap size={14} /> Proponer Privacidad
            </button>
         )}

         {isPrivate && (
            <button 
               onClick={() => handleTogglePrivacy(false)}
               className="pointer-events-auto p-3 border border-red-500/50 bg-black/80 text-red-500 hover:bg-red-500 hover:text-black transition-all flex items-center gap-2 font-mono text-[10px] uppercase shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
               <ShieldOff size={14} /> Desactivar Privacidad
            </button>
         )}
      </div>
    </>
  );
}
