'use client';

import { useState } from 'react';
import { analyzeCoordinationLogs } from '../api';
import type { AnalysisResult } from '../api';
import { Cpu, AlertCircle, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

export function AssassinConsultant({ roomId }: { roomId?: string }) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!roomId) return;
    setIsLoading(true);
    try {
      const result = await analyzeCoordinationLogs(roomId);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sci-border p-4 bg-red-950/10 border-red-500/30 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-red-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="text-red-500 animate-pulse" size={16} />
          <span className="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">SCION_ANALYTICS v1.0</span>
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={isLoading}
          className="bg-red-600 text-white font-mono text-[9px] px-3 py-1 uppercase hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? <Loader2 size={10} className="animate-spin" /> : 'SINC_LOGS'}
        </button>
      </div>

      {!analysis && !isLoading && (
        <div className="h-20 flex flex-col items-center justify-center opacity-40 font-mono text-[10px] text-center italic leading-tight">
          Sincronice los logs de la sala para obtener un <br/> análisis táctico predictivo.
        </div>
      )}

      {isLoading && (
         <div className="h-20 flex items-center justify-center font-mono text-[10px] text-red-500 animate-pulse text-center">
            ANALIZANDO PATRONES DE COMPORTAMIENTO...
         </div>
      )}

      {analysis && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-500 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-red-400 font-bold uppercase">
              <AlertCircle size={10} /> EVALUACIÓN DE RIESGO
            </div>
            <p className="font-mono text-[10px] text-zinc-300 leading-tight border-l-2 border-red-500 pl-2">
              {analysis.evaluation}
            </p>
          </div>

          <div className="space-y-2">
             <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-400 font-bold uppercase">
                <CheckCircle2 size={10} className="text-green-500" /> RECOMENDACIONES TÁCTICAS
             </div>
             <div className="grid grid-cols-1 gap-1.5">
                {analysis.suggestions.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-red-400/5 p-2 border border-red-400/10">
                    <ChevronRight size={10} className="text-red-500 mt-0.5 shrink-0" />
                    <span className="font-mono text-[9px] text-zinc-400 leading-none">{s}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
