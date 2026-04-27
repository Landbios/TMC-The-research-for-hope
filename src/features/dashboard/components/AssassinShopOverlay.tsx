'use client';

import { useState, useEffect } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { 
  X, Skull, Zap, 
  Search, ShieldAlert, Edit3, Trash2, 
  Save, Ghost, Target, Info
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { AssassinConsultant } from '@/features/ai/components/AssassinConsultant';
import { 
  ensureMurderRoom, 
  getRoomEvidences, 
  updateTmaEvidenceDetail, 
  deleteTmaEvidence,
  logAssassinAction,
  finalizeAssassination 
} from '@/features/admin/api';
import { useRouter } from 'next/navigation';

type Tab = 'PREPARATION' | 'COVERUP';

export function AssassinShopOverlay({ onClose }: { onClose: () => void }) {
  const murderPoints = useTmaStore(state => state.murderPoints);
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<Tab>('PREPARATION');
  const [targetRoomId, setTargetRoomId] = useState<string | null>(null);
  const [targetRoomName, setTargetRoomName] = useState<string>('CARGANDO...');
  const [isLoading, setIsLoading] = useState(false);
  const [coordinationRoomId, setCoordinationRoomId] = useState<string | null>(null);
  
  // States for Cover-up
  const [roomEvidences, setRoomEvidences] = useState<import('@/features/investigation/api').TMAEvidence[]>([]);
  const [revealedClues, setRevealedClues] = useState<Set<string>>(new Set());
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', brief: '', full: '' });

  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    try {
      setIsLoading(true);
      const coordRoomId = await ensureMurderRoom();
      setCoordinationRoomId(coordRoomId);
      
      // Obtener la sala objetivo desde la base de datos
      const supabase = createClient();
      const { data: coordRoom } = await supabase
        .from('tma_rooms')
        .select('target_murder_room_id, tma_rooms_target:target_murder_room_id(name)')
        .eq('id', coordRoomId)
        .single();
      
      if (coordRoom?.target_murder_room_id) {
        setTargetRoomId(coordRoom.target_murder_room_id);
        const targetObj = coordRoom.tma_rooms_target as unknown as { name: string } | { name: string }[] | null;
        const targetName = Array.isArray(targetObj) ? targetObj[0]?.name : targetObj?.name;
        setTargetRoomName(targetName || 'SALA DESCONOCIDA');
        
        // Cargar evidencias de esa sala específica
        const evidences = await getRoomEvidences(coordRoom.target_murder_room_id);
        setRoomEvidences(evidences);
      } else {
        setTargetRoomName('SALA NO DEFINIDA');
      }
    } catch (err) {
      console.error("Error loading shop data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEvidences = async () => {
    if (!targetRoomId) return;
    const evidences = await getRoomEvidences(targetRoomId);
    setRoomEvidences(evidences);
  };

  const deductPoints = async (cost: number) => {
    if (!myCharacterId) return false;
    const supabase = createClient();
    const { error } = await supabase
      .from('tma_characters')
      .update({ murder_points: murderPoints - cost })
      .eq('id', myCharacterId);

    if (error) {
      toast.error('FALLO AL ACTUALIZAR PUNTOS');
      return false;
    }
    // Update local store immediately (Zustand)
    useTmaStore.setState({ murderPoints: murderPoints - cost });
    return true;
  };

  const handlePreparationAction = async (action: string, label: string) => {
    if (murderPoints < 1) {
      toast.error('PUNTOS INSUFICIENTES');
      return;
    }

    setIsLoading(true);
    if (await deductPoints(1)) {
      await logAssassinAction(myCharacterId!, label, `El asesino ha activado ${label}`);
      
      switch(action) {
        case 'SYSTEM_GLITCH':
          toast.error('SISTEMA COMPROMETIDO: Glitch global inducido.');
          break;
        case 'ALIBI':
          toast.success('COARTADA ESTABLECIDA: Tu siguiente movimiento será indetectable.');
          break;
        default:
          toast.success(`${label.toUpperCase()} ACTIVADO EXITOSAMENTE`);
      }
    }
    setIsLoading(false);
  };

  const handleRevealClue = async (clueId: string) => {
    if (revealedClues.has(clueId)) return;
    if (murderPoints < 1) {
      toast.error('PUNTOS INSUFICIENTES');
      return;
    }

    setIsLoading(true);
    if (await deductPoints(1)) {
      setRevealedClues(prev => new Set(prev).add(clueId));
      toast.success('INFORMACIÓN EXTRAÍDA');
    }
    setIsLoading(false);
  };

  const startEditing = (clue: { id: string; title: string; description_brief?: string; description_full?: string }) => {
    setSelectedClueId(clue.id);
    setEditForm({
      title: clue.title,
      brief: clue.description_brief || '',
      full: clue.description_full || ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedClueId) return;
    if (murderPoints < 1) {
      toast.error('PUNTOS INSUFICIENTES');
      return;
    }

    setIsLoading(true);
    if (await deductPoints(1)) {
      await updateTmaEvidenceDetail(selectedClueId, {
        title: editForm.title,
        description_brief: editForm.brief,
        description_full: editForm.full
      });
      await logAssassinAction(myCharacterId!, 'ALTERACIÓN', `Evidencia alterada: ${editForm.title}`);
      toast.success('EVIDENCIA ALTERADA');
      refreshEvidences();
      setIsEditing(false);
      setSelectedClueId(null);
    }
    setIsLoading(false);
  };

  const handleDeleteClue = async (clueId: string, title: string) => {
    if (murderPoints < 1) {
      toast.error('PUNTOS INSUFICIENTES');
      return;
    }

    if (!confirm(`¿Estás seguro de ELIMINAR permanentemente la pista "${title}"?`)) return;

    setIsLoading(true);
    if (await deductPoints(1)) {
      await deleteTmaEvidence(clueId);
      await logAssassinAction(myCharacterId!, 'ELIMINACIÓN', `Evidencia eliminada: ${title}`);
      toast.error('EVIDENCIA ELIMINADA');
      refreshEvidences();
      setSelectedClueId(null);
    }
    setIsLoading(false);
  };

  const handleFinalize = async () => {
    if (!coordinationRoomId || !myCharacterId) return;
    if (!confirm("¿CONFIRMAR CLAUSURA DE COORDINACIÓN? Esto sellará el plan y te expulsará de la sala secreta.")) return;

    setIsLoading(true);
    try {
      await finalizeAssassination(coordinationRoomId, myCharacterId);
      toast.success("PROTOCOLO FINALIZADO. EXPEDIENTE SELLADO.");
      onClose();
      router.push('/map');
    } catch (err) {
      toast.error("ERROR AL FINALIZAR: " + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-red-950/20 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-3xl bg-black border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.3)] overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="bg-red-600 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Skull className="text-white animate-pulse" size={24} />
            <h2 className="font-mono text-lg font-bold text-white tracking-[0.2em] uppercase leading-none">
              TERMINAL DE OPERACIONES ASESINO
            </h2>
          </div>
          <button onClick={onClose} className="text-white hover:rotate-90 transition-transform">
            <X size={24} />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-red-950/40 border-b border-red-600/30 p-2 px-6 flex justify-between items-center font-mono text-[10px] shrink-0">
          <div className="flex gap-4">
             <span className="text-red-400 uppercase">Estado: <span className="text-white">OPERATIVO</span></span>
             <span className="text-red-400 uppercase">Objetivo: <span className="text-red-500 font-bold">{targetRoomName}</span></span>
          </div>
          <div className="flex items-center gap-2">
            {(useTmaStore.getState().userRole === 'staff' || useTmaStore.getState().userRole === 'superadmin') && (
              <button 
                onClick={async () => {
                  if (!myCharacterId) return;
                  const supabase = createClient();
                  const { error } = await supabase.from('tma_characters').update({ murder_points: 7 }).eq('id', myCharacterId);
                  if (error) {
                    toast.error('FALLO AL RESTABLECER MP EN DB');
                  } else {
                    useTmaStore.setState({ murderPoints: 7 });
                    toast.success('PROTOCOLO REINICIADO: 7 MP RESTAURADOS');
                  }
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[8px] px-2 py-0.5 border border-zinc-700 mr-4 transition-colors"
              >
                RESTABLECER PROTOCOLO (7 MP)
              </button>
            )}
            <span className="text-red-400">PUNTOS DE ASESINATO:</span>
            <span className="text-white font-bold bg-red-600 px-3 py-0.5 animate-pulse">[{murderPoints} MP]</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-red-600/30 bg-black shrink-0">
          <button 
            onClick={() => setActiveTab('PREPARATION')}
            className={`flex-1 py-3 font-mono text-xs font-bold transition-all ${activeTab === 'PREPARATION' ? 'bg-red-600/20 text-red-500 border-b-2 border-red-600' : 'text-zinc-500 hover:text-red-400'}`}
          >
            PREPARACIÓN DE ESCENA
          </button>
          <button 
            onClick={() => setActiveTab('COVERUP')}
            className={`flex-1 py-3 font-mono text-xs font-bold transition-all ${activeTab === 'COVERUP' ? 'bg-red-600/20 text-red-500 border-b-2 border-red-600' : 'text-zinc-500 hover:text-red-400'}`}
          >
            ENCUBRIMIENTO & ALTERACIÓN
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 relative custom-scrollbar">
          <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-red-600/5 via-transparent to-red-600/5 animate-scanline opacity-30"></div>

          {activeTab === 'PREPARATION' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ShopAction 
                title="COLOCAR CEBO" 
                cost={1} 
                icon={<Ghost size={20} />} 
                description="Planta un rumor o rastro falso que atraerá sospechas hacia un tercer implicado."
                onClick={() => handlePreparationAction('BAIT', 'Colocación de Cebo')}
                disabled={isLoading || murderPoints < 1}
              />
              <ShopAction 
                title="EVENTO DISTRACTOR" 
                cost={1} 
                icon={<Zap size={20} />} 
                description="Provoca un fallo menor en las luces o ruidos lejanos para dispersar a los estudiantes."
                onClick={() => handlePreparationAction('SYSTEM_GLITCH', 'Evento Distractor')}
                disabled={isLoading || murderPoints < 1}
              />
              <ShopAction 
                title="SEÑAL DE ATRACCIÓN" 
                cost={1} 
                icon={<Target size={20} />} 
                description="Envía una señal o invita a un estudiante específico a acercarse a una zona comprometida."
                onClick={() => handlePreparationAction('ATTRACT', 'Señal de Atracción')}
                disabled={isLoading || murderPoints < 1}
              />
              <ShopAction 
                title="COARTADA PERFECTA" 
                cost={1} 
                icon={<ShieldAlert size={20} />} 
                description="Elimina tus registros de movimiento de la última hora en el log del sistema."
                onClick={() => handlePreparationAction('ALIBI', 'Coartada PerfectA')}
                disabled={isLoading || murderPoints < 1}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información Section */}
              <section>
                 <div className="flex items-center gap-2 mb-3 border-l-4 border-red-600 pl-3">
                    <Info size={16} className="text-red-500" />
                    <h3 className="font-mono text-sm font-bold text-white uppercase group">INFORMACIÓN: ARCHIVOS DE EVIDENCIA</h3>
                 </div>
                 
                 {!targetRoomId ? (
                   <p className="font-mono text-[10px] text-zinc-500 p-4 border border-dashed border-red-900/30 text-center uppercase">
                     ESPERANDO DEFINICIÓN DE SALA OBJETIVO...
                   </p>
                 ) : (
                   <div className="grid grid-cols-1 gap-2">
                     {roomEvidences.length === 0 ? (
                       <p className="font-mono text-[10px] text-zinc-500 italic p-2">NO SE DETECTARON SEÑALES EN ESTA SALA...</p>
                     ) : (
                       roomEvidences.map(clue => (
                         <div key={clue.id} className="sci-border bg-zinc-900/30 p-2 flex flex-col gap-2 border-red-900/20">
                            <div className="flex justify-between items-center">
                               <span className="font-mono text-[11px] font-bold text-red-500 uppercase">{clue.title}</span>
                               <div className="flex gap-2">
                                  {!revealedClues.has(clue.id) && (
                                    <button 
                                      onClick={() => handleRevealClue(clue.id)}
                                      disabled={isLoading || murderPoints < 1}
                                      className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-mono text-[9px] px-2 py-0.5 transition-colors disabled:opacity-50"
                                    >
                                      <Search size={10} /> REVELAR (1 MP)
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => startEditing(clue)}
                                    className="p-1 bg-zinc-800 hover:bg-red-900/40 text-zinc-400 hover:text-red-400 border border-zinc-700 transition-colors"
                                    title="Alterar Pista"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteClue(clue.id, clue.title)}
                                    disabled={isLoading || murderPoints < 1}
                                    className="p-1 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-600 border border-zinc-700 transition-colors"
                                    title="Eliminar Pista"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                               </div>
                            </div>
                            
                            {revealedClues.has(clue.id) && (
                               <div className="bg-black/50 p-2 border-l border-red-600/50 animate-reveal text-[10px] font-mono">
                                  <p className="text-zinc-500 mb-1">DETALLES OCULTOS:</p>
                                  <p className="text-white italic">&quot;{clue.description_full || clue.description_brief}&quot;</p>
                                  {clue.is_fake && <p className="text-red-400 mt-1 font-bold">[MARCADA COMO FALSA]</p>}
                               </div>
                             )}
                         </div>
                       ))
                     )}
                   </div>
                 )}
              </section>

              {/* Edit Interface */}
              {isEditing && (
                <section className="bg-red-950/20 border border-red-600 p-4 animate-slide-up">
                   <div className="flex justify-between items-center mb-4 border-b border-red-600/30 pb-2">
                      <h4 className="font-mono text-xs font-bold text-red-500 uppercase flex items-center gap-2">
                        <Edit3 size={14} /> ALTERACIÓN DE REGISTRO
                      </h4>
                      <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-white"><X size={16}/></button>
                   </div>
                   
                   <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-mono text-red-400 uppercase mb-1">Título de la Pista</label>
                        <input 
                          type="text" 
                          value={editForm.title}
                          onChange={e => setEditForm({...editForm, title: e.target.value})}
                          className="w-full bg-black border border-red-900/50 p-2 font-mono text-[11px] text-white focus:border-red-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-red-400 uppercase mb-1">Descripción Breve (Visible al Inspeccionar)</label>
                        <textarea 
                          value={editForm.brief}
                          onChange={e => setEditForm({...editForm, brief: e.target.value})}
                          className="w-full bg-black border border-red-900/50 p-2 font-mono text-[11px] text-white h-16 focus:border-red-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-red-400 uppercase mb-1">Descripción Detallada (Log de Investigación)</label>
                        <textarea 
                          value={editForm.full}
                          onChange={e => setEditForm({...editForm, full: e.target.value})}
                          className="w-full bg-black border border-red-900/50 p-2 font-mono text-[11px] text-white h-24 focus:border-red-600 outline-none"
                        />
                      </div>
                      
                      <button 
                        onClick={handleSaveEdit}
                        disabled={isLoading || murderPoints < 1}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold py-2 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                         <Save size={16} /> APLICAR ALTERACIÓN (1 MP)
                      </button>
                   </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-red-600/5 border-t border-red-600/30 flex flex-col gap-4 shrink-0">
           {coordinationRoomId && <AssassinConsultant roomId={coordinationRoomId} />}
           <p className="font-mono text-[8px] text-red-500/50 text-center uppercase tracking-widest">
             ATENCIÓN: CADA ACCIÓN DEJA UNA TRAZA RESIDUAL EN LA BASE DE DATOS DE MONOKUMA
           </p>
           
           <button 
             onClick={handleFinalize}
             disabled={isLoading}
             className="w-full mt-2 py-3 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold border-2 border-red-400/50 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
           >
             <Skull size={18} /> FINALIZAR COORDINACIÓN (Sellar Plan)
           </button>
        </div>
      </div>
    </div>
  );
}

function ShopAction({ title, cost, icon, description, onClick, disabled }: { title: string, cost: number, icon: React.ReactNode, description: string, onClick: () => void, disabled: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`sci-border p-4 flex flex-col text-left transition-all relative overflow-hidden group border-red-900/40 ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:bg-red-600/10 hover:border-red-500'}`}
    >
       <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-red-950/20 border border-red-900/40 text-red-500 group-hover:scale-110 transition-transform">
             {icon}
          </div>
          <div className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold font-mono shadow-sm">
             -{cost} MP
          </div>
       </div>
       <h4 className="font-mono text-xs font-bold text-white uppercase mb-1 tracking-wider group-hover:text-red-400 transition-colors">{title}</h4>
       <p className="font-mono text-[9px] text-zinc-500 uppercase leading-tight line-clamp-2">
          {description}
       </p>
       
       <div className="absolute bottom-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-600"></div>
       </div>
    </button>
  );
}
