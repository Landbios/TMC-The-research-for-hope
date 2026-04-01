'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  aspectRatio: number;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropperModal({
  imageSrc,
  aspectRatio,
  onCropComplete,
  onCancel,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((z: number) => {
    setZoom(z);
  }, []);

  const onCropAreaComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex flex-col bg-black/90 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
          [ PROTOCOLO DE RECORTE DE IMAGEN ]
        </span>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={processing}
            className="flex items-center gap-2 font-mono text-[10px] uppercase px-3 py-1.5 border border-zinc-800 text-zinc-400 hover:border-red-500 hover:text-red-500 transition-all disabled:opacity-50"
          >
            <X size={12} /> Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="flex items-center gap-2 font-mono text-[10px] uppercase px-3 py-1.5 bg-red-600 text-white hover:bg-red-500 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          >
            <Check size={12} /> {processing ? 'Procesando…' : 'Confirmar'}
          </button>
        </div>
      </div>

      {/* Crop area */}
      <div className="relative flex-1 bg-black">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaComplete}
          style={{
            containerStyle: { backgroundColor: '#000' },
            cropAreaStyle: {
              border: '2px solid rgba(220, 38, 38, 0.8)',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            },
          }}
        />
      </div>

      {/* Zoom controls */}
      <div className="flex items-center justify-center gap-4 p-4 border-t border-zinc-800 bg-zinc-950 shrink-0">
        <ZoomOut size={14} className="text-zinc-500" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-48 accent-red-600 cursor-pointer h-1 bg-zinc-800 rounded-full"
        />
        <ZoomIn size={14} className="text-zinc-500" />
        <span className="font-mono text-[10px] text-zinc-500 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
      </div>
    </div>
  );
}
