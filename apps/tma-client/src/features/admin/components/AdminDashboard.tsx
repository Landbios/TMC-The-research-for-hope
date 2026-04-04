'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, Map as MapIcon, Database } from 'lucide-react';
import { toast } from 'sonner';
import { AdminRoomEditor } from './AdminRoomEditor';
import { getAllVolunteers, resetAllInvestigationPoints, updateAssassinPollStatus, selectRandomAssassin } from '../api';
import { getGameState } from '@/features/characters/api';
import type { TMACharacterData } from '@/features/characters/api';


interface AdminDashboardProps {
  userRole: string;
}

export function AdminDashboard({ userRole }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'rooms' | 'polls' | 'users'>('rooms');
  const [volunteers, setVolunteers] = useState<TMACharacterData[]>([]);
  const [isPollActive, setIsPollActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getGameState().then(state => {
      if (state) setIsPollActive(state.assassin_poll_active);
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
  }, [activeTab]);

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

  const handleSelectAssassin = async () => {
    if (volunteers.length === 0) {
       toast.error('No hay voluntarios registrados para el proceso de selección.');
       return;
    }
    setIsLoading(true);
    try {
      const selected = await selectRandomAssassin();
      toast.success(`PROTOCOLO COMPLETADO: El asesino seleccionado es ${selected.tma_name}`, {
        duration: 10000,
        description: 'Se ha enviado una notificación privada al agresor.',
      });
      setIsPollActive(false);
      setVolunteers([]);
    } catch (e) {
      toast.error('Error en la selección: ' + e);
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
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 border transition-all cursor-pointer ${activeTab === 'users' ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-(--glow)/30 opacity-60 hover:opacity-100 hover:bg-(--glow)/5 text-(--glow)'}`}
          >
             <Database className="w-4 h-4 inline-block mr-2" />
             ESTADO GLOBAL
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
                 <h2 className="text-xl font-bold border-b border-red-500/30 pb-2 font-mono">ESTADO GLOBAL DE LA ACADEMIA</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="sci-border border-red-500/30 p-4 bg-red-500/5">
                       <h3 className="font-mono text-xs mb-4 opacity-70 underline uppercase">GESTIÓN DE RECURSOS</h3>
                       <button 
                         disabled={isLoading}
                         onClick={handleResetPoints}
                         className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/50 font-mono text-xs uppercase hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                       >
                          RESET PUNTAJE DE INVESTIGACIÓN (7 IP)
                       </button>
                       <p className="mt-2 font-mono text-[9px] opacity-40">
                          Restaura los puntos de todos los estudiantes ALIVE a su valor predeterminado.
                       </p>
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* RIGHT PANEL: SIDE CONTROLS */}
        <div className="flex flex-col gap-6">
           <div className="sci-border p-4 bg-black/60 backdrop-blur min-h-[200px]">
              <h3 className="font-mono text-xs border-b border-(--glow)/30 pb-2 mb-4">| TERMINAL DE CONTROL_R_01</h3>
              <div className="text-[10px] font-mono text-(--glow)/70 space-y-2">
                 <p>SYS_ST: ONLINE</p>
                 <p>NET_LATENCY: 12ms</p>
                 <p>ROOM_COUNT: 5</p>
                 <p>ACTIVE_SUBJECTS: 0</p>
                 <div className="w-full h-1 bg-(--glow)/20 mt-4 overflow-hidden">
                    <div className="w-full h-full bg-red-500/50 animate-pulse shadow-[0_0_5px_red]" />
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
