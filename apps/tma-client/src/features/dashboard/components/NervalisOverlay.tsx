'use client';

import { useState, useEffect } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { X, FileText, Map, Users, Settings, Cpu, Terminal, User, MapPin, Activity } from 'lucide-react';
import { InvestigationLog } from '@/features/investigation/components/InvestigationLog';
import { AcademyMap } from '@/features/exploration/components/AcademyMap';
import { getAllTMACharacters, updateGameState } from '@/features/characters/api';
import type { TMACharacterData } from '@/features/characters/api';
import Image from 'next/image';
import { toast } from 'sonner';

export function NervalisOverlay() {
  const isOpen = useTmaStore(state => state.isNervalisOpen);
  const toggleNervalis = useTmaStore(state => state.toggleNervalis);
  const [activeTab, setActiveTab] = useState<'LOG' | 'MAP' | 'STUDENTS' | 'SYSTEM'>('LOG');
  const [students, setStudents] = useState<TMACharacterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<TMACharacterData | null>(null);

  useEffect(() => {
    let mounted = true;
    if (activeTab === 'STUDENTS' && isOpen) {
      // Usamos un pequeño delay para evitar el warning de setState sincrónico en render
      const timer = setTimeout(() => {
        if (!mounted) return;
        setLoading(true);
        getAllTMACharacters().then(data => {
          if (mounted) {
            // Aseguramos que el originalCharacter esté presente si estamos poseyendo a alguien
            const originalChar = useTmaStore.getState().originalCharacter;
            let finalData = [...data];
            if (originalChar && !data.find(c => c.id === originalChar.id)) {
              finalData = [originalChar, ...data];
            }
            setStudents(finalData);
            setLoading(false);
          }
        });
      }, 0);
      return () => {
         clearTimeout(timer);
         mounted = false;
      };
    }
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-300 bg-black flex flex-col animate-in fade-in duration-300">
      
      {/* Esquinas CRT / Glitch frame */}
      <div className="absolute inset-0 pointer-events-none crt-scanline opacity-20"></div>
      <div className="absolute inset-0 pointer-events-none border-20 border-black z-50"></div>

      {/* Top Header Terminal */}
      <div className="h-14 bg-zinc-900/80 border-b border-blue-500/30 flex items-center justify-between px-8 relative z-20">
        <div className="flex items-center gap-4">
          <Cpu className="text-blue-500 animate-pulse" size={20} />
          <h1 className="font-mono text-sm font-bold text-blue-400 tracking-[0.4em] uppercase">
            NERVALIS SYSTEM TERMINAL [ v4.2.0 ]
          </h1>
        </div>
        
        <button 
          onClick={() => toggleNervalis(false)}
          className="p-2 hover:bg-red-500/20 text-blue-500 hover:text-red-500 transition-all border border-transparent hover:border-red-500/50"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Sidebar Nav */}
        <div className="w-20 bg-zinc-950 border-r border-blue-500/20 flex flex-col items-center py-8 gap-8">
           <NavButton 
             active={activeTab === 'LOG'} 
             icon={<FileText size={24} />} 
             label="LOG" 
             onClick={() => setActiveTab('LOG')} 
           />
           <NavButton 
             active={activeTab === 'MAP'} 
             icon={<Map size={24} />} 
             label="MAP" 
             onClick={() => setActiveTab('MAP')} 
           />
           <NavButton 
             active={activeTab === 'STUDENTS'} 
             icon={<Users size={24} />} 
             label="PROFIL" 
             onClick={() => setActiveTab('STUDENTS')} 
           />
           <div className="mt-auto flex flex-col gap-6 mb-4">
              <NavButton 
                active={activeTab === 'SYSTEM'} 
                icon={<Settings size={20} />} 
                label="SYS" 
                onClick={() => setActiveTab('SYSTEM')} 
              />
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#020202] relative p-8 overflow-y-auto custom-scrollbar">
           {activeTab === 'LOG' && (
             <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
                <InvestigationLog />
             </div>
           )}
           
           {activeTab === 'MAP' && (
             <div className="w-full h-full border border-blue-500/20 relative animate-in zoom-in-95 duration-300">
                <AcademyMap />
                <div className="absolute top-4 left-4 z-10 bg-black/80 p-3 border border-blue-500/50 pointer-events-none">
                   <p className="font-mono text-[10px] text-blue-500 uppercase tracking-widest">MAPA TÁCTICO DE LA ACADEMIA</p>
                </div>
             </div>
           )}

           {activeTab === 'STUDENTS' && (
             <div className="animate-in fade-in duration-300 h-full flex flex-col">
                <div className="max-w-6xl mx-auto w-full space-y-6 flex-1 flex flex-col min-h-0">
                   <div className="flex items-center justify-between border-b border-blue-500/30 pb-4 shrink-0">
                      <div className="flex items-center gap-3">
                         <Users className="text-blue-500" />
                         <h2 className="font-mono text-xl text-blue-400 uppercase tracking-widest">Base de Datos de Sujetos</h2>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-500 uppercase">{students.length} SUJETOS REGISTRADOS</span>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                      {loading ? (
                        <div className="flex items-center justify-center h-40">
                           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
                           {students.map(student => {
                             const isOriginal = student.id === useTmaStore.getState().originalCharacter?.id;
                             return (
                               <button 
                                 key={student.id}
                                 onClick={() => setSelectedStudent(student)}
                                 className={`group relative sci-border p-3 text-left transition-all hover:bg-blue-500/10 ${
                                   selectedStudent?.id === student.id ? 'bg-blue-500/20 border-blue-500' : 'bg-black/40 border-blue-500/30'
                                 } ${isOriginal ? 'border-l-4 border-l-blue-400' : ''}`}
                               >
                                  {isOriginal && (
                                    <div className="absolute -top-2 -left-2 bg-blue-500 text-black text-[7px] font-bold px-1 py-0.5 z-10 font-mono shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                      REGISTRO_ORIGEN
                                    </div>
                                  )}
                                 <div className="flex gap-3 items-center">
                                    <div className="w-12 h-12 bg-zinc-900 border border-blue-500/20 shrink-0 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                                      {(student.image_url || student.tmc_character?.image_url) ? (
                                         <Image 
                                           src={student.image_url || student.tmc_character?.image_url || ''} 
                                           alt={student.tma_name || ''} 
                                           fill 
                                           className="object-cover"
                                           unoptimized
                                         />
                                      ) : (
                                         <div className="w-full h-full flex items-center justify-center"><User size={20} className="opacity-20" /></div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                       <h4 className="font-mono text-[10px] font-bold text-blue-400 uppercase truncate">
                                          {student.tmc_character?.name || student.tma_name}
                                       </h4>
                                       <p className="font-mono text-[8px] text-zinc-500 uppercase truncate">
                                          {student.tma_title}
                                       </p>
                                       <div className={`mt-1 font-mono text-[7px] px-1 inline-block uppercase ${student.status === 'ALIVE' ? 'text-green-500' : 'text-red-500'}`}>
                                          [{student.status}]
                                       </div>
                                    </div>
                                 </div>
                                 {student.is_hidden && (
                                   <div className="absolute top-1 right-1"><Activity size={10} className="text-amber-500 animate-pulse" /></div>
                                 )}
                              </button>
                           )})}
                        </div>
                      )}
                   </div>

                   {/* Student Detail Panel */}
                   {selectedStudent && (
                      <div className="shrink-0 animate-in slide-in-from-bottom-4 duration-300 sci-border bg-zinc-950 border-blue-500/40 p-6 flex gap-6 mt-4">
                         <div className="w-32 h-32 bg-zinc-900 border border-blue-500/40 relative overflow-hidden shrink-0">
                            {(selectedStudent.image_url || selectedStudent.tmc_character?.image_url) ? (
                               <Image 
                                 src={selectedStudent.image_url || selectedStudent.tmc_character?.image_url || ''} 
                                 alt={selectedStudent.tma_name || ''} 
                                 fill 
                                 className="object-cover"
                                 unoptimized
                               />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center"><User size={40} className="opacity-20" /></div>
                            )}
                            <div className="absolute inset-0 bg-blue-500/10 mix-blend-color" />
                         </div>
                         <div className="flex-1 flex flex-col justify-between">
                             <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                <div className="col-span-2">
                                   <h3 className="font-mono text-lg font-bold text-blue-400 uppercase">
                                      {selectedStudent.tmc_character?.name || selectedStudent.tma_name}
                                   </h3>
                                   <p className="font-mono text-xs text-blue-500/70 border-b border-blue-500/20 pb-2 uppercase">{selectedStudent.tma_title}</p>
                                </div>
                                <div className="space-y-1">
                                   <p className="font-mono text-[8px] text-zinc-500 uppercase">Estado Actual</p>
                                   <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${selectedStudent.status === 'ALIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                                      <span className="font-mono text-xs text-zinc-300 uppercase">{selectedStudent.status}</span>
                                   </div>
                                </div>
                                <div className="space-y-1">
                                   <p className="font-mono text-[8px] text-zinc-500 uppercase">Localización</p>
                                   <div className="flex items-center gap-2">
                                      <MapPin size={14} className="text-blue-500" />
                                      <span className="font-mono text-xs text-zinc-300 uppercase">{selectedStudent.current_room_id || 'Fuera de Rango'}</span>
                                   </div>
                                </div>
                                <div className="space-y-1">
                                   <p className="font-mono text-[8px] text-zinc-500 uppercase">Puntos de Investigación</p>
                                   <div className="flex items-center gap-2">
                                      <Activity size={14} className="text-red-500" />
                                      <span className="font-mono text-xs text-zinc-300 uppercase">{selectedStudent.investigation_points} IP</span>
                                   </div>
                                </div>
                                <div className="space-y-1">
                                   <p className="font-mono text-[8px] text-zinc-500 uppercase">ID de Registro</p>
                                   <span className="font-mono text-[10px] text-zinc-500 uppercase">{selectedStudent.id.substring(0, 13)}...</span>
                                </div>
                                <div className="col-span-2 mt-2">
                                   <p className="font-mono text-[8px] text-zinc-500 uppercase mb-1">Archivo Biográfico</p>
                                   <p className="font-mono text-[10px] text-zinc-400 line-clamp-2 italic">{selectedStudent.tma_biography || 'Sin datos adicionales registrados.'}</p>
                                </div>
                             </div>

                             <div className="mt-4 pt-4 border-t border-blue-500/20 flex gap-4">
                               <button 
                                 onClick={() => {
                                   useTmaStore.getState().setPossession(selectedStudent);
                                   toast.success(`POSESIÓN INICIADA: ${selectedStudent.tmc_character?.name || selectedStudent.tma_name}`);
                                   setSelectedStudent(null);
                                 }}
                                 className="flex-1 py-1.5 bg-blue-500/10 border border-blue-500/50 text-blue-400 font-mono text-[10px] uppercase hover:bg-blue-500 hover:text-black transition-all"
                               >
                                 Iniciar Posesión Neural
                               </button>
                               {useTmaStore.getState().myCharacterId === selectedStudent.id && (
                                 <button 
                                   onClick={() => {
                                     useTmaStore.getState().setPossession(null);
                                     toast.success('CONEXIÓN REESTABLECIDA CON PERSONAJE ORIGINAL');
                                     setSelectedStudent(null);
                                   }}
                                   className="flex-1 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-400 font-mono text-[10px] uppercase hover:bg-zinc-800 hover:text-white transition-all"
                                 >
                                   Finalizar Posesión
                                 </button>
                               )}
                             </div>
                          </div>
                         <button 
                           onClick={() => setSelectedStudent(null)}
                           className="absolute top-2 right-2 text-zinc-600 hover:text-white"
                         >
                           <X size={16} />
                         </button>
                      </div>
                   )}
                </div>
             </div>
           )}

           {activeTab === 'SYSTEM' && (
             <div className="max-w-3xl mx-auto animate-in slide-in-from-top-4 duration-300">
                <div className="sci-border p-8 space-y-6">
                   <div className="flex items-center gap-4">
                     <Terminal className="text-blue-500" />
                     <h2 className="font-mono text-lg text-blue-400 uppercase">Estado del Núcleo Nervalis</h2>
                   </div>
                   <div className="space-y-2 font-mono text-[10px] text-zinc-400">
                      <p className="flex justify-between border-b border-zinc-800 pb-1"><span>CPU_TEMP</span> <span className="text-green-500">34°C</span></p>
                      <p className="flex justify-between border-b border-zinc-800 pb-1"><span>UPTIME</span> <span className="text-blue-500">12D 04H 23M</span></p>
                      <p className="flex justify-between border-b border-zinc-800 pb-1"><span>NEURAL_FLOW</span> <span className="text-blue-400">ACTIVE: 100%</span></p>
                   </div>
                   <div className="pt-4 flex gap-4">
                      <button 
                        onClick={async () => {
                          try {
                            await updateGameState({ current_period: 'FREE_TIME' });
                            toast.success('SYS_UPDATE: PROTOCOLS RESTARTED.');
                          } catch {
                            toast.error('ACCESS DENIED.');
                          }
                        }}
                        className="flex-1 py-2 border border-blue-500/50 bg-blue-500/10 text-blue-500 font-mono text-[10px] uppercase hover:bg-blue-500 hover:text-black"
                      >
                        Reiniciar Protocolos
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            await updateGameState({ current_period: 'NIGHTTIME', body_discovery_active: true });
                            toast.success('EMERGENCY MODE ACTIVATED.');
                          } catch {
                            toast.error('ACCESS DENIED.');
                          }
                        }}
                        className="flex-1 py-2 border border-red-500/50 bg-red-500/10 text-red-500 font-mono text-[10px] uppercase hover:bg-red-500 hover:text-black"
                      >
                        Modo de Emergencia
                      </button>
                   </div>
                </div>
             </div>
           )}
        </div>

      </div>

      {/* Bottom Footer Stats */}
      <div className="h-8 bg-zinc-900 border-t border-blue-500/20 px-8 flex items-center justify-between font-mono text-[9px] text-blue-500/60 relative z-20">
         <span>SISTEMA DE MONITOREO TACTICO NERVALIS</span>
         <div className="flex gap-6">
            <span>MEM: 12.4GB</span>
            <span>NET: STABLE</span>
            <span>DATE: {new Date().toLocaleDateString()}</span>
         </div>
      </div>

    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all group ${active ? 'text-blue-400' : 'text-zinc-600 hover:text-blue-500'}`}
    >
      <div className={`p-2 border transition-all ${active ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-transparent group-hover:border-zinc-800'}`}>
        {icon}
      </div>
      <span className="font-mono text-[8px] font-bold tracking-tighter uppercase">{label}</span>
    </button>
  );
}
