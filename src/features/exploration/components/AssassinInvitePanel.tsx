'use client';

import React, { useEffect, useState } from 'react';
import { 
  getAllAliveCandidates, 
  assignAssassinStatus, 
  updateCoordinationStage, 
  setTargetMurderRoom,
  getAllRooms,
  createTmaEvidence
} from '@/features/admin/api';
import { analyzeCoordinationLogs, SuggestedClue } from '@/features/ai/api';
import { 
  UserPlus, UserMinus, ShieldAlert, Loader2, X, 
  Settings, Play, Cpu, Target, CheckCircle2, PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Candidate {
  id: string;
  tma_name: string | null;
  tma_title: string;
  image_url: string | null;
  is_assassin: boolean;
}

interface Room {
  id: string;
  name: string;
}

interface AssassinInvitePanelProps {
  roomId: string;
  currentStage: 'PLANNING' | 'PREPARATION' | 'EXECUTION' | 'FINISHED';
  onClose?: () => void;
}

export function AssassinInvitePanel({ roomId, currentStage, onClose }: AssassinInvitePanelProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedClues, setSuggestedClues] = useState<SuggestedClue[]>([]);
  const [selectedTargetRoomId, setSelectedTargetRoomId] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [candData, roomData] = await Promise.all([
        getAllAliveCandidates(),
        getAllRooms()
      ]);
      setCandidates(candData as Candidate[]);
      setRooms(roomData.filter(r => r.name !== 'COORDINACIÓN DE ASESINATO') as Room[]);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("ERROR EN LA CARGA DE DATOS");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAssassin = async (id: string, currentStatus: boolean) => {
    try {
      setProcessingId(id);
      await assignAssassinStatus(id, !currentStatus);
      toast.success(currentStatus ? "ROL DE ASESINO RETIRADO" : "INVITACIÓN DE ASESINO ENVIADA");
      await loadData();
    } catch (err) {
      console.error("Error toggling assassin status:", err);
      toast.error("ERROR EN EL PROTOCOLO");
    } finally {
      setProcessingId(null);
    }
  };

  const handleGenerateSuggestions = async () => {
    try {
      setIsGenerating(true);
      const result = await analyzeCoordinationLogs(roomId);
      setSuggestedClues(result.suggestedClues);
      toast.success("ANÁLISIS DE SCION COMPLETADO");
    } catch (err) {
      console.error("Error generating suggestions:", err);
      toast.error("ERROR AL CONSULTAR LA IA");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInstantiateClue = async (clue: SuggestedClue) => {
    if (!selectedTargetRoomId) {
      toast.error("SELECCIONA UNA SALA OBJETIVO PRIMERO");
      return;
    }
    try {
      await createTmaEvidence({
        room_id: selectedTargetRoomId,
        title: clue.title,
        description_brief: clue.description_brief,
        description_full: clue.description_full,
        is_fake: clue.is_fake,
        investigation_cost: 1, // Requerimiento del usuario: Costo 1
        pos_x: 0, pos_y: 1.5, pos_z: 0 // Posición inicial en el centro
      });
      toast.success(`PISTA: "${clue.title}" INSTANCIADA`);
      setSuggestedClues(prev => prev.filter(c => c.title !== clue.title));
    } catch (err) {
      console.error("Error instantiating clue:", err);
      toast.error("ERROR AL COLOCAR LA PISTA");
    }
  };

  const handleUpdateStage = async (nextStage: 'PLANNING' | 'PREPARATION' | 'EXECUTION') => {
    try {
      setIsTransitioning(true);
      await updateCoordinationStage(roomId, nextStage);
      toast.success(`SALA ACTUALIZADA: FASE DE ${nextStage}`);
    } catch {
      toast.error("ERROR AL GUARDAR");
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleSetTargetRoom = async (tid: string) => {
    try {
      await setTargetMurderRoom(roomId, tid);
      setSelectedTargetRoomId(tid);
      toast.success("SALA OBJETIVO BLOQUEADA");
    } catch {
      toast.error("ERROR AL ELIMINAR");
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-zinc-950/95 border border-red-500/30 backdrop-blur-2xl p-6 rounded-sm w-[450px] shadow-[0_0_60px_rgba(239,68,68,0.2)] animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex justify-between items-center border-b border-red-500/20 pb-4">
        <div className="flex items-center gap-3">
           <ShieldAlert className="text-red-500" size={20} />
           <div className="flex flex-col">
              <h3 className="font-mono text-sm font-bold tracking-widest text-red-500 uppercase">
                Panel de Coordinación
              </h3>
               <span className="font-mono text-[8px] text-zinc-500 uppercase">
                 Status: {currentStage} {" // Protocolo Scion"}
               </span>
           </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* RENDERIZADO POR FASES */}
      {currentStage === 'PLANNING' && (
        <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95">
           <div className="bg-red-500/5 p-3 border border-red-500/20">
              <p className="text-[10px] font-mono text-zinc-400 leading-tight uppercase">
                <span className="text-red-500 font-bold">Fase de Planteamiento:</span> Inicie el diálogo con el asesino. Mantenga una coordinación clara del incidente.
              </p>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 max-h-[300px] custom-scrollbar">
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="animate-spin text-red-500" size={20} /></div>
              ) : candidates.map(cand => (
                 <div key={cand.id} className={`flex items-center gap-3 p-2 border ${cand.is_assassin ? 'border-red-500/50 bg-red-600/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
                    <div className="relative w-8 h-8 border border-zinc-700">
                       <Image src={cand.image_url || 'https://picsum.photos/50/50'} alt={cand.tma_name || ''} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="font-mono text-[10px] font-bold text-white truncate uppercase">{cand.tma_name}</h4>
                    </div>
                    <button
                      onClick={() => handleToggleAssassin(cand.id, cand.is_assassin)}
                      disabled={processingId === cand.id}
                      className={`p-1.5 rounded-sm ${cand.is_assassin ? 'text-red-500 bg-red-500/10' : 'text-zinc-500 border border-zinc-800 hover:text-white hover:bg-zinc-800'}`}
                    >
                      {processingId === cand.id ? <Loader2 size={14} className="animate-spin" /> : cand.is_assassin ? <UserMinus size={16} /> : <UserPlus size={16} />}
                    </button>
                 </div>
              ))}
           </div>

           <button 
             onClick={() => handleUpdateStage('PREPARATION')}
             disabled={isTransitioning}
             className="w-full py-3 bg-red-600/20 border border-red-600 text-red-600 font-mono text-xs uppercase font-bold hover:bg-red-600 hover:text-black transition-all flex items-center justify-center gap-2"
           >
              {isTransitioning ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />}
              AVANZAR A PREPARACIÓN
           </button>
        </div>
      )}

      {currentStage === 'PREPARATION' && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="font-mono text-[9px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                    <Target size={12} className="text-red-500" /> Sala del Incidente (Bloqueo)
                 </label>
                 <select 
                   value={selectedTargetRoomId}
                   onChange={(e) => handleSetTargetRoom(e.target.value)}
                   className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px] p-2 uppercase outline-hidden focus:border-red-500"
                 >
                    <option value="">Seleccionar habitación...</option>
                    {rooms.map(room => (
                       <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                 </select>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center bg-zinc-900/80 p-2 border border-zinc-800">
                    <span className="font-mono text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-2">
                       <Cpu size={14} className="text-red-500" /> Sugerencias de SCION (Gemini)
                    </span>
                    <button 
                      onClick={handleGenerateSuggestions}
                      disabled={isGenerating}
                      className="px-3 py-1 bg-red-600 text-white font-mono text-[9px] uppercase font-bold hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                       {isGenerating ? 'ANALIZANDO...' : 'SINC_LOGS'}
                    </button>
                 </div>

                 <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
                    {suggestedClues.length === 0 ? (
                       <div className="h-16 flex items-center justify-center border border-zinc-900 border-dashed opacity-20">
                          <span className="font-mono text-[9px] text-zinc-500">SIN DATOS ANALIZADOS</span>
                       </div>
                    ) : suggestedClues.map((clue, idx) => (
                       <div key={idx} className="bg-red-600/5 border border-red-500/20 p-2 flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                             <div className="flex flex-col">
                                <span className="font-mono text-[10px] text-red-500 font-bold uppercase">{clue.title}</span>
                                <span className="font-mono text-[8px] text-zinc-500 line-clamp-1 italic">{clue.description_brief}</span>
                             </div>
                             <button 
                               onClick={() => handleInstantiateClue(clue)}
                               className="p-1 px-2 border border-green-500/50 text-green-500 hover:bg-green-500 hover:text-black transition-all flex items-center gap-1 font-mono text-[8px] uppercase font-bold"
                             >
                                <PlusCircle size={10} /> Instanciar
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="flex gap-2">
              <button 
                onClick={() => handleUpdateStage('PLANNING')}
                className="flex-1 py-3 bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono text-[10px] uppercase hover:bg-zinc-800 transition-all"
              >
                 VOLVER A PLANTEO
              </button>
              <button 
                onClick={() => handleUpdateStage('EXECUTION')}
                disabled={isTransitioning}
                className="flex-none w-[66%] py-3 bg-red-600 border border-red-400 text-white font-mono text-xs uppercase font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                 {isTransitioning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                 INICIAR EJECUCIÓN
              </button>
           </div>
        </div>
      )}

      {currentStage === 'EXECUTION' && (
        <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95">
           <div className="bg-red-600 p-4 shadow-[0_0_20px_rgba(220,38,38,0.4)] text-center space-y-1">
              <h4 className="font-mono text-sm font-black text-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                 <CheckCircle2 size={18} /> ASALTO EN CURSO
              </h4>
              <p className="font-mono text-[9px] text-black/80 font-bold uppercase">
                 Herramientas de tienda desbloqueadas para el asesino.
              </p>
           </div>
           
           <div className="p-4 border border-zinc-800 bg-zinc-900/50 text-center">
              <p className="font-mono text-[10px] text-zinc-500 uppercase leading-relaxed">
                 Supervise los logs de la tienda para verificar las compras de preparación y encubrimiento realizadas por el asesino.
              </p>
           </div>

           <button 
             onClick={() => handleUpdateStage('PREPARATION')}
             className="w-full py-2 bg-transparent border border-zinc-800 text-zinc-700 font-mono text-[9px] uppercase hover:text-zinc-400 transition-all"
           >
              DETENER PROTOCOLO / VOLVER A PREP
           </button>
        </div>
      )}

      <div className="text-center pt-2 border-t border-red-500/10">
         <span className="text-[9px] font-mono text-red-500/60 uppercase tracking-[0.4em] animate-pulse">
           S.C.I.O.N. Murder Academy v1.0
         </span>
      </div>
    </div>
  );
}
