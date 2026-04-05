'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RoomNode } from './RoomNode';
import { CameraController } from './CameraController';
import { useTmaStore } from '@/store/useTmaStore';
import { createClient } from '@/lib/supabase/client';

// Distribución basada en el modelo Blender (Normalizado para comparaciones)
const MAP_LAYOUTS: Record<string, { position: [number, number, number], size: [number, number, number], color: string }> = {
  'LOBBY PRINCIPAL': { position: [0, 0, -8], size: [8, 1, 6], color: '#4a7af2' },
  'HABITACIONES': { position: [0, 0, 0], size: [6, 1, 4], color: '#d9cd5b' },
  'LAVANDERIA': { position: [0, 0, 6], size: [6, 1, 4], color: '#d66a93' },
  'BANOS': { position: [0, 0, 12], size: [4, 1, 4], color: '#7bc98f' },
  'CAFETERIA': { position: [8, 0, 0], size: [6, 1, 8], color: '#bc5b12' },
  'CAPILLA': { position: [-8, 0, 0], size: [6, 1, 8], color: '#7a3b9a' }
};

function normalizeName(name: string) {
  return name.toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .trim();
}

interface RoomMapData {
  id: string;
  name: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  isBlocked: boolean;
}

export function AcademyMap() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null); 
  const [rooms, setRooms] = useState<RoomMapData[]>([]);
  const gamePeriod = useTmaStore((state) => state.gamePeriod);
  const setSelectedRoomId = useTmaStore((state) => state.setSelectedRoomId);
  const setVnState = useTmaStore((state) => state.setVnState);
  
  const userRole = useTmaStore((state) => state.userRole);
  
  useEffect(() => {
    let mounted = true;
    const fetchRooms = async () => {
      const supabase = createClient();
      console.log('TMA_MAP: Fetching rooms... UserRole:', userRole);
      const { data, error } = await supabase.from('tma_rooms').select('*');
      
      if (error) {
        console.error('TMA_MAP: Error fetching rooms:', error);
        return;
      }

      if (data && mounted) {
        console.log(`TMA_MAP: Received ${data.length} rooms from DB.`);

        // Filtrar salas: La coordinación de asesinato solo la ven Staff o el Asesino asignado
        const isStaff = userRole === 'staff' || userRole === 'superadmin';
        const myChar = useTmaStore.getState().originalCharacter;
        const isAssassin = myChar?.is_assassin || false;

        const filteredData = data.filter(r => {
          if (r.name === 'COORDINACIÓN DE ASESINATO') {
            if (isStaff) return true;
            // Para el asesino: Mostrar solo si NO está terminado
            return isAssassin && r.coordination_stage !== 'FINISHED';
          }
          return true;
        }); 
        
        console.log(`TMA_MAP: Rendering ${filteredData.length} rooms.`);

        const { data: blockedRoomsData } = await supabase.from('tma_rooms').select('target_murder_room_id').not('target_murder_room_id', 'is', null);
        const blockedIds = new Set(blockedRoomsData?.map(r => r.target_murder_room_id) || []);

        const mappedRooms = filteredData.map((r, index) => {
          let displayName = r.name;
          if (r.name === 'COORDINACIÓN DE ASESINATO') {
             if (r.coordination_stage === 'PLANNING' && !isStaff) {
                displayName = 'INVITACIÓN DE ASESINO';
             }
          }

          const normName = normalizeName(displayName);
          const layout = MAP_LAYOUTS[normName] || MAP_LAYOUTS[normalizeName(r.name)];
          
          // Si no hay layout, los esparcimos en un círculo para que no se solapen en [0,0,10]
          const fallbackPos: [number, number, number] = layout ? layout.position : [
            Math.cos(index) * 5, 
            0, 
            Math.sin(index) * 5
          ];

          return {
            id: r.id, 
            name: displayName,
            position: fallbackPos,
            size: layout?.size || [4, 1, 4],
            color: layout?.color || '#ffffff',
            isBlocked: blockedIds.has(r.id)
          };
        });
        setRooms(mappedRooms);
      }
    };
    fetchRooms();
    return () => { mounted = false; };
  }, [userRole]);

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

        <group position={[0, 0, 0]}>
          {rooms.map((room) => (
            <RoomNode key={room.id} {...room} />
          ))}
        </group>

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
        
        {/* Ground Plane para recibir luz */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color={isNight ? '#050202' : '#02050a'} />
        </mesh>
      </Canvas>

      {/* Debug Overlay (Solo para Staff) */}
      {(userRole === 'staff' || userRole === 'superadmin') && (
        <div className="absolute bottom-4 left-4 z-50 bg-black/80 p-4 border border-blue-500 font-mono text-[10px] text-blue-400 pointer-events-none">
          <p className="font-bold border-b border-blue-500/30 mb-2">DEBUG_MAP: {rooms.length} NODES</p>
          <p>ROLE: {userRole?.toUpperCase()}</p>
          <p>PERIOD: {gamePeriod}</p>
          {rooms.length === 0 && <p className="text-red-500 animate-pulse">ALERTA: CERO SALAS DETECTADAS EN DB</p>}
        </div>
      )}
    </div>
  );
}
