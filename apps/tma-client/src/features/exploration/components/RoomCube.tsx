'use client';

import * as THREE from 'three';

export function RoomCube() {
  return (
    <mesh>
      <boxGeometry args={[40, 15, 40]} />
      <meshStandardMaterial color="#1f2331" side={THREE.BackSide} roughness={0.9} />
      <gridHelper args={[40, 40, '#000000', '#111111']} position={[0, -7.49, 0]} />
    </mesh>
  );
}
