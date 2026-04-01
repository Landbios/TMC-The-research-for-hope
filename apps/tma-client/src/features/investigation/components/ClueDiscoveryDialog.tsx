'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { TMAEvidence, startEvidencePoll } from '../api';
import { useTmaStore } from '@/store/useTmaStore';

interface ClueDiscoveryDialogProps {
  evidence: TMAEvidence;
  onClose: () => void;
}

export function ClueDiscoveryDialog({ evidence, onClose }: ClueDiscoveryDialogProps) {
  const [isStarting, setIsStarting] = useState(false);
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const ip = useTmaStore(state => state.investigationPoints);

  const handleStartPoll = async () => {
    if (!myCharacterId || isStarting) return;
    if (ip < 1) {
      alert('SISTEMA: Energía insuficiente (IP) para iniciar investigación.');
      return;
    }

    try {
      setIsStarting(true);
      await startEvidencePoll(evidence.id, myCharacterId);
      // El Realtime se encargará de mostrar el overlay de votación a todos
      onClose();
    } catch (error) {
      console.error('Error starting poll:', error);
      alert('Error en el protocolo de comunicación.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-100 p-4 backdrop-blur-sm bg-black/60">
      <div className="bg-zinc-950 border-2 border-red-900/50 w-full max-w-lg shadow-[0_0_30px_rgba(153,27,27,0.3)] animate-fade-in">
        {/* Cabecera Glitch */}
        <div className="bg-red-950/20 border-b border-red-900/30 p-4 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <h2 className="font-cinzel text-xl text-red-500 tracking-tighter uppercase relative z-10">
             Hallazgo Detectado
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors relative z-10">
            [ X ]
          </button>
        </div>

        {/* Contenido Visual */}
        <div className="p-6 space-y-6">
          <div className="flex gap-6 items-start">
            <div className="w-32 h-32 bg-zinc-900 border border-zinc-800 shrink-0 relative group">
              <NextImage 
                src={evidence.image_url || 'https://picsum.photos/200/200?grayscale'} 
                alt={evidence.title}
                fill
                className="object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                unoptimized={!evidence.image_url?.includes('supabase')}
              />
              <div className="absolute inset-0 border border-red-500/0 group-hover:border-red-500/50 transition-all"></div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-mono text-xs text-red-400 uppercase tracking-widest mb-1">Evidencia</h3>
                <p className="font-cinzel text-lg text-white leading-tight uppercase">{evidence.title}</p>
              </div>

              <div>
                <h3 className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">Descripción Preliminar</h3>
                <p className="font-mono text-xs text-zinc-300 leading-relaxed italic">
                  &quot;{evidence.description_brief || 'Un objeto extraño que parece fuera de lugar en esta habitación...'}&quot;
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 space-y-3">
             <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-500 uppercase">Coste de Energía (IP)</span>
                <span className="text-red-500">1 PUNTO</span>
             </div>
             <p className="text-[10px] font-mono text-zinc-400 leading-tight">
               Iniciará un **PROTOCOLO DE CONSENSO**. Se requiere la aprobación de la mayoría de los presentes para añadir esta pista al Log de Investigación oficial.
             </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-900 gap-4 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-500 font-mono text-xs uppercase transition-all"
          >
            ignorar
          </button>
          
          <button 
            onClick={handleStartPoll}
            disabled={isStarting}
            className="px-8 py-2 bg-red-900/20 border border-red-900 text-red-500 hover:bg-red-500 hover:text-black font-mono text-xs uppercase transition-all shadow-[0_0_15px_rgba(153,27,27,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50"
          >
            {isStarting ? 'Iniciando...' : 'INICIAR INVESTIGACIÓN'}
          </button>
        </div>
      </div>
    </div>
  );
}
