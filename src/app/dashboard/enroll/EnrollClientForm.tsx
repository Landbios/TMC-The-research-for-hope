'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { CharacterData } from '@/features/characters/api';
import Image from 'next/image';
import ImageUploader from '@/components/ui/ImageUploader';

interface Props {
  vaultCharacters: CharacterData[];
}

export default function EnrollClientForm({ vaultCharacters }: Props) {
  const [activeTab, setActiveTab] = useState<'vault' | 'new'>('vault');

  // Vault Tab State
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [tmaTitle, setTmaTitle] = useState('');
  const [tmaBiography, setTmaBiography] = useState('');
  
  // Vault Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(vaultCharacters.length / itemsPerPage);
  const paginatedVaultProps = vaultCharacters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // New Subject Tab State
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState('');
  const [spriteIdle, setSpriteIdle] = useState('');

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLinkVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharacter || !tmaTitle || !tmaBiography) {
      toast.error('INPUT ERROR: MISSING DATA.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('NO AUTH SESSION.');

      // INSERT directamente en tma_characters ligando el ID del personaje viejo
      const { error } = await supabase
        .from('tma_characters')
        .insert({
          user_id: user.id,
          tmc_character_id: selectedCharacter,
          tma_title: tmaTitle,
          tma_biography: tmaBiography,
          sprite_idle_url: spriteIdle || undefined,
        });

      if (error) throw error;
      toast.success('SYS_UPDATE: SUBJECT LINKED TO PROTOCOL.');
      router.push('/dashboard');
      router.refresh(); 
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'SYS_ERROR: LINK FAILED.');
      setLoading(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !tmaTitle || !tmaBiography || !newImage) {
      toast.error('INPUT ERROR: MISSING DATA FOR NEW SUBJECT.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('NO AUTH SESSION.');

      const { error } = await supabase
        .from('tma_characters')
        .insert({
          user_id: user.id,
          tma_name: newName,
          image_url: newImage,
          sprite_idle_url: spriteIdle || newImage, // Use avatar as default sprite if not provided
          tma_title: tmaTitle,
          tma_biography: tmaBiography,
        });

      if (error) throw error;

      toast.success('SYS_UPDATE: NEW SUBJECT INITIATED.');
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'SYS_ERROR: CREATION FAILED.');
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full border border-(--glow) bg-black p-4 md:p-6 shadow-[0_0_20px_rgba(59,130,246,0.1)] text-(--glow) mt-6">
      {/* Esquinas CRT */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-(--glow) -translate-x-px -translate-y-px" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-(--glow) translate-x-px -translate-y-px" />
      
      {/* Glitch Overlay */}
      <div className="absolute inset-0 crt-scanline opacity-50 pointer-events-none" />

      {/* TABS */}
      <div className="relative z-10 flex border-b border-(--glow)/50 mb-6 font-mono text-[10px] sm:text-xs">
        <button
          onClick={() => setActiveTab('vault')}
          className={`px-4 py-2 border-r border-l border-t border-(--glow)/50 transition-colors uppercase ${activeTab === 'vault' ? 'bg-(--glow) text-black font-bold' : 'text-(--glow) hover:bg-(--glow)/10'} -mb-px`}
          type="button"
        >
          [ ARCHIVE SEARCH ]
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`px-4 py-2 border-r border-t border-(--glow)/50 transition-colors uppercase ${activeTab === 'new' ? 'bg-(--glow) text-black font-bold' : 'text-(--glow) hover:bg-(--glow)/10'} -mb-px`}
          type="button"
        >
          [ NEW REGISTRATION ]
        </button>
      </div>

      {activeTab === 'vault' ? (
        // --- VAULT TAB ---
        vaultCharacters.length === 0 ? (
          <div className="text-center p-8 sci-border mt-4">
            <p className="font-mono text-xs text-(--danger)">
              [ERROR 404] NO HAY REGISTROS EN LA BASE DE DATOS
            </p>
          </div>
        ) : (
          <form onSubmit={handleLinkVault} className="space-y-6 relative z-10">
            <div className="space-y-3">
              <div className="flex justify-between items-end border-b border-(--glow)/30 pb-1">
                 <label className="font-mono text-xs md:text-sm uppercase">STEP 01: SUBJECT SELECTION (THE VAULT)</label>
                 <span className="font-mono text-[10px]">PAGE: {currentPage}/{totalPages}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paginatedVaultProps.map(char => (
                  <div 
                    key={char.id}
                    onClick={() => setSelectedCharacter(char.id)}
                    className={`
                      relative group p-3 sci-border cursor-pointer transition-all flex items-center gap-4
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

                    {/* HOVER TOOLTIP */}
                    <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 left-[-110px] w-[100px] h-[100px] sci-border bg-black z-50 overflow-hidden shadow-[0_0_20px_var(--glow)] hidden md:block">
                      <div className="absolute inset-0 cctv-filter">
                         {char.image_url && <Image src={char.image_url} alt={char.name} fill unoptimized className="object-cover relative z-10" />}
                      </div>
                      <div className="absolute inset-0 crt-scanline" />
                      <div className="absolute bottom-0 w-full bg-black/80 font-mono text-[7px] text-center p-1 uppercase z-20">EXPANDING DATA...</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="flex justify-between mt-2 font-mono text-xs uppercase pt-2">
                  <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="hover:text-white disabled:opacity-30">&lt;&lt; PREV_CYCLE</button>
                  <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="hover:text-white disabled:opacity-30">NEXT_CYCLE &gt;&gt;</button>
                </div>
              )}
            </div>

            <div className="space-y-2 animate-fade-in transition-all" style={{ opacity: selectedCharacter ? 1 : 0.3, pointerEvents: selectedCharacter ? 'auto' : 'none' }}>
              <label className="font-mono text-xs md:text-sm uppercase block border-b border-(--glow)/30 pb-1">STEP 02: ASSIGN ULTIMATE DESIGNATION</label>
              <input 
                type="text" 
                value={tmaTitle}
                onChange={(e) => setTmaTitle(e.target.value)}
                placeholder="E.G. HACKER DEFINITIVO"
                className="w-full bg-black text-(--glow) sci-border p-3 font-mono text-sm focus:outline-none focus:bg-(--glow)/10 uppercase transition-colors"
                required={activeTab === 'vault'}
              />
            </div>

            <div className="space-y-2 animate-fade-in transition-all" style={{ opacity: selectedCharacter ? 1 : 0.3, pointerEvents: selectedCharacter ? 'auto' : 'none' }}>
              <label className="font-mono text-xs md:text-sm uppercase block border-b border-(--glow)/30 pb-1">STEP 03: APPEND BIOGRAPHICAL DATA</label>
              <textarea 
                value={tmaBiography}
                onChange={(e) => setTmaBiography(e.target.value)}
                placeholder="INSERT SUBJECT LOG / HISTORY..."
                className="w-full bg-black text-(--glow) sci-border p-3 min-h-[120px] font-mono text-sm focus:outline-none focus:bg-(--glow)/10 uppercase transition-colors"
                required={activeTab === 'vault'}
              />
            </div>

            <div className="space-y-2 animate-fade-in transition-all" style={{ opacity: selectedCharacter ? 1 : 0.3, pointerEvents: selectedCharacter ? 'auto' : 'none' }}>
               <ImageUploader
                  label="OPTIONAL: 3D WORLD SPRITE OVERRIDE"
                  value={spriteIdle}
                  onChange={setSpriteIdle}
                  aspectRatio={1} 
               />
               <p className="font-mono text-[8px] mt-1 opacity-50">LEAVE EMPTY TO USE VAULT IMAGE AS SPRITE.</p>
            </div>

            <button 
              type="submit" 
              disabled={!selectedCharacter || loading}
              className="w-full bg-transparent text-(--glow) disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-(--glow) py-4 font-mono uppercase tracking-widest text-sm transition-all sci-border border-(--glow) hover:bg-(--glow) hover:text-black shadow-[0_0_10px_var(--glow)]"
            >
              {loading ? 'UPLOADING DATA...' : '>> INITIALIZE ADMISSION PROTOCOL'}
            </button>
          </form>
        )
      ) : (
        // --- NEW SUBJECT TAB ---
        <form onSubmit={handleCreateNew} className="space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image Uploader */}
            <div className="w-full md:w-1/3">
               <ImageUploader
                  label="SUBJECT VISUAL DATA"
                  value={newImage}
                  onChange={setNewImage}
                  aspectRatio={1} 
               />
               <p className="font-mono text-[8px] mt-2 opacity-60">UPLOAD WILL TRIGGER RE-FRAMING ALGORITHM.</p>
            </div>

             {/* Inputs */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <label className="font-mono text-xs md:text-sm uppercase block border-b border-(--glow)/30 pb-1">SUBJECT FULL NAME</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="NAME.SURNAME"
                  className="w-full bg-black text-(--glow) sci-border p-3 font-mono text-sm focus:outline-none focus:bg-(--glow)/10 uppercase transition-colors"
                  required={activeTab === 'new'}
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs md:text-sm uppercase block border-b border-(--glow)/30 pb-1">ULTIMATE DESIGNATION</label>
                <input 
                  type="text" 
                  value={tmaTitle}
                  onChange={(e) => setTmaTitle(e.target.value)}
                  placeholder="E.G. HACKER DEFINITIVO"
                  className="w-full bg-black text-(--glow) sci-border p-3 font-mono text-sm focus:outline-none focus:bg-(--glow)/10 uppercase transition-colors"
                  required={activeTab === 'new'}
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs md:text-sm uppercase block border-b border-(--glow)/30 pb-1">BIOGRAPHICAL DATA</label>
                <textarea 
                  value={tmaBiography}
                  onChange={(e) => setTmaBiography(e.target.value)}
                  placeholder="INSERT SUBJECT LOG / HISTORY..."
                  className="w-full bg-black text-(--glow) sci-border p-3 min-h-[120px] font-mono text-sm focus:outline-none focus:bg-(--glow)/10 uppercase transition-colors"
                  required={activeTab === 'new'}
                />
              </div>

              <div className="pt-2 border-t border-(--glow)/20">
                 <ImageUploader
                    label="3D WORLD SPRITE (FULL BODY)"
                    value={spriteIdle}
                    onChange={setSpriteIdle}
                    aspectRatio={0.7} // Typical sprite aspect ratio
                 />
                 <p className="font-mono text-[8px] mt-1 opacity-50 uppercase">IF EMPTY, AVATAR IMAGE WILL BE USED AS SPRITE.</p>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!newName || !newImage || !tmaTitle || loading}
            className="w-full bg-transparent text-(--glow) disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-(--glow) py-4 font-mono uppercase tracking-widest text-sm transition-all sci-border border-(--glow) hover:bg-(--glow) hover:text-black shadow-[0_0_10px_var(--glow)]"
          >
            {loading ? 'SYNTHESIZING NEW SUBJECT...' : '>> REGISTER & INITIALIZE PROTOCOL'}
          </button>
        </form>
      )}
    </div>
  );
}
