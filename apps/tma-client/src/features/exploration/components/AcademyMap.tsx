'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RoomNode } from './RoomNode';
import { CameraController } from './CameraController';
import { useTmaStore } from '@/store/useTmaStore';
import { createClient } from '@/lib/supabase/client';

// Distribución basada en el modelo Blender
const MAP_LAYOUTS: Record<string, { position: [number, number, number], size: [number, number, number], color: string }> = {
  'Lobby Principal': { position: [0, 0, -8], size: [8, 1, 6], color: '#4a7af2' },
  'Habitaciones': { position: [0, 0, 0], size: [6, 1, 4], color: '#d9cd5b' },
  'Lavandería': { position: [0, 0, 6], size: [6, 1, 4], color: '#d66a93' },
  'Baños': { position: [0, 0, 12], size: [4, 1, 4], color: '#7bc98f' },
  'Cafetería': { position: [8, 0, 0], size: [6, 1, 8], color: '#bc5b12' },
  'Capilla': { position: [-8, 0, 0], size: [6, 1, 8], color: '#7a3b9a' }
};

export function AcademyMap() {
  const controlsRef = useRef<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const gamePeriod = useTmaStore((state) => state.gamePeriod);
  const setSelectedRoomId = useTmaStore((state) => state.setSelectedRoomId);
  const setVnState = useTmaStore((state) => state.setVnState);
  
  useEffect(() => {
    let mounted = true;
    const fetchRooms = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('tma_rooms').select('*');
      if (data && mounted) {
        const mappedRooms = data.map(r => ({
          id: r.id, // Supabase UUID
          name: r.name,
          position: MAP_LAYOUTS[r.name]?.position || [0, 0, 10],
          size: MAP_LAYOUTS[r.name]?.size || [4, 1, 4],
          color: MAP_LAYOUTS[r.name]?.color || '#ffffff'
        }));
        setRooms(mappedRooms);
      }
    };
    fetchRooms();
    return () => { mounted = false; };
  }, []);

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
            {rooms.map((room) => (
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
        <CameraController controlsRef={controlsRef} roomData={rooms} />
        
        <gridHelper args={[50, 50, isNight ? '#550000' : '#003366', isNight ? '#330000' : '#001133']} position={[0, -0.5, 0]} />
      </Canvas>
    </div>
  );
}
