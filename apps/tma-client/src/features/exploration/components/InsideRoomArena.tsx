'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { CharacterSprite3D } from './CharacterSprite3D';
import { RoomNavigation } from './RoomNavigation';
// Forzar recarga de cache

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
const PLACEHOLDER_IMG_2 = 'https://picsum.photos/seed/dangan2/400/600';

const MOCK_CHARACTERS = [
  { 
    id: 'char_1', 
    name: 'MAESTRA MENTE', 
    imageUrl: PLACEHOLDER_IMG_1, 
    position: [5, 0, -8] as [number, number, number],
    publicMessage: "¡Upupupu! ¿Están listos para la desesperación?"
  },
  { 
    id: 'char_2', 
    name: 'ESTUDIANTE PROTAGONISTA', 
    imageUrl: PLACEHOLDER_IMG_2, 
    position: [-6, 0, -5] as [number, number, number],
  }
];

export function InsideRoomArena() {
  const gamePeriod = useTmaStore((state) => state.gamePeriod);
  const setVnState = useTmaStore((state) => state.setVnState);
  const isNight = gamePeriod === 'NIGHTTIME';

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
        <Canvas shadows camera={{ position: [0, 0, 0], fov: 60 }}>
          <color attach="background" args={['#050505']} />
          
          <ambientLight intensity={isNight ? 0.3 : 0.7} color={isNight ? '#ff3333' : '#ffffff'} />
          <pointLight position={[0, 6, 0]} intensity={isNight ? 0.5 : 1} color={isNight ? '#ff3333' : '#aaccff'} castShadow />

          <Suspense fallback={null}>
            <RoomCube />
            
            {/* Renderizar todos los Sprite Billboards */}
            {MOCK_CHARACTERS.map((char) => (
              <CharacterSprite3D
                key={char.id}
                id={char.id}
                name={char.name}
                imageUrl={char.imageUrl}
                position={char.position}
                publicMessage={char.publicMessage}
                onClick={handleCharacterClick}
              />
            ))}
          </Suspense>

          <OrbitControls 
            enableZoom={false}
            enablePan={false}
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
