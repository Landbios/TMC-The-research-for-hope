'use client';

import { Billboard, Image as DreiImage, Text, PivotControls } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { TMAEvidence } from '@/features/investigation/api';
import { updateEvidencePosition } from '@/features/admin/api';
import { toast } from 'sonner';

interface EvidenceSpriteProps {
  evidence: TMAEvidence;
  isEditMode?: boolean;
  onClick: (evidence: TMAEvidence) => void;
  onUpdate?: () => void;
}

export function EvidenceSprite3D({ evidence, isEditMode, onClick, onUpdate }: EvidenceSpriteProps) {
  const [hovered, setHovered] = useState(false);
  // Estado local para la posición. Se inicializa con los valores de la DB.
  const [pos, setPos] = useState<[number, number, number]>([evidence.pos_x, evidence.pos_y, evidence.pos_z]);

  // Sincronizar con la DB si cambian los props (ej: al cargar la sala o tras un reset)
  useEffect(() => {
    setPos([evidence.pos_x, evidence.pos_y, evidence.pos_z]);
  }, [evidence.id, evidence.pos_x, evidence.pos_y, evidence.pos_z]);

  const handleDrag = (local: THREE.Matrix4) => {
    // PivotControls en modo 'matrix' (sin autoTransform) nos da la matriz de transformación completa.
    // Extraemos la posición directamente de la matriz.
    const newPos = new THREE.Vector3();
    newPos.setFromMatrixPosition(local);
    setPos([newPos.x, newPos.y, newPos.z]);
  };

  const handleDragEnd = async () => {
    if (!isEditMode) return;
    
    console.log(`[TMA-ADMIN] GUARDANDO POSICIÓN FINAL:`, pos);

    try {
      await updateEvidencePosition(evidence.id, pos[0], pos[1], pos[2]);
      toast.success("COORDENADAS SINCRONIZADAS", {
        description: `X: ${pos[0].toFixed(2)}, Y: ${pos[1].toFixed(2)}, Z: ${pos[2].toFixed(2)}`
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error al persistir:", err);
      toast.error("ERROR DE PERSISTENCIA");
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (isEditMode) return; // Evitar interferir con el gizmo
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
    // Siempre permitimos el click para desplegar el modal, 
    // incluso si PivotControls está activo (el drag tiene prioridad si se mueve)
    onClick(evidence);
  };

  const displayUrl = evidence.image_url || 'https://picsum.photos/seed/tma_clue/400/400';

  // Matriz inicial basada en la posición de la base de datos
  const initialMatrix = new THREE.Matrix4().makeTranslation(pos[0], pos[1], pos[2]);

  return (
    <PivotControls 
      enabled={isEditMode}
      disableSliders={!isEditMode}
      disableAxes={!isEditMode}
      disableRotations={true}
      scale={2}
      autoTransform={false} // IMPORTANTE: Manejamos la transformación manualmente vía state
      matrix={initialMatrix}
      depthTest={false}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      <group>
        <Billboard follow={true}>
          <group 
            onPointerOver={handlePointerOver} 
            onPointerOut={handlePointerOut} 
            onClick={handleClick}
          >
            {/* Efecto visual de selección/edición */}
            <mesh visible={hovered || isEditMode}>
              <circleGeometry args={[1.2, 32]} />
              <meshBasicMaterial color={isEditMode ? "#ffffff" : "#ef4444"} transparent opacity={hovered ? 0.4 : 0.1} />
            </mesh>

            {/* Sprito de la Evidencia */}
            <DreiImage 
              url={displayUrl} 
              transparent 
              scale={[2, 2]} 
              position={[0, 0, 0.01]}
              color={hovered || isEditMode ? '#ffffff' : '#bbbbbb'}
            />

            {/* Label de texto */}
            {(hovered || isEditMode) && (
              <Text
                position={[0, -1.3, 0.2]}
                fontSize={0.2}
                color="#ffffff"
                maxWidth={3}
                textAlign="center"
              >
                {isEditMode ? `[MOVER] ${evidence.title}` : evidence.title}
              </Text>
            )}

            {hovered && !isEditMode && (
              <Text
                position={[0, 1.5, 0.2]}
                fontSize={0.4}
                color="#ffffff"
                outlineColor="#ef4444"
                outlineWidth={0.05}
              >
                🔍 INVESTIGAR
              </Text>
            )}
          </group>
        </Billboard>
      </group>
    </PivotControls>
  );
}
