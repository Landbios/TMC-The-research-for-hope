'use client';

import { Billboard, Image as DreiImage, Text } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useState, useRef } from 'react';
import * as THREE from 'three';
import { TMAEvidence } from '@/features/investigation/api';

interface EvidenceSpriteProps {
  evidence: TMAEvidence;
  onClick: (evidence: TMAEvidence) => void;
}

export function EvidenceSprite3D({ evidence, onClick }: EvidenceSpriteProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  
  // Pequeña animación de levitación para que se note que es interactuable
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = evidence.pos_y + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
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
    onClick(evidence);
  };

  // Usamos una imagen genérica si no hay una específica
  const displayUrl = evidence.image_url || 'https://oiwxjmvalaspjimdqtob.supabase.co/storage/v1/object/public/clue-images/clue-placeholder.webp';

  return (
    <group ref={meshRef} position={[evidence.pos_x, evidence.pos_y, evidence.pos_z]}>
      <Billboard follow={true}>
        <group 
          onPointerOver={handlePointerOver} 
          onPointerOut={handlePointerOut} 
          onClick={handleClick}
        >
          {/* Fondo o Glow de Selección */}
          <mesh visible={hovered}>
            <circleGeometry args={[1.2, 32]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.4} />
          </mesh>

          {/* La Imagen de la pista */}
          <DreiImage 
            url={displayUrl} 
            transparent 
            scale={[2, 2]} 
            position={[0, 0, 0.01]}
            color={hovered ? '#ffffff' : '#cccccc'}
          />

          {/* Icono de Lupa flotante cuando hay hover */}
          {hovered && (
            <Text
              position={[0, 1.5, 0.1]}
              fontSize={0.4}
              color="#ffffff"
              outlineColor="#ef4444"
              outlineWidth={0.05}
            >
              🔍 INVESTIGAR
            </Text>
          )}

          {/* Etiqueta de la pista (opcional, solo en hover) */}
          {hovered && (
             <Text
               position={[0, -1.3, 0.1]}
               fontSize={0.2}
               color="#ffffff"
               maxWidth={3}
               textAlign="center"
             >
               {evidence.title}
             </Text>
          )}
        </group>
      </Billboard>
    </group>
  );
}
