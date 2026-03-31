'use client';

import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RoomNode } from './RoomNode';
import { CameraController } from './CameraController';
import { useTmaStore } from '@/store/useTmaStore';

// Distribución basada en el modelo Blender
export const MAP_ROOMS = [
  { id: 'lobby', name: 'Lobby Principal', position: [0, 0, -6] as [number, number, number], size: [8, 1, 6] as [number, number, number], color: '#4a7af2' },
  { id: 'habitaciones', name: 'Habitaciones', position: [0, 0, 0] as [number, number, number], size: [8, 1, 4] as [number, number, number], color: '#d9cd5b' },
  { id: 'lavanderia', name: 'Lavandería', position: [0, 0, 4] as [number, number, number], size: [8, 1, 4] as [number, number, number], color: '#d66a93' },
  { id: 'banos', name: 'Baño', position: [-2, 0, 8] as [number, number, number], size: [4, 1, 4] as [number, number, number], color: '#7bc98f' },
];

export function AcademyMap() {
  const controlsRef = useRef<any>(null);
  const gamePeriod = useTmaStore((state) => state.gamePeriod);
  const setSelectedRoomId = useTmaStore((state) => state.setSelectedRoomId);
  const setVnState = useTmaStore((state) => state.setVnState);
  
  const isNight = gamePeriod === 'NIGHTTIME';
  const ambientColor = isNight ? '#ff4040' : '#ffffff';
  const intensity = isNight ? 0.4 : 1.0;

  // Clic en el vacío deselecciona
  const handlePointerMissed = () => {
    setSelectedRoomId(null);
    setVnState({ isActive: false });
  };

  return (
    <div className="w-full h-screen absolute inset-0 z-0 bg-black">
      <Canvas shadows camera={{ position: [0, 15, 18], fov: 45 }} onPointerMissed={handlePointerMissed}>
        <color attach="background" args={[isNight ? '#1a0505' : '#0a0f1a']} />
        
        {/* Luces Escénicas */}
        <ambientLight intensity={intensity} color={ambientColor} />
        <directionalLight position={[10, 20, 10]} intensity={isNight ? 0.6 : 1.2} color={ambientColor} castShadow />
        {isNight && <pointLight position={[0, 4, 0]} color="#ff0000" intensity={2.5} distance={15} />}

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            {MAP_ROOMS.map((room) => (
              <RoomNode key={room.id} {...room} />
            ))}
          </group>
        </Suspense>

        <OrbitControls 
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.1} // No mirar desde abajo
          minDistance={3}
          maxDistance={30}
        />
        <CameraController controlsRef={controlsRef} roomData={MAP_ROOMS} />
        
        <gridHelper args={[50, 50, isNight ? '#550000' : '#003366', isNight ? '#330000' : '#001133']} position={[0, -0.5, 0]} />
      </Canvas>
    </div>
  );
}
