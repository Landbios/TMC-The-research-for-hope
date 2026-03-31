'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { CharacterData } from '@/features/characters/api';
import Image from 'next/image';

interface Props {
  vaultCharacters: CharacterData[];
}

export default function EnrollClientForm({ vaultCharacters }: Props) {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [tmaTitle, setTmaTitle] = useState('');
  const [tmaBiography, setTmaBiography] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharacter || !tmaTitle || !tmaBiography) {
      toast.error('INPUT ERROR: MISSING DATA.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('characters')
        .update({
          tma_title: tmaTitle,
          tma_biography: tmaBiography,
        })
        .eq('id', selectedCharacter);

      if (error) throw error;

      toast.success('SYS_UPDATE: SUBJECT LINKED TO PROTOCOL.');
      router.push('/dashboard');
      router.refresh(); 
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'SYS_ERROR: LINK FAILED.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full border border-(--glow) bg-black p-4 md:p-6 shadow-[0_0_20px_rgba(59,130,246,0.1)] text-(--glow)">
      {/* Esquinas CRT */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-(--glow) -translate-x-px -translate-y-px" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-(--glow) translate-x-px -translate-y-px" />
      
      {/* Glitch Overlay (opcional bg) */}
      <div className="absolute inset-0 crt-scanline opacity-50 pointer-events-none" />

      {vaultCharacters.length === 0 ? (
        <div className="text-center p-8 sci-border mt-4">
          <p className="font-mono text-xs text-(--danger)">
            [ERROR 404] NO HAY REGISTROS EN LA BASE DE DATOS
          </p>
          <p className="text-sm mt-4 text-(--glow) opacity-70 font-mono text-center max-w-sm mx-auto">
            NECESITAS TENER AL MENOS UN PACIENTE ARCHIVADO EN <strong>TMC VAULT</strong> ANTES DE ASIGNARLO AL PROGRAMA.
          </p>
          <button 
            type="button" 
            onClick={() => window.location.href = '#'}
            className="mt-6 px-4 py-2 border border-(--danger) text-(--danger) font-mono text-xs uppercase hover:bg-(--danger) hover:text-black transition-all"
          >
            &gt; IR AL VAULT
          </button>
        </div>
      ) : (
        <form onSubmit={handleLink} className="space-y-6 relative z-10">
          
          <div className="space-y-3">
            <label className="font-mono text-xs md:text-sm uppercase block border-b border-(--glow)/30 pb-1">STEP 01: SUBJECT SELECTION (THE VAULT)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vaultCharacters.map(char => (
                <div 
                  key={char.id}
                  onClick={() => setSelectedCharacter(char.id)}
                  className={`
                    p-3 sci-border cursor-pointer transition-all flex items-center gap-4
                    ${selectedCharacter === char.id 
                      ? 'bg-(--glow)/20 border-(--glow) shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                      : 'border-(--glow)/40 hover:border-(--glow)'
                    }
                  `}
                >
                  <div className="w-10 h-10 bg-black overflow-hidden relative shrink-0 cctv-filter border border-(--glow)">
                    {char.image_url ? (
                      <Image src={char.image_url} alt={char.name} fill unoptimized className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-[10px] text-(--glow) opacity-50 text-center wrap-break-word leading-tight">
                        NO IMG
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-(--glow) font-mono text-sm truncate uppercase">{char.name}</p>
                    <p className="font-mono text-[8px] opacity-70 mt-1 uppercase">UUID: {char.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 animate-fade-in transition-all" style={{ opacity: selectedCharacter ? 1 : 0.3, pointerEvents: selectedCharacter ? 'auto' : 'none' }}>
            <label className="font-mono text-xs md:text-sm uppercase block border-b border-(--glow)/30 pb-1">STEP 02: ASSIGN ULTIMATE DESIGNATION</label>
            <input 
              type="text" 
              value={tmaTitle}
              onChange={(e) => setTmaTitle(e.target.value)}
              placeholder="E.G. HACKER DEFINITIVO"
              className="w-full bg-black text-(--glow) sci-border p-3 font-mono text-sm focus:outline-none focus:bg-(--glow)/10 uppercase transition-colors"
              required={!!selectedCharacter}
            />
          </div>

          <div className="space-y-2 animate-fade-in transition-all" style={{ opacity: selectedCharacter ? 1 : 0.3, pointerEvents: selectedCharacter ? 'auto' : 'none' }}>
            <label className="font-mono text-xs md:text-sm uppercase block border-b border-(--glow)/30 pb-1">STEP 03: APPEND BIOGRAPHICAL DATA</label>
            <textarea 
              value={tmaBiography}
              onChange={(e) => setTmaBiography(e.target.value)}
              placeholder="INSERT SUBJECT LOG / HISTORY..."
              className="w-full bg-black text-(--glow) sci-border p-3 min-h-[120px] font-mono text-sm focus:outline-none focus:bg-(--glow)/10 uppercase transition-colors"
              required={!!selectedCharacter}
            />
          </div>

          <button 
            type="submit" 
            disabled={!selectedCharacter || loading}
            className="w-full bg-transparent text-(--glow) disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-(--glow) py-4 font-mono uppercase tracking-widest text-sm transition-all sci-border border-(--glow) hover:bg-(--glow) hover:text-black shadow-[0_0_10px_var(--glow)]"
          >
            {loading ? 'UPLOADING DATA...' : '>> INITIALIZE ADMISSION PROTOCOL'}
          </button>
        </form>
      )}
    </div>
  );
}
