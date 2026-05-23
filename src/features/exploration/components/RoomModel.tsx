'use client';

import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect } from 'react';

interface RoomModelProps {
  url: string;
  position?: [number, number, number];
  scale?: [number, number, number] | number;
  rotation?: [number, number, number];
}

export function RoomModel({ url, position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: RoomModelProps) {
  // useGLTF descarga y cachea el archivo automáticamente
  const { scene } = useGLTF(url);

  useEffect(() => {
    // Configuración de sombras y texturas del modelo
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Optimizar materiales si es necesario
        if (child.material) {
          child.material.roughness = 0.8;
        }
      }
    });
  }, [scene]);

  return (
    <primitive 
      object={scene} 
      position={position} 
      scale={scale} 
      rotation={rotation} 
    />
  );
}
