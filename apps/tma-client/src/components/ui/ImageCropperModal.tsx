import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';

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

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-(--glow)">
      {/* Esquinas CRT */}
      <div className="fixed inset-0 pointer-events-none crt-scanline" />
      
      <div className="relative w-full max-w-lg bg-black sci-border shadow-[0_0_30px_rgba(59,130,246,0.3)] flex flex-col">
        {/* Esquinas (Cruces CSS) */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-(--glow) -translate-x-px -translate-y-px" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-(--glow) translate-x-px -translate-y-px" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-(--glow) -translate-x-px translate-y-px" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-(--glow) translate-x-px translate-y-px" />

        <div className="p-3 border-b border-(--glow)/30 flex justify-between items-center bg-(--glow)/10">
          <h2 className="font-mono text-sm tracking-widest uppercase text-(--glow)">[ SUBJECT CALIBRATION ]</h2>
          <button onClick={onCancel} className="text-(--danger) font-mono text-xs hover:text-white hover:bg-(--danger) px-2 transition-colors">
            X ABORT
          </button>
        </div>

        <div className="relative w-full h-[60vh] md:h-[400px] bg-black overflow-hidden cctv-filter">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onCropComplete={onCropAreaComplete}
            onZoomChange={onZoomChange}
            classes={{ containerClassName: '!bg-black' }}
          />
        </div>

        <div className="p-4 flex flex-col gap-4 border-t border-(--glow)/30 bg-(--glow)/5">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-(--glow) opacity-80 uppercase tracking-widest">ZOOM_LEVEL: {zoom.toFixed(2)}x</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-(--glow)"
            />
          </div>
          <div className="flex gap-4 font-mono text-xs uppercase tracking-widest">
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-transparent border border-(--danger) text-(--danger) hover:bg-(--danger) hover:text-white transition-colors"
            >
              &lt; CANCEL
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-3 bg-transparent border border-(--glow) text-(--glow) hover:bg-(--glow) hover:text-black shadow-[0_0_15px_var(--glow)] transition-all"
            >
              CONFIRM &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
