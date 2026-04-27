'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useState, useRef } from 'react';
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
import { StealthEntryDialog } from './StealthEntryDialog';
import { startPrivacyPoll, updateRoomPrivacy } from '../privacy_api';
import { PrivacyPollModal } from './PrivacyPollModal';
import { Zap, Shield, ShieldOff, ShieldAlert, ShoppingBag, Fingerprint, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { AssassinInvitePanel } from './AssassinInvitePanel';
import { AssassinShopOverlay } from '@/features/dashboard/components/AssassinShopOverlay';
import { useRouter } from 'next/navigation';
import { AdminEvidenceModal } from '@/features/admin/components/AdminEvidenceModal';
import { Edit3, Skull } from 'lucide-react';

const PLACEHOLDER_IMG_1 = 'https://picsum.photos/seed/dangan1/400/600';

// Función auxiliar para esparcir personajes en la sala
function getPositionForIndex(index: number): [number, number, number] {
  const angle = index * (Math.PI / 4) + Math.PI; 
  const radius = 6 + (index % 2); // Variar un poco el radio
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 2];
}

export function InsideRoomArena() {
  const isHidden = useTmaStore(state => state.isHidden);
  const params = useParams();
  const roomId = params?.roomId as string;
  const [characters, setCharacters] = useState<TMACharacterData[]>([]);
  const [clues, setClues] = useState<TMAEvidence[]>([]);
  
  const [showStealthEntry, setShowStealthEntry] = useState(false);
  const [isStealthing, setIsStealthing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isMurderRoom, setIsMurderRoom] = useState(false);
  const [isCrimeScene, setIsCrimeScene] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const router = useRouter();
  const [roomMetadata, setRoomMetadata] = useState<{ 
    coordination_stage: 'PLANNING' | 'PREPARATION' | 'EXECUTION' | 'FINISHED';
    target_murder_room_id: string | null;
  } | null>(null);
  const [showAssassinShop, setShowAssassinShop] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<TMAEvidence | null>(null);

  const gamePeriod = useTmaStore((state) => state.gamePeriod);
  const vnState = useTmaStore((state) => state.vnState);
  const setVnState = useTmaStore((state) => state.setVnState);
  
  const vnWhispers = useTmaStore((state) => state.vnWhispers);
  const activeGroupMessages = useTmaStore((state) => state.activeGroupMessages);

  
  const vnMode = useTmaStore((state) => state.vnMode);
  const setVnMode = useTmaStore((state) => state.setVnMode);
  const activeClue = useTmaStore((state) => state.activeClue);
  const setActiveClue = useTmaStore((state) => state.setActiveClue);

  const setActivePrivacyPoll = useTmaStore((state) => state.setActivePrivacyPoll);
  const activePrivacyPoll = useTmaStore((state) => state.activePrivacyPoll);
  const myCharacterId = useTmaStore((state) => state.myCharacterId);
  const setSelectedRoomId = useTmaStore((state) => state.setSelectedRoomId);
  const userRole = useTmaStore((state) => state.userRole);
  const isAssassin = useTmaStore((state) => state.isAssassin);
  
  const isNight = gamePeriod === 'NIGHTTIME';

  const charactersRef = useRef<TMACharacterData[]>([]);
  useEffect(() => {
     charactersRef.current = characters;
  }, [characters]);

  // 2. Efecto de Verificación Inicial (Privacidad / Sigilo / SEGURIDAD)
  useEffect(() => {
    if (!roomId || roomId === 'UNKNOWN_SECTOR' || !myCharacterId) return;
    
    const checkRoomEntry = async () => {
    const supabase = createClient();
        const isStaff = userRole === 'staff' || userRole === 'superadmin';

        // 1. Obtener datos de la sala, del personaje y de coordinación
        const { data: currentRoom } = await supabase.from('tma_rooms').select('is_private, name').eq('id', roomId).single();
        const { data: myChar } = await supabase.from('tma_characters').select('is_hidden').eq('id', myCharacterId).single();
        const { data: coordRoom } = await supabase.from('tma_rooms').select('id, name, target_murder_room_id, coordination_stage').eq('name', 'COORDINACIÓN DE ASESINATO').maybeSingle();

        if (myChar?.is_hidden) {
           setIsStealthing(true);
        }

        if (currentRoom) {
           setIsPrivate(currentRoom.is_private);
           const isCoord = currentRoom.name === 'COORDINACIÓN DE ASESINATO';
           setIsMurderRoom(isCoord);
           
           const isTarget = coordRoom?.target_murder_room_id === roomId;
           setIsCrimeScene(isTarget);

           // --- LÓGICA DE BLOQUEO DE SEGURIDAD ---
           
           // Regla A: Sala de Coordinación
           if (isCoord) {
              if (isStaff) { /* Permitir siempre */ }
              else if (isAssassin) {
                 if (coordRoom?.coordination_stage === 'FINISHED') {
                    toast.success("PROTOCOLO FINALIZADO. EXPEDIENTE SELLADO.");
                    try {
                      router.push('/map');
                    } catch (err) {
                      console.error(err);
                    }
                    return;
                 }
              } else {
                 toast.error("ÁREA RESTRINGIDA: Acceso solo para personal autorizado.");
                 router.push('/exploration');
                 return;
              }
           }

           // Regla B: Sala del Crimen (Mantenimiento)
           if (isTarget) {
              if (!isStaff && !isAssassin) {
                 toast.error("SALA BLOQUEADA POR MANTENIMIENTO", {
                    description: "Se están realizando labores técnicas en esta zona. Por favor, utiliza otro sector."
                 });
                 router.push('/exploration');
                 return;
              }
           }
        }

        // Si pasó los filtros, manejar privacidad/sigilo
        if (currentRoom?.is_private) {
           if (!isStealthing) {
              setShowStealthEntry(true);
           }
           // Si isStealthing es true, el handleStealthResolve ya se encargó de actualizar is_hidden en DB
        } else {
           // En salas públicas, siempre somos visibles
           await supabase.from('tma_characters').update({ current_room_id: roomId, is_hidden: false }).eq('id', myCharacterId);
        }
    };
    
    checkRoomEntry();
  }, [roomId, myCharacterId, isStealthing, userRole, router, isAssassin]);

  // 3. Efecto de Sincronización de Evidencias (Trigger Global)
  const refreshCluesTrigger = useTmaStore(state => state.refreshCluesTrigger);
  useEffect(() => {
    if (roomId && roomId !== 'UNKNOWN_SECTOR') {
      getRoomClues(roomId).then(setClues);
    }
  }, [roomId, refreshCluesTrigger]);

  // 4. Efecto de Suscripciones en Tiempo Real (Estable)
  useEffect(() => {
    if (!roomId || roomId === 'UNKNOWN_SECTOR') return;
    
    // Sincronizar ID de sala para componentes globales (Nervalis Chat, etc)
    setSelectedRoomId(roomId);

    let mounted = true;
    const channelsToClean: ReturnType<typeof supabase.channel>[] = [];
    const supabase = createClient();
    let currentCharacterId: string | null = null;
    let myCharData: TMACharacterData | null = null;
    
    const fetchChars = async () => {
       await supabase.auth.getUser();
      const currentId = useTmaStore.getState().myCharacterId;
      
      // Fetch specifically the active character (either the original PC or a possessed NPC)
      const { data: charData } = await supabase.from('tma_characters')
        .select('*, character:characters(image_url)')
        .eq('id', currentId)
        .limit(1)
        .single();
      
      if (charData && mounted) {
         const processed = {
            ...charData,
            image_url: charData.image_url || (charData as TMACharacterData & { character?: { image_url?: string } }).character?.image_url
         } as TMACharacterData;
         myCharData = processed;
         currentCharacterId = processed.id;
         useTmaStore.getState().setCharacterData(processed);
      }

      const { data } = await supabase.from('tma_characters')
        .select('*, character:characters(image_url)')
        .eq('current_room_id', roomId);
        
      if (data && mounted) {
        const processed = data.map(c => ({
           ...c,
           // Fallback image from linked character if tma image is missing
           image_url: c.image_url || (c as TMACharacterData & { character?: { image_url?: string } }).character?.image_url
        }));
        // Filtramos: ocultos no se ven, EXCEPTO el propio usuario para que sepa dónde está
        setCharacters(processed.filter(c => !c.is_hidden || c.id === myCharacterId) as TMACharacterData[]);
      }

      if (mounted) {
        const roomClues = await getRoomClues(roomId);
        setClues(roomClues);
      }
    };

    const fetchRoomMeta = async () => {
         const { data } = await supabase.from('tma_rooms').select('coordination_stage, target_murder_room_id').eq('id', roomId).single();
         if (data && mounted) {
            setRoomMetadata({
               coordination_stage: data.coordination_stage || 'PLANNING',
               target_murder_room_id: data.target_murder_room_id
            });
         }
    };

    // 1. Suscripción a Personajes
    const chan1 = supabase.channel(`room_chars_${roomId}_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tma_characters' }, (payload) => {
         const char = payload.new as TMACharacterData | undefined;
         if (!char) return; 

           // Solo añadimos al personaje si está en esta sala y NO está oculto 
           // (o es el propio usuario, para que vea su propio sprite)
           if (char.current_room_id === roomId && (!char.is_hidden || char.id === myCharacterId)) {
              setCharacters(prev => {
                 if(prev.find(c => c.id === char.id)) {
                    return prev.map(c => c.id === char.id ? { ...c, ...char } : c);
                 }
                 return [...prev, char];
              });
           } else {
              // Si cambió de sala o se ocultó, lo eliminamos de la vista
              setCharacters(prev => prev.filter(c => c.id !== char.id));
           }
        });
    chan1.subscribe();
    channelsToClean.push(chan1);

    // 2. Suscripción a Polls de Privacidad
    const chan2 = supabase.channel(`privacy_polls_${roomId}_${Date.now()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tma_room_privacy_polls', filter: `room_id=eq.${roomId}` }, (payload) => {
         const poll = payload.new as import('@/store/useTmaStore').TMARoomPrivacyPoll;
         if (poll.status === 'PENDING' && mounted) {
            setActivePrivacyPoll(poll);
            if (!useTmaStore.getState().isNervalisOpen && poll.initiator_id !== currentCharacterId) {
                useTmaStore.getState().setHasUnreadSignals(true);
            }
         }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tma_room_privacy_polls', filter: `room_id=eq.${roomId}` }, (payload) => {
         const poll = payload.new as import('@/store/useTmaStore').TMARoomPrivacyPoll;
         const currentPoll = useTmaStore.getState().activePrivacyPoll;
         
         // Only update if it's our current active poll or if it's a new pending one
         if (mounted && (currentPoll?.id === poll.id || poll.status === 'PENDING')) {
            // If it was resolved, we set it but the modal will handle its own closing
            setActivePrivacyPoll(poll);
         }
      });
    chan2.subscribe();
    channelsToClean.push(chan2);

     // 3. Suscripción a la propia Sala (Estado de Privacidad y Fases de Coordinación)
    const chan3 = supabase.channel(`room_meta_${roomId}_${Date.now()}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tma_rooms', filter: `id=eq.${roomId}` }, (payload) => {
         const room = payload.new as { 
            is_private: boolean; 
            coordination_stage: 'PLANNING' | 'PREPARATION' | 'EXECUTION' | 'FINISHED'; 
            target_murder_room_id: string | null 
         };
         if (mounted) {
            setIsPrivate(room.is_private);
            setRoomMetadata({
               coordination_stage: room.coordination_stage || 'PLANNING',
               target_murder_room_id: room.target_murder_room_id
            });
         }
       });
    chan3.subscribe();
    channelsToClean.push(chan3);
      
      const fetchRoomHistory = async () => {
         const { data } = await supabase.from('tma_messages').select(`
            id, sender_tma_id, target_tma_id, content, is_whisper, is_system_message,
            sender:tma_characters!tma_messages_sender_tma_id_fkey (tma_name, image_url, sprite_idle_url)
         `).eq('tma_room_id', roomId).order('created_at', { ascending: true }).limit(50);
         
         if (data && mounted) {
            const formattedMessages = data.reduce((acc: import('@/features/vn-ui/components/VNChatOverlay').VNChatMessage[], msg: { id: string, sender_tma_id: string, target_tma_id?: string, content: string, is_whisper: boolean, is_system_message: boolean, sender: unknown }) => {
               // Filtrar Whispers irrelevantes
               if (msg.is_whisper && msg.sender_tma_id !== currentCharacterId && msg.target_tma_id !== currentCharacterId) {
                  return acc;
               }
               
               const senderObj = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
               
               acc.push({
                  id: msg.id,
                  sender_tma_id: msg.sender_tma_id,
                  sender_name: senderObj?.tma_name || 'Desconocido',
                  target_tma_id: msg.target_tma_id,
                  content: msg.content,
                  is_whisper: msg.is_whisper,
                  is_system_message: msg.is_system_message,
                  sprite_url: senderObj?.sprite_idle_url || senderObj?.image_url
               });
               return acc;
            }, [] as import('@/features/vn-ui/components/VNChatOverlay').VNChatMessage[]);
            useTmaStore.getState().setVnGroupMessages(formattedMessages);
         }
      };

      // 5. Suscripción a Evidencias (Visibilidad)
      const chan5 = supabase.channel(`room_evidences_${roomId}_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tma_evidences', filter: `room_id=eq.${roomId}` }, (payload) => {
           const ev = payload.new as TMAEvidence;
           if (!ev) return;
           if (mounted) {
              setClues(prev => {
                const exists = prev.find(c => c.id === ev.id);
                if (exists) {
                  return prev.map(c => c.id === ev.id ? { ...c, ...ev } : c);
                }
                return [...prev, ev];
              });
           }
        });
      chan5.subscribe();
      channelsToClean.push(chan5);

      // 4. Suscripción a Mensajes (Burbujas Flotantes y VN-UI)
      const chan4 = supabase.channel(`chat_messages_${roomId}_${Date.now()}`)
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

           const isMe = msg.sender_tma_id === currentCharacterId;
           const isForMeOrByMe = isMe || msg.target_tma_id === currentCharacterId || !msg.target_tma_id;
           
           if (!isMe && isForMeOrByMe && !useTmaStore.getState().isNervalisOpen) {
               useTmaStore.getState().setHasUnreadSignals(true);
           }

           if (msg.is_whisper && isForMeOrByMe) {
              let senderName = 'Sistema';
              let spriteUrl: string | undefined = undefined;
              
              if (msg.sender_tma_id === currentCharacterId && myCharData) {
                 senderName = myCharData.tma_name || 'Yo';
                 spriteUrl = myCharData.sprite_idle_url || myCharData.image_url;
              } else {
                 const found = charactersRef.current.find(c => c.id === msg.sender_tma_id);
                 if (found) {
                    senderName = found.tma_name || 'Desconocido';
                    spriteUrl = found.sprite_idle_url || found.image_url;
                 }
              }
              
              useTmaStore.getState().addVnWhisper({
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
            else if (!msg.is_whisper) {
              // Si NO es whisper, va al chat grupal (incluyendo sistemas)
              
              // 1. Burbujas flotantes 3D (Solo para mensajes de texto de personajes, NO sistemas)
              if (!msg.is_system_message) {
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
              
              if (msg.is_system_message) {
                 senderName = 'SISTEMA';
              } else {
                 const isMe = msg.sender_tma_id === currentCharacterId;
                 if (isMe && myCharData) {
                    senderName = myCharData.tma_name || 'Yo';
                    spriteUrl = myCharData.sprite_idle_url || myCharData.image_url;
                 } else {
                    const foundChar = charactersRef.current.find(c => c.id === msg.sender_tma_id);
                    if (foundChar) {
                       senderName = foundChar.tma_name || 'Desconocido';
                       spriteUrl = foundChar.sprite_idle_url || foundChar.image_url;
                    }
                 }
              }

              useTmaStore.getState().addVnGroupMessage({
                 id: msg.id,
                 sender_tma_id: msg.sender_tma_id,
                 sender_name: senderName,
                 content: msg.content,
                 is_whisper: false,
                 is_system_message: msg.is_system_message,
                 sprite_url: spriteUrl
              });
           }
        });
      chan4.subscribe();
      channelsToClean.push(chan4);

      const init = async () => {
         await fetchChars();
         await fetchRoomMeta();
         // Intentar obtener poll de privacidad inicial
         const { data: poll } = await supabase.from('tma_room_privacy_polls')
           .select('*')
           .eq('room_id', roomId)
           .eq('status', 'PENDING')
           .limit(1)
           .maybeSingle();
         if (poll && mounted) setActivePrivacyPoll(poll as import('@/store/useTmaStore').TMARoomPrivacyPoll);
         
         await fetchRoomHistory();
      };

      init();
    
    // Timer de auto-cierre...
    const autoCloseInterval = setInterval(() => {
       const state = useTmaStore.getState();
       const now = Date.now();
        if (state.vnMode === 'GROUP' && state.activeGroupMessages.length > 0 && (now - state.lastVnActivity > 30000)) {
           // Solo cerramos el overlay, NO borramos los mensajes
           state.setVnMode('WHISPER');
           state.setVnState({ isActive: false });
        }
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(autoCloseInterval);
      setSelectedRoomId(null);
      channelsToClean.forEach(ch => supabase.removeChannel(ch));
    };
  }, [roomId, myCharacterId, setActivePrivacyPoll, setSelectedRoomId]);

  const handleCharacterClick = (id: string, name: string) => {
    setVnState({
      isActive: true,
      speaker: name,
      text: `Entrando en chat privado con ${name}... ¿Qué pistas secretas tienes?`
    });
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

  const handleStealthResolve = async (action: 'STEALTH' | 'NORMAL', success?: boolean) => {
     setShowStealthEntry(false);
     setIsStealthing(true);
     const supabase = createClient();
     
     if (action === 'STEALTH' && success === true) {
        // Éxito: Entra oculto
        await supabase.from('tma_characters').update({ current_room_id: roomId, is_hidden: true }).eq('id', myCharacterId);
        useTmaStore.getState().patchCharacterData({ is_hidden: true }); 
        toast.success("INFILTRACIÓN EXITOSA", { description: "Has entrado en la sala sin ser detectado." });
     } else {
        // Fallo o Entrada Normal
        const isFailure = action === 'STEALTH' && success === false;
        await supabase.from('tma_characters').update({ current_room_id: roomId, is_hidden: false }).eq('id', myCharacterId);
        useTmaStore.getState().patchCharacterData({ is_hidden: false });
        
        const content = isFailure 
           ? `[ALERTA DE SEGURIDAD] Se ha detectado una presencia intentando infiltrarse en la sala.`
           : `SISTEMA: Un nuevo estudiante ha entrado en la sala.`;

        await supabase.from('tma_messages').insert({
           tma_room_id: roomId,
           sender_tma_id: myCharacterId,
           content: content,
           is_system_message: true
        });

        if (isFailure) {
           toast.error("INFILTRACIÓN FALLIDA", { description: "Tu presencia ha sido detectada por los sensores de la sala." });
        }
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
            
            {characters.map((char, index) => {
              // REGLA: No renderizamos nuestro propio avatar en 3D (Primera Persona)
              if (char.id === myCharacterId) return null;
              
              // REGLA: No renderizamos personajes ocultos (Sigilo)
              if (char.is_hidden) return null;
              
              return (
                <Suspense key={char.id} fallback={null}>
                  <CharacterSprite3D
                    id={char.id}
                    name={char.tma_name || 'Estudiante'}
                    imageUrl={char.sprite_idle_url || char.image_url || PLACEHOLDER_IMG_1}
                    position={getPositionForIndex(index)}
                    publicMessage={char.publicMessage} 
                    onClick={handleCharacterClick}
                  />
                </Suspense>
              );
            })}

            {clues.filter(c => !c.is_hidden || isEditMode).map((clue) => (
              <Suspense key={clue.id} fallback={null}>
                <EvidenceSprite3D 
                  evidence={clue} 
                  isEditMode={isEditMode}
                  onClick={(ev) => {
                    if (isEditMode) {
                      setEditingEvidence(ev);
                    } else {
                      handleClueDiscovery(ev);
                    }
                  }} 
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
          <VNChatOverlay 
            messages={vnWhispers} 
            onClose={() => {
               // No borramos para mantener permanencia
               setVnState({ isActive: false });
            }} 
          />
      )}

      {activeGroupMessages.length >= 0 && vnMode === 'GROUP' && (
          <VNChatOverlay 
            messages={activeGroupMessages} 
            onClose={() => {
               // No borramos para mantener permanencia
               setVnMode('WHISPER');
               setVnState({ isActive: false });
            }} 
          />
      )}

      {activeClue && vnMode === 'CLUE' && (
         <VNChatOverlay 
           messages={[]} 
           onClose={() => {
              setActiveClue(null);
              setVnMode('WHISPER');
              setVnState({ isActive: false });
           }} 
           clueData={activeClue} 
         />
      )}

      {/* Poll de Privacidad */}
      <PrivacyPollModal />

      {/* Dialogo de Sigilo */}
      {showStealthEntry && !vnState.isActive && (
         <StealthEntryDialog 
           roomName={roomId.replace(/_/g, ' ')} 
           onDecide={handleStealthResolve}
           onCancel={() => setSelectedRoomId(null)}
         />
      )}
      
      {/* Indicador de Privacidad (HUD) */}
      {isPrivate && !vnState.isActive && (
         <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center z-50">
            <div className="px-6 py-1 bg-blue-600/20 border border-blue-500/50 backdrop-blur-md rounded-full flex items-center gap-2 animate-pulse">
               <Shield size={14} className="text-blue-400" />
               <span className="font-mono text-[10px] text-blue-400 uppercase tracking-[0.3em] font-bold">
                  Conexión Encriptada: Sesión Privada
               </span>
            </div>
         </div>
      )}

      {/* HUD de Fase de Coordinación (Solo en el cuarto secreto) */}
      {isMurderRoom && roomMetadata && (
         <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 pointer-events-none">
            <div className="flex items-center gap-1 bg-black/80 border border-zinc-800 p-1 rounded-sm pointer-events-auto">
               {(['PLANNING', 'PREPARATION', 'EXECUTION', 'FINISHED'] as ('PLANNING' | 'PREPARATION' | 'EXECUTION' | 'FINISHED')[]).map((stage) => (
                  <div 
                    key={stage}
                    className={`px-4 py-1 font-mono text-[9px] uppercase tracking-widest transition-all ${
                       roomMetadata.coordination_stage === stage 
                        ? 'bg-red-600 text-black font-bold' 
                        : 'text-zinc-600'
                    }`}
                  >
                     {stage === 'PLANNING' ? 'Planteamiento' : stage === 'PREPARATION' ? 'Preparación' : stage === 'EXECUTION' ? 'Ejecución' : 'Finalizado'}
                  </div>
               ))}
            </div>
            
            {roomMetadata.coordination_stage === 'EXECUTION' && (
               <div className="px-3 py-1 bg-red-600/10 border border-red-500/30 backdrop-blur-md rounded-full animate-pulse">
                  <span className="font-mono text-[10px] text-red-500 uppercase tracking-widest font-bold">
                     Protocolo de Asalto: Ejecución Permitida
                  </span>
               </div>
            )}

            {isCrimeScene && (
               <div className="px-3 py-1 bg-yellow-600/10 border border-yellow-500/30 backdrop-blur-md rounded-full shadow-[0_0_15px_rgba(202,138,4,0.2)]">
                  <span className="font-mono text-[10px] text-yellow-500 uppercase tracking-widest font-bold flex items-center gap-2">
                     <Skull size={12} /> ZONA EN MANTENIMIENTO TÁCTICO
                  </span>
               </div>
            )}
         </div>
      )}

      {/* Botones de Control de Sala */}
      {(!vnState.isActive) && (
        <div className="absolute top-24 right-6 flex flex-col gap-2 z-50">
           {/* Renderizado por fases de coordinación: Tienda de Asesino (Solo en fase EXECUTION para el asesino) */}
           {isMurderRoom && roomMetadata?.coordination_stage === 'EXECUTION' && useTmaStore.getState().isAssassin && (
              <button 
                onClick={() => setShowAssassinShop(true)}
                className="pointer-events-auto p-4 border-2 border-red-600 bg-black/90 text-red-600 hover:bg-red-600 hover:text-black transition-all flex items-center gap-3 font-mono text-xs font-bold uppercase shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-glitch-entry"
              >
                <ShoppingBag size={18} /> ABRIR TIENDA DE ASESINATO
              </button>
           )}

           {characters.length > 0 && !activePrivacyPoll && !isPrivate && (
              <button 
                onClick={handleProposePrivacy}
                className="pointer-events-auto p-3 border border-blue-500/50 bg-black/80 text-blue-500 hover:bg-blue-500 hover:text-black transition-all flex items-center gap-2 font-mono text-[10px] uppercase shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              >
                <Zap size={14} /> Proponer Privacidad
              </button>
           )}

           {characters.length > 0 && (
              <button 
                onClick={() => setVnMode('GROUP')}
                className="pointer-events-auto p-3 border border-emerald-500/50 bg-black/80 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-2 font-mono text-[10px] uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <MessageSquare size={14} /> Abrir Chat de Sala
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

           {/* ADMIN TOOLS */}
           {(userRole === 'staff' || userRole === 'superadmin') && (
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`pointer-events-auto p-3 border flex items-center gap-2 font-mono text-[10px] uppercase shadow-lg transition-all ${isEditMode ? 'bg-red-600 border-white text-white' : 'bg-black/80 border-zinc-700 text-zinc-400 hover:text-white'}`}
              >
                 <Edit3 size={14} />
                 {isEditMode ? 'MODO EDICIÓN: ON' : 'EDITAR PISTAS'}
              </button>
           )}

           {isMurderRoom && (userRole === 'staff' || userRole === 'superadmin') && roomMetadata?.coordination_stage !== 'FINISHED' && (
              <button 
                onClick={() => setShowInvitePanel(!showInvitePanel)}
                className="pointer-events-auto p-3 border border-red-500/50 bg-black/80 text-red-500 hover:bg-red-500 hover:text-black transition-all flex items-center gap-2 font-mono text-[10px] uppercase shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <ShieldAlert size={14} /> {showInvitePanel ? 'Cerrar Gestión' : 'Invitar Asesino'}
              </button>
           )}
        </div>
      )}

      {showInvitePanel && isMurderRoom && (
         <div className="absolute top-24 left-6 z-50 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
            <AssassinInvitePanel 
               roomId={roomId}
               currentStage={roomMetadata?.coordination_stage || 'PLANNING'}
               onClose={() => setShowInvitePanel(false)} 
            />
         </div>
      )}

      {showAssassinShop && (
         <AssassinShopOverlay onClose={() => setShowAssassinShop(false)} />
      )}

      {editingEvidence && (
         <AdminEvidenceModal 
           evidence={editingEvidence} 
           onClose={() => setEditingEvidence(null)}
           onUpdate={() => {
             window.location.reload();
           }}
         />
      )}

      {/* Visual Stealth Filter Overlay */}
      {isHidden && (
         <div className="fixed inset-0 pointer-events-none z-45 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.8)_100%)] animate-pulse opacity-80" />
            <div className="absolute inset-0 crt-scanline opacity-10" />
            <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-1.5 bg-amber-600/10 border border-amber-500/30 backdrop-blur-sm rounded-full">
               <Fingerprint className="text-amber-500 animate-pulse" size={14} />
               <span className="font-mono text-[9px] text-amber-500 uppercase tracking-[0.3em] font-bold">
                  MODO SIGILO ACTIVO : NO DETECTABLE
               </span>
            </div>
         </div>
      )}
    </>
  );
}
