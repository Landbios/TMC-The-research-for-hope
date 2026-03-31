'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTmaStore } from '@/store/useTmaStore';
import { createClient } from '@/lib/supabase/client';
import { CharacterSprite3D } from './CharacterSprite3D';
import { RoomNavigation } from './RoomNavigation';
import { TMACharacterData } from '@/features/characters/api';

function RoomCube() {
  return (
    <mesh>
      <boxGeometry args={[40, 15, 40]} />
      <meshStandardMaterial color="#1f2331" side={THREE.BackSide} roughness={0.9} />
      <gridHelper args={[40, 40, '#000000', '#111111']} position={[0, -7.49, 0]} />
    </mesh>
  );
}

// Fotos temporales de Picsum con soporte CORS para probar DreiImage:
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

  const gamePeriod = useTmaStore((state) => state.gamePeriod);
  const setVnState = useTmaStore((state) => state.setVnState);
  const isNight = gamePeriod === 'NIGHTTIME';

  useEffect(() => {
    if (!roomId || roomId === 'UNKNOWN_SECTOR') return;
    let mounted = true;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    // Carga inicial
    const fetchChars = async () => {
      // Obtenemos al personaje local para ocultar su propio cuerpo
      const { data: { user } } = await supabase.auth.getUser();
      const { data: myChar } = await supabase.from('tma_characters').select('id').eq('user_id', user?.id).limit(1).single();
      const currentCharacterId = myChar?.id;

      const { data } = await supabase.from('tma_characters').select('*').eq('current_room_id', roomId);
      if (data && mounted) {
        setCharacters(data.filter(c => c.id !== currentCharacterId) as TMACharacterData[]);
      }
      
      if (!mounted) return;

      // Realtime Suscripción (añadimos Timestamp al canal para evitar colisiones en desmontajes con StrictMode)
      channel = supabase.channel(`room_${roomId}_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tma_characters' }, (payload) => {
           const char = payload.new as TMACharacterData | undefined;
           if (!char) return; 

           // Jamás renderizamos nuestra propia entidad en 3D
           if (char.id === currentCharacterId) return;

           if (char.current_room_id === roomId) {
              setCharacters(prev => {
                 if(prev.find(c => c.id === char.id)) return prev.map(c => c.id === char.id ? char : c);
                 return [...prev, char];
              });
           } else {
              setCharacters(prev => prev.filter(c => c.id !== char.id));
           }
         })
        .subscribe();

      // Realtime Mensajes (Burbujas Flotantes)
      supabase.channel(`chat_${roomId}_${Date.now()}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tma_messages', filter: `room_id=eq.${roomId}` }, (payload) => {
           const msg = payload.new as { message_type: string; character_id: string; content: string } | undefined;
           if (!msg) return; 

           if (msg.message_type === 'public' && msg.character_id !== currentCharacterId) {
              setCharacters(prev => prev.map(c => {
                 if (c.id === msg.character_id) {
                    return { ...c, publicMessage: msg.content };
                 }
                 return c;
              }));
              
              setTimeout(() => {
                 if (!mounted) return;
                 setCharacters(prev => prev.map(c => {
                    if (c.id === msg.character_id && c.publicMessage === msg.content) {
                       return { ...c, publicMessage: undefined };
                    }
                    return c;
                 }));
              }, 8000);
           }
        })
        .subscribe();
    };
    
    fetchChars();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
      // Automáticamente cerramos todos los canales de Supabase cuando se desmonta la arena entera
      supabase.removeAllChannels();
    };
  }, [roomId]);

  // Iniciar susurro/chat visual novel con un personaje clickeado
  const handleCharacterClick = (id: string, name: string) => {
    setVnState({
      isActive: true,
      speaker: name,
      text: `Entrando en chat privado con ${name}... ¿Qué pistas secretas tienes?`
    });
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
            
            {/* Renderizar todos los Sprite Billboards */}
            {characters.map((char, index) => (
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
      
      {/* UI Inferior de Interacción VN del Cuarto */}
      <Suspense fallback={null}>
        <RoomNavigation />
      </Suspense>
    </>
  );
}
