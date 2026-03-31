import React, { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import ImageCropperModal from './ImageCropperModal';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  bucketName?: string;
  maxSizeMB?: number;
  aspectRatio?: number;
}

export default function ImageUploader({
  label,
  value,
  onChange,
  bucketName = 'character-images',
  maxSizeMB = 5,
  aspectRatio = 1,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFileExt, setPendingFileExt] = useState<string>('jpg');

  const uploadBlob = async (blob: Blob, fileExt: string) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('NO SYSTEM AUTH');

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
      toast.success('SYS_MSG: UPLOAD SUCCESSFUL.');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'UNKNOWN_ERR';
      toast.error(`UPLOAD_ERR: ${msg}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`ERR_SIZE: DATA EXCEEDS ${maxSizeMB}MB.`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('ERR_TYPE: INVALID DATA FORMAT.');
      return;
    }

    const fileExt = file.name.split('.').pop() || 'jpg';

    if (aspectRatio) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
        setPendingFileExt(fileExt);
      };
      reader.readAsDataURL(file);
      return;
    }

    await uploadBlob(file, fileExt);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropSrc(null);
    await uploadBlob(croppedBlob, pendingFileExt);
  };

  const handleCropCancel = () => {
    setCropSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs uppercase tracking-widest text-(--glow) border-b border-(--glow)/30 pb-1">
          {label}
        </label>

        <div className="flex gap-2 h-[60px]">
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
            className="flex-1 sci-border text-(--glow) font-mono text-xs uppercase flex items-center justify-center hover:bg-(--glow) hover:text-black transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-(--glow) relative overflow-hidden"
          >
            {uploading ? (
              <span className="animate-pulse">UPLOADING_DATA...</span>
            ) : (
              <span>[ INITIALIZE UPLOAD SEQUENCE ]</span>
            )}
          </button>

          {value && !uploading && (
            <div className="w-[60px] h-[60px] sci-border flex-shrink-0 cctv-filter p-1 bg-black overflow-hidden relative group">
              <img src={value} alt="Current" className="w-full h-full object-cover relative z-10" />
            </div>
          )}
        </div>
      </div>

      {cropSrc && aspectRatio && (
        <ImageCropperModal
          imageSrc={cropSrc}
          aspectRatio={aspectRatio}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
