'use client';

import { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useTmaStore } from '@/store/useTmaStore';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface RoomNodeProps {
  id: string;
  name: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

export function RoomNode({ id, name, position, size, color }: RoomNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const selectedRoomId = useTmaStore((state) => state.selectedRoomId);
  const setSelectedRoomId = useTmaStore((state) => state.setSelectedRoomId);
  const setVnState = useTmaStore((state) => state.setVnState);

  const isSelected = selectedRoomId === id;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setSelectedRoomId(id);
    setVnState({
      isActive: true,
      speaker: 'SISTEMA NAV',
      text: `Entidad acercándose a: ${name}. ¿Iniciar protocolo de reconocimiento e investigación en la zona designada?`,
    });
  };

  useFrame((state, delta) => {
    if (meshRef.current) {
       const scaleTarget = hovered || isSelected ? 1.02 : 1.0;
       meshRef.current.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget), delta * 5);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={color} 
          emissive={hovered || isSelected ? color : '#000000'} 
          emissiveIntensity={hovered || isSelected ? 0.3 : 0}
          transparent
          opacity={0.85}
        />
      </mesh>
      
      {/* Etiqueta flotante superior */}
      <Text 
        position={[0, (size[1] / 2) + 0.1, 0]} 
        fontSize={0.4} 
        color="#ffffff" 
        outlineColor="#000000" 
        outlineWidth={0.04}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {name}
      </Text>
    </group>
  );
}
