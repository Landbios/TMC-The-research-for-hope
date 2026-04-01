'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { useTmaStore } from '@/store/useTmaStore';
import { createClient } from '@/lib/supabase/client';

interface CharacterEvidence {
  id: string;
  evidence: {
    id: string;
    title: string;
    description_full: string;
    image_url: string;
  };
  discovered_at: string;
}

export function InvestigationLog() {
  const [evidences, setEvidences] = useState<CharacterEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClue, setSelectedClue] = useState<CharacterEvidence | null>(null);
  const myCharacterId = useTmaStore(state => state.myCharacterId);

  useEffect(() => {
    if (!myCharacterId) return;

    const fetchLog = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tma_character_evidences')
        .select(`
          id,
          discovered_at,
          evidence:tma_evidences (
            id,
            title,
            description_full,
            image_url
          )
        `)
        .eq('character_id', myCharacterId)
        .order('discovered_at', { ascending: false });

      if (!error && data) {
        setEvidences(data as unknown as CharacterEvidence[]);
      }
      setLoading(false);
    };

    fetchLog();
  }, [myCharacterId]);

  if (loading) return <div className="p-8 text-center font-mono text-zinc-500 animate-pulse uppercase text-xs">Cargando base de datos neural...</div>;

  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-sm border border-zinc-900 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="font-cinzel text-lg text-white uppercase tracking-widest">Log de Investigación</h2>
        <span className="font-mono text-[10px] text-zinc-500 uppercase">Sujetos vinculados: {evidences.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {evidences.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-8 border-2 border-dashed border-zinc-900 opacity-50">
            <p className="font-mono text-xs text-zinc-500 uppercase italic">
              No hay evidencia procesada en el registro actual.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evidences.map((item) => (
              <button 
                key={item.id}
                onClick={() => setSelectedClue(item)}
                className="flex gap-4 p-3 bg-zinc-900/30 border border-zinc-800 hover:border-red-900/50 hover:bg-red-950/10 transition-all text-left group"
              >
                <div className="w-16 h-16 bg-black shrink-0 border border-zinc-800 overflow-hidden relative">
                  <NextImage 
                    src={item.evidence.image_url} 
                    alt={item.evidence.title} 
                    fill
                    className="object-cover opacity-70 group-hover:opacity-100" 
                    unoptimized={!item.evidence.image_url?.includes('supabase')}
                  />
                  <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-mono text-sm text-zinc-200 uppercase truncate mb-1">{item.evidence.title}</h3>
                  <p className="font-mono text-[10px] text-zinc-500 line-clamp-2 leading-tight">
                    {item.evidence.description_full}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detalle de Pista Expandido */}
      {selectedClue && (
        <div className="absolute inset-0 z-50 bg-black/95 p-6 animate-fade-in flex flex-col">
           <button 
             onClick={() => setSelectedClue(null)}
             className="absolute top-4 right-4 text-zinc-500 hover:text-white font-mono text-xs uppercase"
           >
             [ CERRAR ]
           </button>
           
           <div className="flex-1 flex flex-col md:flex-row gap-8 items-center justify-center max-w-4xl mx-auto w-full">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-zinc-900 border-2 border-red-900/50 relative overflow-hidden shadow-[0_0_40px_rgba(153,27,27,0.2)]">
                <NextImage 
                  src={selectedClue.evidence.image_url} 
                  alt={selectedClue.evidence.title} 
                  fill
                  className="object-contain" 
                  unoptimized={!selectedClue.evidence.image_url?.includes('supabase')}
                />
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.5)_100%)]"></div>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                   <h4 className="font-mono text-xs text-red-500 uppercase tracking-[0.3em] font-bold mb-2">Evidencia Crítica Registrada</h4>
                   <h2 className="font-cinzel text-3xl text-white uppercase leading-none border-l-4 border-red-600 pl-4">{selectedClue.evidence.title}</h2>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800/50 p-4 font-mono text-xs text-zinc-300 leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar italic whitespace-pre-wrap">
                  &quot;{selectedClue.evidence.description_full}&quot;
                </div>

                <div className="flex justify-between border-t border-zinc-800 pt-4 font-mono text-[10px] text-zinc-500 uppercase">
                  <span>Descubierto el: {new Date(selectedClue.discovered_at).toLocaleDateString()}</span>
                  <span>ID_OBJ: {selectedClue.evidence.id.split('-')[0]}</span>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
