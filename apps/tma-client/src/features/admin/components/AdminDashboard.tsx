'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, Map as MapIcon, Database, ShieldAlert, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { AdminRoomEditor } from './AdminRoomEditor';
import { AdminCharacterPossessor } from './AdminCharacterPossessor';
import { AdminNpcCreator } from './AdminNpcCreator';
import { createClient } from '@/lib/supabase/client';
import { 
  getAllVolunteers, 
  resetAllInvestigationPoints, 
  updateAssassinPollStatus, 
  selectRandomAssassin,
  ensureMurderRoom
} from '../api';
import { getGameState } from '@/features/characters/api';
import type { TMACharacterData } from '@/features/characters/api';

interface AdminDashboardProps {
  userRole: string;
}

export function AdminDashboard({ userRole }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'rooms' | 'polls' | 'users' | 'npcs' | 'case'>('rooms');
  const [volunteers, setVolunteers] = useState<TMACharacterData[]>([]);
  const [isPollActive, setIsPollActive] = useState(false);
  const [isBodyDiscoveryActive, setIsBodyDiscoveryActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCase, setCurrentCase] = useState<{
    id: string;
    target_murder_room_id: string | null;
    coordination_stage: string;
    murder_case_summary: string | null;
    target_name?: string;
  } | null>(null);
  const [caseLogs, setCaseLogs] = useState<string[]>([]);

  useEffect(() => {
    getGameState().then(state => {
      if (state) {
        setIsPollActive(state.assassin_poll_active);
        setIsBodyDiscoveryActive(state.body_discovery_active);
      }
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'polls') {
      const interval = setInterval(() => {
        getAllVolunteers().then(setVolunteers);
      }, 5000);
      getAllVolunteers().then(setVolunteers);
      return () => clearInterval(interval);
    }
    
    if (activeTab === 'case') {
      loadCaseData();
    }
  }, [activeTab]);

  const loadCaseData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: coordRoom } = await supabase
        .from('tma_rooms')
        .select('id, target_murder_room_id, coordination_stage, murder_case_summary, tma_rooms_target:target_murder_room_id(name)')
        .eq('name', 'COORDINACIÓN DE ASESINATO')
        .maybeSingle();

      if (coordRoom) {
        interface JoinedRoomMeta { name: string }
        const targetObj = coordRoom.tma_rooms_target as unknown as JoinedRoomMeta | JoinedRoomMeta[] | null;
        const targetName = Array.isArray(targetObj) ? targetObj[0]?.name : targetObj?.name;
        
        setCurrentCase({
          id: coordRoom.id,
          target_murder_room_id: coordRoom.target_murder_room_id,
          coordination_stage: coordRoom.coordination_stage,
          murder_case_summary: coordRoom.murder_case_summary,
          target_name: targetName
        });

        const { data: logs } = await supabase
          .from('tma_messages')
          .select('content')
          .eq('tma_room_id', coordRoom.id)
          .ilike('content', '[SISTEMA - ACCIÓN DE TIENDA]%')
          .order('created_at', { ascending: true });
        
        setCaseLogs(logs?.map(l => l.content) || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReopenRoom = async () => {
    if (!currentCase) return;
    if (!confirm('¿Seguro que quieres reabrir la sala del crimen? Esto permitirá el acceso de nuevo pero conservará el informe en este panel.')) return;
    setIsLoading(true);
    try {
      const { reopenCrimeScene } = await import('../api');
      await reopenCrimeScene(currentCase.id);
      toast.success('ZONA REABIERTA. MANTENIMIENTO FINALIZADO.');
      loadCaseData();
    } catch (e) {
      toast.error('Error al reabrir: ' + e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveCase = async () => {
    if (!currentCase) return;
    if (!confirm('¿CONFIRMAR RESOLUCIÓN TOTAL? Esta acción: \n1. Borrará este informe.\n2. Quitará el rol de asesino.\n3. Borrará TODAS las pistas del mapa.\n\nEsta acción no se puede deshacer.')) return;
    setIsLoading(true);
    try {
      const { resolveCurrentCase } = await import('../api');
      await resolveCurrentCase(currentCase.id);
      toast.success('SISTEMA LIMPIO: CASO ARCHIVADO Y RESETEADO.');
      setCurrentCase(null);
      setCaseLogs([]);
    } catch (e) {
      toast.error('Error al resolver caso: ' + e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPoints = async () => {
    if (!confirm('¿Seguro que quieres resetear los puntos de investigación de todos?')) return;
    setIsLoading(true);
    try {
      await resetAllInvestigationPoints();
      toast.success('Puntos reseteados a 7 para todos los estudiantes.');
    } catch (e) {
      toast.error('Error al resetear puntos: ' + e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePoll = async () => {
    setIsLoading(true);
    try {
      const newState = !isPollActive;
      await updateAssassinPollStatus(newState);
      setIsPollActive(newState);
      if (newState) {
        toast.success('PROTOCOLO BLACKOUT ACTIVADO: Poll de intención de asesinato en curso.', {
          duration: 5000,
          description: 'Todos los estudiantes han sido notificados.',
        });
      } else {
        toast.info('Poll de asesinato desactivado.');
      }
    } catch (e) {
      toast.error('Error al cambiar estado del poll: ' + e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBodyDiscovery = async () => {
    setIsLoading(true);
    try {
      const newState = !isBodyDiscoveryActive;
      // Reutilizamos updateGameState del api de characters ya que es genérico
      const { updateGameState: updateGame } = await import('@/features/characters/api');
      await updateGame({ body_discovery_active: newState });
      setIsBodyDiscoveryActive(newState);
      
      if (newState) {
        toast.error('！！！ ALERTA DE DESCUBRIMIENTO PROVOCADA ！！！', {
          duration: 8000,
          description: 'Protocolo de inspección de cadáver activado para todos los estudiantes.',
        });
      } else {
        toast.info('Protocolo de descubrimiento desactivado.');
      }
    } catch (e) {
      toast.error('Error al cambiar protocolo: ' + e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAssassin = async () => {
    if (!confirm('¿Confirmar selección aleatoria de asesino entre los voluntarios?')) return;
    setIsLoading(true);
    try {
      await selectRandomAssassin();
      toast.success('Asesino seleccionado y notificado.');
    } catch (e) {
      toast.error('Error al seleccionar asesino: ' + e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeCoordination = async () => {
    setIsLoading(true);
    try {
      await ensureMurderRoom();
      toast.success('HABITACIÓN DE COORDINACIÓN INICIALIZADA.', {
        description: 'La sala invisible ha sido creada o verificada.'
      });
    } catch (e) {
      toast.error('Error al inicializar sala: ' + e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto h-full animate-fade-in relative pt-4 text-(--glow)">
      {/* CRT Overlay */}
      <div className="fixed inset-0 crt-scanline pointer-events-none z-50 opacity-20" />

      {/* Header Admin */}
      <div className="relative w-full border border-red-500/50 bg-black/80 p-4 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.15)] backdrop-blur-md">
        <div className="flex justify-between items-center border-b border-red-500/30 pb-2">
          <div className="flex items-center gap-4">
            <Shield className="w-6 h-6 text-red-500 animate-pulse" />
            <h1 className="font-mono text-xl md:text-2xl font-bold tracking-[0.3em] uppercase underline decoration-red-500/50">
              SISTEMA MAESTRO: ACCESO DE {userRole.toUpperCase()}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs opacity-70">OVERRIDE_ENABLED</span>
            <div className="w-12 h-6 border border-red-500/50 p-1 relative overflow-hidden">
               <div className="w-full h-full bg-red-500/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* TABS MENU */}
        <div className="flex gap-4 mt-4 font-mono text-xs uppercase tracking-widest overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 border transition-all cursor-pointer ${activeTab === 'rooms' ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-(--glow)/30 opacity-60 hover:opacity-100 hover:bg-(--glow)/5 text-(--glow)'}`}
          >
             <MapIcon className="w-4 h-4 inline-block mr-2" />
             EDITOR DE SALAS
          </button>
          <button 
            onClick={() => setActiveTab('polls')}
            className={`px-4 py-2 border transition-all cursor-pointer ${activeTab === 'polls' ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-(--glow)/30 opacity-60 hover:opacity-100 hover:bg-(--glow)/5 text-(--glow)'}`}
          >
             <Users className="w-4 h-4 inline-block mr-2" />
             ELECCIÓN DE ASESINOS
          </button>
          <button 
            onClick={() => setActiveTab('case')}
            className={`px-4 py-2 border transition-all cursor-pointer ${activeTab === 'case' ? 'border-red-600 bg-red-600/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-(--glow)/30 opacity-60 hover:opacity-100 hover:bg-(--glow)/5 text-(--glow)'}`}
          >
             <Shield className="w-4 h-4 inline-block mr-2" />
             CASO ACTUAL
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 border transition-all cursor-pointer ${activeTab === 'users' ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-(--glow)/30 opacity-60 hover:opacity-100 hover:bg-(--glow)/5 text-(--glow)'}`}
          >
             <Database className="w-4 h-4 inline-block mr-2" />
             ESTADO GLOBAL
          </button>
          <button 
            onClick={() => setActiveTab('npcs')}
            className={`px-4 py-2 border transition-all cursor-pointer ${activeTab === 'npcs' ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-(--glow)/30 opacity-60 hover:opacity-100 hover:bg-(--glow)/5 text-(--glow)'}`}
          >
             <Users className="w-4 h-4 inline-block mr-2" />
             GESTOR DE NPCS
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        
        {/* LEFT PANEL: MAIN VIEW */}
        <div className="sci-border bg-black/40 backdrop-blur-sm p-6 relative min-h-[500px]">
           {activeTab === 'rooms' && (
              <AdminRoomEditor />
           )}

           {activeTab === 'case' && (
              <div className="flex flex-col space-y-6">
                 <h2 className="text-xl font-bold border-b border-red-500/30 pb-2 font-mono flex items-center gap-3">
                   <ShieldAlert className="text-red-500" /> EXPEDIENTE DE MANTENIMIENTO TÁCTICO
                 </h2>
                 
                 {!currentCase?.target_murder_room_id ? (
                    <div className="h-60 flex flex-col items-center justify-center opacity-30 font-mono text-sm uppercase">
                       <ShieldOff size={40} className="mb-4" />
                       No hay ningún operativo de asesinato en curso.
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 gap-6">
                       <div className="sci-border border-red-500/40 p-5 bg-red-600/5">
                          <label className="text-[10px] uppercase font-bold text-red-500 block mb-1">Zona Crítica en Mantenimiento:</label>
                          <p className="text-lg font-mono font-bold text-white tracking-widest">{currentCase.target_name || 'Desconocida'}</p>
                          <p className="text-[9px] font-mono opacity-50 uppercase mt-1">ID: {currentCase.target_murder_room_id}</p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                             <label className="text-[10px] uppercase font-bold text-red-500">Resumen del Expediente (IA SCION):</label>
                             <div className="bg-black/60 border border-red-500/20 p-4 font-mono text-[11px] leading-relaxed text-zinc-300 min-h-[150px] whitespace-pre-wrap">
                                {currentCase.murder_case_summary || 'Generando informe de clausura...'}
                             </div>
                          </div>
                          <div className="flex flex-col gap-2">
                             <label className="text-[10px] uppercase font-bold text-red-500">Log de Acciones del Sujeto:</label>
                             <div className="bg-black/60 border border-red-500/20 p-4 font-mono text-[9px] max-h-[150px] overflow-y-auto space-y-2 text-zinc-400 custom-scrollbar">
                                {caseLogs.length > 0 ? (
                                   caseLogs.map((log, i) => <div key={i} className="border-l-2 border-red-900 pl-2">{log}</div>)
                                ) : (
                                   <p className="italic opacity-30">No se han registrado acciones tácticas.</p>
                                )}
                             </div>
                          </div>
                       </div>

                        <div className="border-t border-red-500/20 pt-6 flex flex-col gap-4">
                           <button 
                             onClick={handleReopenRoom}
                             disabled={isLoading}
                             className="w-full py-4 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all"
                           >
                              Reabrir Área (Mantenimiento OFF)
                           </button>

                           <button 
                             onClick={handleResolveCase}
                             disabled={isLoading}
                             className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all"
                           >
                              CASO RESUELTO (RESET TOTAL)
                           </button>

                           <p className="text-center text-[9px] font-mono opacity-30 uppercase">
                              Atención: &quot;Reabrir&quot; solo abre la sala. &quot;Resolver&quot; limpia todo el sistema para un nuevo caso.
                           </p>
                        </div>
                    </div>
                 )}
              </div>
           )}
           
           {activeTab === 'polls' && (
              <div className="flex flex-col space-y-6">
                 <h2 className="text-xl font-bold border-b border-red-500/30 pb-2 font-mono">SELECCIÓN DE ASESINO (BLACKOUT PROTOCOL)</h2>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="sci-border border-red-500/30 p-4 bg-red-500/5">
                       <h3 className="font-mono text-xs mb-4 opacity-70 underline uppercase tracking-tighter">VOLUNTARIOS POSTULADOS</h3>
                       <div className="space-y-2">
                          {volunteers.length > 0 ? (
                             volunteers.map((v: TMACharacterData) => (
                                <div key={v.id} className="flex justify-between items-center bg-black/40 p-2 border border-red-500/20">
                                   <span className="font-mono text-xs text-red-400">{v.tma_name}</span>
                                   <span className="text-[8px] color-green-500/50 uppercase font-mono">Registrado</span>
                                </div>
                             ))
                          ) : (
                             <p className="font-mono text-[10px] italic">No hay voluntarios registrados actualmente.</p>
                          )}
                       </div>
                    </div>
                    <div className="sci-border border-red-500/30 p-4">
                       <h3 className="font-mono text-xs mb-4 text-red-400 font-bold tracking-widest uppercase">HERRAMIENTAS DE MÁSTER</h3>
                       <div className="space-y-4">
                          <button 
                            disabled={isLoading}
                            onClick={handleTogglePoll}
                            className={`w-full py-2 font-mono text-xs uppercase transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)] ${isPollActive ? 'bg-zinc-800 text-red-500 border border-red-500' : 'bg-red-600 text-white hover:bg-red-700'}`}
                          >
                             {isPollActive ? 'DETENER POLL DE INTENCIÓN' : 'LANZAR POLL DE "INTENCIÓN DE MATAR"'}
                          </button>

                          {volunteers.length > 0 && (
                            <button 
                              disabled={isLoading}
                              onClick={handleSelectAssassin}
                              className="w-full py-2 bg-white text-black font-mono text-xs uppercase font-bold hover:bg-zinc-200 transition-colors animate-pulse"
                            >
                               SELECCIONAR ASESINO ALEATORIO ({volunteers.length})
                            </button>
                          )}

                          <p className="font-mono text-[9px] opacity-40 leading-tight">
                             * El asesino será elegido al azar entre quienes acepten el poll. 
                             El sistema les notificará por chat off-rol.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'users' && (
              <div className="flex flex-col space-y-6">
                 <h2 className="text-xl font-bold border-b border-red-500/30 pb-2 font-mono uppercase tracking-widest flex items-center gap-2">
                   <Database size={20} className="text-red-500" /> ESTADO GLOBAL DE LA ACADEMIA
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="sci-border border-red-500/30 p-4 bg-red-500/5">
                       <h3 className="font-mono text-xs mb-4 opacity-70 underline uppercase">GESTIÓN DE RECURSOS</h3>
                       <div className="space-y-4">
                         <button 
                           disabled={isLoading}
                           onClick={handleResetPoints}
                           className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/50 font-mono text-xs uppercase hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                         >
                            RESET PUNTAJE DE INVESTIGACIÓN (7 IP)
                         </button>
                         
                         <button 
                           disabled={isLoading}
                           onClick={handleInitializeCoordination}
                           className="w-full py-3 bg-zinc-900 text-zinc-400 border border-zinc-700 font-mono text-xs uppercase hover:bg-zinc-800 hover:text-white transition-all"
                         >
                            INICIALIZAR SALA DE COORDINACIÓN (HIDDEN)
                         </button>
                       </div>
                       <p className="mt-2 font-mono text-[9px] opacity-40 mb-6">
                          Configuración de parámetros globales y salas de sistema.
                       </p>

                       <h3 className="font-mono text-xs mb-4 opacity-70 underline uppercase text-red-500">EVENTOS ESPECIALES</h3>
                       <button 
                         disabled={isLoading}
                         onClick={handleToggleBodyDiscovery}
                         className={`w-full py-3 font-mono text-xs uppercase transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] border ${isBodyDiscoveryActive ? 'bg-red-600 text-white border-white animate-pulse' : 'bg-black text-red-600 border-red-600 hover:bg-red-950'}`}
                       >
                          {isBodyDiscoveryActive ? 'DESACTIVAR PROTOCOLO DE CUERPO' : 'ACTIVAR DESCUBRIMIENTO DE CUERPO'}
                       </button>
                       <p className="mt-2 font-mono text-[9px] opacity-40">
                          Activa la alerta visual de &quot;Un cuerpo ha sido descubierto&quot; para todos los estudiantes en tiempo real.
                       </p>
                    </div>
                 </div>
              </div>
           )}
           {activeTab === 'npcs' && (
              <AdminNpcCreator />
           )}
        </div>

        {/* RIGHT PANEL: SIDE CONTROLS */}
        <div className="flex flex-col gap-6">
           <AdminCharacterPossessor />

           <div className="sci-border p-4 bg-black/60 backdrop-blur min-h-[150px]">
              <h3 className="font-mono text-xs border-b border-(--glow)/30 pb-2 mb-4 text-red-500/80">| ESTADO DEL SISTEMA</h3>
              <div className="text-[10px] font-mono text-(--glow)/70 space-y-2">
                 <p>SYS_ST: ONLINE</p>
                 <p>NET_LATENCY: 12ms</p>
                 <div className="w-full h-0.5 bg-(--glow)/10 mt-4 overflow-hidden">
                    <div className="w-1/2 h-full bg-red-500/50 animate-pulse shadow-[0_0_5px_red]" />
                 </div>
              </div>
           </div>

           <Link href="/dashboard" className="sci-border p-4 hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-[0.2em] border-white/20">
              &lt;&lt; REGRESAR AL DASHBOARD
           </Link>
        </div>

      </div>
    </div>
  );
}
