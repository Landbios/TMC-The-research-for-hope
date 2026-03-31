'use client';
import { useFrame } from '@react-three/fiber';
import { useTmaStore } from '@/store/useTmaStore';
import * as THREE from 'three';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CameraController({ controlsRef, roomData }: { controlsRef: React.MutableRefObject<any>, roomData: Array<{id: string, position: [number, number, number]}> }) {
  const selectedRoomId = useTmaStore((state) => state.selectedRoomId);
  const isVnActive = useTmaStore((state) => state.vnState.isActive);
  
  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    
    // Si hay una caja de novela visual abierta y una sala seleccionada, haz zoom-in
    if (selectedRoomId && isVnActive) {
      const room = roomData.find(r => r.id === selectedRoomId);
      if (room) {
        // Enfoque hacia el centro de la sala
        const targetFocus = new THREE.Vector3(room.position[0], 0, room.position[2]);
        // Arriba y ligeramente desplazado para dar espacio a la UI abajo
        const targetCamPos = new THREE.Vector3(room.position[0], 4, room.position[2] + 4);
        
        controlsRef.current.target.lerp(targetFocus, delta * 3);
        state.camera.position.lerp(targetCamPos, delta * 3);
      }
    } else {
       // Vista isométrica global por defecto
       const targetFocus = new THREE.Vector3(0, 0, 0);
       const targetCamPos = new THREE.Vector3(0, 15, 18);
       
       controlsRef.current.target.lerp(targetFocus, delta * 2);
       state.camera.position.lerp(targetCamPos, delta * 2);
    }
  });
  
  return null;
}
