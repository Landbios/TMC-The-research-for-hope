'use client';

import * as THREE from 'three';
import React, { Suspense, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { RoomModel } from './RoomModel';
import { createClient } from '@/lib/supabase/client';

class RoomModelErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[TMA-ROOMCUBE] RoomModelErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <mesh>
          <boxGeometry args={[40, 15, 40]} />
          <meshStandardMaterial color="#1f2331" side={THREE.BackSide} roughness={0.9} />
          <gridHelper args={[40, 40, '#000000', '#111111']} position={[0, -7.49, 0]} />
        </mesh>
      );
    }
    return this.props.children;
  }
}

export function RoomCube() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const [modelConfig, setModelConfig] = useState<{ url: string; scale: number; position: [number, number, number] } | null>(null);

  // Sincronización síncrona en render cuando cambia roomId, evitando set-state-in-effect redundantes
  const [prevRoomId, setPrevRoomId] = useState<string | null>(null);
  if (roomId !== prevRoomId) {
    setPrevRoomId(roomId);
    setModelConfig(null);
  }

  useEffect(() => {
    if (!roomId) return;

    const supabase = createClient();
    const fetchRoomModel = async () => {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roomId);
        let query = supabase.from('tma_rooms').select('model_url, model_scale, model_offset_y');

        if (isUuid) {
          query = query.eq('id', roomId);
        } else {
          query = query.ilike('name', `%${roomId}%`);
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
          console.error('[TMA-ROOMCUBE] Error fetching room model:', error);
          setModelConfig(null);
          return;
        }

        if (data && data.model_url) {
          const formattedUrl = data.model_url.startsWith('/') || data.model_url.startsWith('http')
            ? data.model_url
            : `/models/${data.model_url}`;

          setModelConfig({
            url: formattedUrl,
            scale: Number(data.model_scale ?? 1.0),
            position: [0, Number(data.model_offset_y ?? 0.0), 0]
          });
        } else {
          setModelConfig(null);
        }
      } catch (err) {
        console.error('[TMA-ROOMCUBE] Unexpected error fetching room model:', err);
        setModelConfig(null);
      }
    };

    fetchRoomModel();
  }, [roomId]);

  if (modelConfig) {
    return (
      <RoomModelErrorBoundary key={roomId}>
        <Suspense fallback={<FallbackLoadingBox />}>
          <RoomModel 
            url={modelConfig.url} 
            scale={modelConfig.scale} 
            position={modelConfig.position} 
          />
        </Suspense>
      </RoomModelErrorBoundary>
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
