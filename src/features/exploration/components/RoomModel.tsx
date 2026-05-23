'use client';

import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useState } from 'react';

interface RoomModelProps {
  url: string;
  position?: [number, number, number];
  scale?: [number, number, number] | number;
  rotation?: [number, number, number];
}

export function RoomModel({ url, position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: RoomModelProps) {
  // useGLTF descarga y cachea el archivo automáticamente
  const { scene } = useGLTF(url);
  const [localOffset, setLocalOffset] = useState<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    // Calcular el bounding box para determinar el suelo del modelo
    const box = new THREE.Box3().setFromObject(scene);
    const lowestY = box.min.y;
    
    // Si el lowestY es válido, desplazamos la escena para que el suelo esté en Y=0
    if (lowestY !== Infinity && lowestY !== -Infinity) {
      setLocalOffset([0, -lowestY, 0]);
    }

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
    <group position={position} scale={scale} rotation={rotation}>
      <primitive 
        object={scene} 
        position={localOffset} 
      />
    </group>
  );
}
