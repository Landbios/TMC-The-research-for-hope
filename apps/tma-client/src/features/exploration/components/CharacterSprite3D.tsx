'use client';

import { Billboard, Text, Image as DreiImage } from '@react-three/drei';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useState, useRef } from 'react';
import * as THREE from 'three';

interface CharacterSpriteProps {
  id: string;
  name: string;
  imageUrl: string;
  position: [number, number, number];
  onClick: (id: string, name: string) => void;
  publicMessage?: string | null;
}

export function CharacterSprite3D({ id, name, imageUrl, position, onClick, publicMessage }: CharacterSpriteProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  // Animación suave de respiración / flotación idle
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const breath = Math.sin(time * 2 + position[0]) * 0.05;
      groupRef.current.position.y = position[1] + breath;
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick(id, name);
  };

  return (
    <group ref={groupRef} position={position}>
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <group
           onPointerOver={handlePointerOver}
           onPointerOut={handlePointerOut}
           onClick={handleClick}
        >
          {/* Silueta de Selección Interactiva (Grip Visual Danganronpa) */}
          {hovered && (
             <DreiImage 
                url={imageUrl} 
                transparent 
                scale={[3.15, 5.25]} 
                position={[0, 0, -0.05]}
                color="#3b82f6"
                opacity={0.8}
            />
          )}
          
          <DreiImage 
            url={imageUrl} 
            transparent 
            scale={[3, 5]} 
            position={[0, 0, 0]}
            color={hovered ? '#dbeafe' : '#ffffff'}
          />

          {/* Nombre Flotante */}
          <Text
            position={[0, -3.0, 0]}
            fontSize={0.4}
            color="#ffffff"
            outlineColor="#000000"
            outlineWidth={0.03}
          >
            {name}
          </Text>

          {/* Chat Público en Burbuja 3D */}
          {publicMessage && (
             <group position={[0, 3.5, 0]}>
               {/* Tronco de Burbuja (Borde Glow) */}
               <mesh position={[0, 0, -0.01]}>
                 <planeGeometry args={[Math.min(8, Math.max(3, publicMessage.length * 0.15)) + 0.1, 1.3]} />
                 <meshBasicMaterial color="#3b82f6" opacity={0.8} transparent />
               </mesh>
               {/* Fondo de Burbuja Negro */}
               <mesh>
                 <planeGeometry args={[Math.min(8, Math.max(3, publicMessage.length * 0.15)), 1.2]} />
                 <meshBasicMaterial color="#000000" opacity={0.95} transparent />
               </mesh>
               
               {/* Sombra del texto */}
               <Text
                 position={[-0.02, -0.02, 0.005]}
                 fontSize={0.25}
                 color="#000000"
                 maxWidth={7.5}
                 textAlign="center"
               >
                 {publicMessage}
               </Text>
               
               {/* Texto Glow Azul */}
               <Text
                 position={[0, 0, 0.01]}
                 fontSize={0.25}
                 color="#dbeafe"
                 outlineColor="#3b82f6"
                 outlineWidth={0.015}
                 maxWidth={7.5}
                 textAlign="center"
               >
                 {publicMessage}
               </Text>
             </group>
          )}
        </group>
      </Billboard>
    </group>
  );
}
