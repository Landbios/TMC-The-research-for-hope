'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { UploadCloud, Link as LinkIcon, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ImageCropperModal from './ImageCropperModal';
import NextImage from 'next/image';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  bucketName?: string;
  maxSizeMB?: number;
  /** If set, enables crop modal after file selection with this aspect ratio (e.g. 16/9, 1, 3/4) */
  aspectRatio?: number;
}

export default function ImageUploader({
  label,
  value,
  onChange,
  placeholder = 'https://...',
  bucketName = 'evidence-images',
  maxSizeMB = 5,
  aspectRatio,
}: ImageUploaderProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Crop modal state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFileExt, setPendingFileExt] = useState<string>('jpg');

  const uploadBlob = async (blob: Blob, fileExt: string) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Debes iniciar sesión para subir imágenes.');
      }

      const fileName = `${user.id}/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: blob.type || 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success('Materializado correctamente en la Red S.C.I.O.N.');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido de red';
      toast.error(`ERROR DE CARGA: ${msg}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`ARCHIVO MUY PESADO. Límite: ${maxSizeMB}MB.`);
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('FORMATO INVÁLIDO. Use imágenes (JPG, PNG, WebP).');
      return;
    }

    const fileExt = file.name.split('.').pop() || 'jpg';

    // If aspectRatio is set, open cropper
    if (aspectRatio) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
        setPendingFileExt(fileExt);
      };
      reader.readAsDataURL(file);
      return;
    }

    // No cropper – upload directly
    await uploadBlob(file, fileExt);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropSrc(null);
    await uploadBlob(croppedBlob, pendingFileExt);
  };

  const handleCropCancel = () => {
    setCropSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
          {label}
        </label>
        
        <button
          type="button"
          onClick={() => setMode(mode === 'upload' ? 'url' : 'upload')}
          className="font-mono text-[10px] text-red-500 underline underline-offset-2 flex items-center gap-1 hover:text-white transition-colors"
        >
          {mode === 'upload' ? <><LinkIcon size={10} /> Enlace Web</> : <><UploadCloud size={10} /> Subir Archivo</>}
        </button>
      </div>

      {mode === 'upload' ? (
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 h-9 bg-zinc-900 border border-zinc-800 border-dashed font-mono text-[11px] text-zinc-400 hover:border-red-500 hover:text-white transition-all disabled:opacity-50"
          >
            {uploading ? (
              <><Loader2 size={13} className="animate-spin text-red-500" /> PROCESANDO...</>
            ) : (
              <><UploadCloud size={14} /> SELECCIONAR EVIDENCIA</>
            )}
          </button>
          
          {value && !uploading && (
            <div className="w-9 h-9 shrink-0 bg-black border border-zinc-700 relative overflow-hidden group">
               <NextImage 
                  src={value} 
                  alt="Preview" 
                  fill 
                  className="object-cover transition-transform group-hover:scale-110" 
                  unoptimized={!value.includes('supabase')}
               />
               <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          )}
        </div>
      ) : (
        <div className="relative group">
          <input
            type="text"
            placeholder={placeholder}
            className="w-full h-9 bg-zinc-900 border border-zinc-800 font-mono text-xs px-3 text-white outline-none focus:border-red-500/50 transition-all"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <LinkIcon size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500/50 transition-colors pointer-events-none" />
        </div>
      )}

      {mode === 'upload' && (
        <p className="font-mono text-[8.5px] text-zinc-600 italic">
          Max: {maxSizeMB}MB. Se guardará en la base de datos central de evidencias.
        </p>
      )}

      {/* Crop Modal */}
      {cropSrc && aspectRatio && (
        <ImageCropperModal
          imageSrc={cropSrc}
          aspectRatio={aspectRatio}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
