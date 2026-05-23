'use client';

import * as THREE from 'three';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { RoomModel } from './RoomModel';

// Mapa estático local temporal para pruebas de Fase 1
// Esto mapea UUIDs o identificadores de sala con archivos .glb en el directorio público
const LOCAL_MODEL_MAP: Record<string, { url: string; scale: number; position: [number, number, number] }> = {
  'coordinacion': { url: '/models/coordinacion.glb', scale: 1.0, position: [0, 0, 0] },
  'biblioteca': { url: '/models/biblioteca.glb', scale: 1.0, position: [0, 0, 0] },
  'test-room': { url: '/models/test_room.glb', scale: 1.0, position: [0, 0, 0] }
};

export function RoomCube() {
  const params = useParams();
  const roomId = params?.roomId as string;

  // Buscar si el ID de sala actual o subcadena tiene un modelo mapeado localmente
  const key = roomId ? Object.keys(LOCAL_MODEL_MAP).find(k => roomId.toLowerCase().includes(k)) : undefined;
  const config = key ? LOCAL_MODEL_MAP[key] : null;

  if (config) {
    return (
      <Suspense fallback={<FallbackLoadingBox />}>
        <RoomModel 
          url={config.url} 
          scale={config.scale} 
          position={config.position} 
        />
      </Suspense>
    );
  }

  // Fallback seguro: Si no se encuentra un modelo mapeado, se muestra el cubo clásico con rejilla
  return (
    <mesh>
      <boxGeometry args={[40, 15, 40]} />
      <meshStandardMaterial color="#1f2331" side={THREE.BackSide} roughness={0.9} />
      <gridHelper args={[40, 40, '#000000', '#111111']} position={[0, -7.49, 0]} />
    </mesh>
  );
}

function FallbackLoadingBox() {
  return (
    <mesh position={[0, 1.5, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#3b82f6" wireframe />
    </mesh>
  );
}
