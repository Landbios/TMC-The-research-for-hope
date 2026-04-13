'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTmaStore } from '@/store/useTmaStore';
import { 
  X, FileText, Users, Settings, Cpu, 
  Terminal, Activity, Globe, Monitor,
  MessageSquare, User, Shield, ShieldAlert
} from 'lucide-react';
import { VerticalChatLog } from './VerticalChatLog';
import { EvidenceTab } from '@/features/investigation/components/EvidenceTab';
import { AcademyMap } from '@/features/exploration/components/AcademyMap';
import { getAllTMACharacters, updateGameState } from '@/features/characters/api';
import type { TMACharacterData } from '@/features/characters/api';
import Image from 'next/image';
import { toast } from 'sonner';

type Tab = 'EVIDENCE' | 'MAP' | 'PROFILES' | 'ADMIN' | 'CHAT' | 'SELF';

export function NervalisOverlay() {
  const isOpen = useTmaStore(state => state.isNervalisOpen);
  const toggleNervalis = useTmaStore(state => state.toggleNervalis);
  const terminalPosition = useTmaStore(state => state.terminalPosition);
  const setTerminalPosition = useTmaStore(state => state.setTerminalPosition);
  const [activeTab, setActiveTab] = useState<Tab>('EVIDENCE');
  const userRole = useTmaStore(state => state.userRole);
  const isStaff = userRole === 'staff' || userRole === 'superadmin';
  const [students, setStudents] = useState<TMACharacterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<TMACharacterData | null>(null);
  
  const constraintsRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    if ((activeTab === 'PROFILES' || activeTab === 'ADMIN') && isOpen) {
      const timer = setTimeout(() => {
        if (!mounted) return;
        setLoading(true);
        getAllTMACharacters().then(data => {
          if (mounted) {
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
    <div className="fixed inset-0 z-300 pointer-events-none overflow-hidden" ref={constraintsRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.01, scaleX: 1.2 }}
            animate={{ opacity: 1, scaleY: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleY: 0.01, scaleX: 1.2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            drag
            dragConstraints={constraintsRef}
            dragMomentum={false}
            dragElastic={0}
            style={{ x: terminalPosition.x, y: terminalPosition.y }}
            onDragEnd={(_, info) => {
               setTerminalPosition({ 
                 x: terminalPosition.x + info.offset.x, 
                 y: terminalPosition.y + info.offset.y 
               });
            }}
            className="absolute top-10 md:top-20 right-4 md:right-10 w-[95vw] md:w-[800px] h-[80vh] md:h-[600px] bg-black/80 backdrop-blur-2xl border border-blue-500/40 flex flex-col shadow-[0_0_60px_rgba(59,130,246,0.25)] pointer-events-auto overflow-hidden group/modal"
          >
            {/* Scanlines Overlay - Enhanced Opacity */}
            <div className="absolute inset-0 pointer-events-none crt-scanline opacity-10"></div>
            <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-blue-500/5 to-transparent opacity-20" />

            
            {/* Window Header (Drag Handle) */}
            <div className="h-10 bg-blue-500/10 border-b border-blue-500/30 flex items-center justify-between px-4 shrink-0 cursor-grab active:cursor-grabbing nervalis-drag-handle">
               <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                     <div className="w-2 h-2 rounded-full bg-red-500/50" />
                     <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                     <div className="w-2 h-2 rounded-full bg-blue-500/50" />
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                     <Cpu size={14} className="text-blue-500 animate-pulse" />
                     <span className="font-mono text-[9px] font-bold text-blue-400 tracking-[0.2em] uppercase">
                       NERVALIS_TERMINAL_V4.2.0 [ONLINE]
                     </span>
                  </div>
               </div>
               <button 
                 onClick={() => toggleNervalis(false)}
                 className="hover:text-red-500 text-blue-500/50 transition-colors"
                >
                 <X size={18} />
               </button>
            </div>

            {/* Main Content Layout */}
            <div className="flex-1 flex overflow-hidden">
               <div className="w-16 bg-black/40 border-r border-blue-500/10 flex flex-col items-center py-6 gap-6 shrink-0 custom-scrollbar overflow-y-auto">
                  <NavButton 
                    active={activeTab === 'SELF'} 
                    icon={<User size={20} />} 
                    label="SELF" 
                    onClick={() => setActiveTab('SELF')} 
                  />
                  <NavButton 
                    active={activeTab === 'CHAT'} 
                    icon={<MessageSquare size={20} />} 
                    label="CHAT" 
                    onClick={() => setActiveTab('CHAT')} 
                  />
                  <NavButton 
                    active={activeTab === 'EVIDENCE'} 
                    icon={
                      <div className="relative">
                        <FileText size={20} />
                        {useTmaStore.getState().pendingPolls.length > 0 && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        )}
                      </div>
                    } 
                    label="EVD" 
                    onClick={() => setActiveTab('EVIDENCE')} 
                  />
                  <NavButton 
                    active={activeTab === 'MAP'} 
                    icon={<Globe size={20} />} 
                    label="MAP" 
                    onClick={() => setActiveTab('MAP')} 
                  />
                  <NavButton 
                    active={activeTab === 'PROFILES'} 
                    icon={<Users size={20} />} 
                    label="PROFILES" 
                    onClick={() => setActiveTab('PROFILES')} 
                  />
                  {isStaff && (
                    <div className="mt-auto mb-2">
                      <NavButton 
                        active={activeTab === 'ADMIN'} 
                        icon={<Settings size={18} />} 
                        label="ADM" 
                        onClick={() => setActiveTab('ADMIN')} 
                      />
                    </div>
                  )}
               </div>

               {/* Dynamic Content Panel */}
               <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      {activeTab === 'EVIDENCE' && <EvidenceTab />}
                      {activeTab === 'CHAT' && <VerticalChatLog />}
                      {activeTab === 'MAP' && (
                        <div className="w-full h-full border border-blue-500/20 relative shadow-inner overflow-hidden">
                            <AcademyMap />
                            <div className="absolute top-2 left-2 z-10 bg-black/80 px-2 py-1 border border-blue-500/50 pointer-events-none">
                              <p className="font-mono text-[8px] text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                <Monitor size={10} /> POSICIONAMIENTO_GLOBAL
                              </p>
                            </div>
                        </div>
                      )}

                      {activeTab === 'SELF' && (
                        <div className="h-full flex flex-col items-center justify-center p-6 sci-border bg-blue-900/5 border-blue-500/20">
                           {useTmaStore.getState().originalCharacter ? (
                              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 max-w-2xl w-full">
                                 <div className="w-40 h-40 bg-zinc-900 border-2 border-blue-500 relative overflow-hidden shrink-0 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                    {(useTmaStore.getState().originalCharacter?.image_url || useTmaStore.getState().originalCharacter?.tmc_character?.image_url) ? (
                                       <Image 
                                         src={useTmaStore.getState().originalCharacter?.image_url || useTmaStore.getState().originalCharacter?.tmc_character?.image_url || ''} 
                                         alt="Self_Portrait" fill className="object-cover cursor-crosshair hover:scale-105 transition-transform" unoptimized 
                                       />
                                    ) : <User size={80} className="m-auto opacity-20 text-blue-500 h-full w-full p-8" />}
                                    <div className="absolute inset-0 border-4 border-black/50 pointer-events-none" />
                                    <div className="absolute inset-0 crt-scanline pointer-events-none opacity-30" />
                                 </div>
                                 
                                 <div className="flex-1 text-center md:text-left space-y-4">
                                    <div>
                                       <h2 className="font-mono text-2xl font-bold text-blue-400 tracking-wider uppercase drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                          {useTmaStore.getState().originalCharacter?.tmc_character?.name || useTmaStore.getState().originalCharacter?.tma_name}
                                       </h2>
                                       <p className="font-mono text-xs text-blue-500/80 uppercase tracking-widest">
                                          {useTmaStore.getState().originalCharacter?.tma_title} • IDENTIFICADOR: {useTmaStore.getState().originalCharacter?.id.substring(0,6)}
                                       </p>
                                    </div>

                                    <div className="h-px w-full bg-linear-to-r from-blue-500/50 via-transparent to-transparent" />

                                    <div className="font-mono text-xs text-zinc-300 italic text-justify leading-relaxed max-h-32 overflow-y-auto custom-scrollbar pr-2 border-l-2 border-blue-500/30 pl-3">
                                       {useTmaStore.getState().originalCharacter?.tma_biography || "Ningún expediente biográfico ha sido enlazado a esta unidad neural."}
                                    </div>

                                    <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                                       <div className="px-4 py-2 border border-blue-500/40 bg-blue-500/10 rounded-sm">
                                          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Vitalidad</p>
                                          <p className={`font-mono text-sm uppercase font-bold tracking-widest ${useTmaStore.getState().originalCharacter?.status === 'ALIVE' ? 'text-green-500' : 'text-red-500'}`}>
                                             {useTmaStore.getState().originalCharacter?.status}
                                          </p>
                                       </div>
                                       <div className="px-4 py-2 border border-blue-500/40 bg-blue-500/10 rounded-sm">
                                          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Capacidad Intelectual</p>
                                          <p className="font-mono text-sm font-bold text-zinc-200 tracking-widest">
                                             {useTmaStore.getState().originalCharacter?.investigation_points} I.P.
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ) : (
                              <div className="text-zinc-500 font-mono text-sm tracking-widest uppercase animate-pulse">Sujeto No Encontrado en Local Store</div>
                           )}
                        </div>
                      )}

                      {activeTab === 'PROFILES' && (
                        <div className="space-y-4 h-full flex flex-col">
                           <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
                              <h2 className="font-mono text-xs text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                <Users size={14} /> ARCHIVO_DE_PERFILES
                              </h2>
                              <span className="font-mono text-[8px] text-zinc-500">[{students.length}_SUJETOS]</span>
                           </div>

                           <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                              {loading ? (
                                <div className="flex items-center justify-center h-20"><Loader /></div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                   {students.map(student => (
                                     <StudentCard 
                                       key={student.id} 
                                       student={student} 
                                       isSelected={selectedStudent?.id === student.id}
                                       onClick={() => setSelectedStudent(student)}
                                     />
                                   ))}
                                </div>
                              )}
                           </div>

                           {/* Selected Student Details (Collapsible or Overlay) */}
                           <AnimatePresence>
                              {selectedStudent && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="sci-border bg-blue-500/5 border-blue-500/30 p-4 shrink-0 overflow-hidden relative"
                                >
                                   <button 
                                     onClick={() => setSelectedStudent(null)}
                                     className="absolute top-2 right-2 text-zinc-500 hover:text-white"
                                   ><X size={14}/></button>
                                   <div className="flex gap-4">
                                      <div className="w-20 h-20 bg-zinc-900 border border-blue-500/40 relative overflow-hidden shrink-0">
                                         {(selectedStudent.image_url || selectedStudent.tmc_character?.image_url) ? (
                                            <Image 
                                              src={selectedStudent.image_url || selectedStudent.tmc_character?.image_url || ''} 
                                              alt="Portrait" fill className="object-cover" unoptimized 
                                            />
                                         ) : <User size={40} className="m-auto opacity-20" />}
                                      </div>
                                      <div className="flex-1 min-w-0 font-mono">
                                         <h3 className="text-blue-400 text-sm font-bold uppercase truncate">
                                           {selectedStudent.tmc_character?.name || selectedStudent.tma_name}
                                         </h3>
                                         <p className="text-[9px] text-blue-500/70 mb-2 uppercase">{selectedStudent.tma_title}</p>
                                         <div className="grid grid-cols-2 gap-2 text-[8px] uppercase">
                                            <div className="text-zinc-500">Estado: <span className={selectedStudent.status === 'ALIVE' ? 'text-green-500' : 'text-red-500'}>{selectedStudent.status}</span></div>
                                            <div className="text-zinc-500">Energía: <span className="text-zinc-300">{selectedStudent.investigation_points} IP</span></div>
                                         </div>
                                         <div className="mt-3 text-[9px] text-blue-300/80 italic border-l-2 border-blue-500/30 pl-2">
                                            {selectedStudent.tma_biography || "No existen registros formales del sujeto en los archivos de la academia."}
                                         </div>
                                       </div>
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                      )}

                      {activeTab === 'ADMIN' && (
                        <div className="space-y-6 h-full flex flex-col">
                           <div className="sci-border p-6 bg-blue-900/5 border-blue-500/20 space-y-4 shrink-0">
                              <h3 className="font-mono text-xs text-blue-400 uppercase flex items-center gap-2">
                                <Terminal size={14} /> DIAGNÓSTICO_SISTEMA
                              </h3>
                              <div className="space-y-1 font-mono text-[9px] text-zinc-500 uppercase">
                                 <p className="flex justify-between"><span>Core_Status</span> <span className="text-green-500 font-bold">READY</span></p>
                                 <p className="flex justify-between"><span>Neural_Sync</span> <span className="text-blue-400">98.4%</span></p>
                                 <p className="flex justify-between border-b border-blue-500/10 pb-1"><span>Environment</span> <span className="text-zinc-300">STABLE</span></p>
                              </div>
                              <div className="grid grid-cols-2 gap-3 pt-2">
                                 <button 
                                   onClick={async () => {
                                     try { await updateGameState({ current_period: 'FREE_TIME' }); toast.success('SYS_RESET'); } catch { toast.error('ERROR'); }
                                   }}
                                   className="py-1 border border-blue-500/40 text-blue-400 text-[9px] uppercase hover:bg-blue-500/10"
                                 >
                                   Reset Protocols
                                 </button>
                                 <button 
                                   onClick={async () => {
                                      try { await updateGameState({ current_period: 'NIGHTTIME', body_discovery_active: true }); toast.success('ALERTA_EMITIDA'); } catch { toast.error('ERROR'); }
                                   }}
                                   className="py-1 border border-red-500/40 text-red-500 text-[9px] uppercase hover:bg-red-500/10"
                                 >
                                   Bodymode_Pulse
                                 </button>
                              </div>
                           </div>

                           <div className="flex items-center justify-between border-b border-blue-500/20 pb-2 shrink-0">
                              <h2 className="font-mono text-xs text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                <Users size={14} /> OVERRIDE_POSESIÓN
                              </h2>
                           </div>

                           <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                              {loading ? (
                                <div className="flex items-center justify-center h-20"><Loader /></div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                   {students.map(student => (
                                     <StudentCard 
                                       key={student.id} 
                                       student={student} 
                                       isSelected={selectedStudent?.id === student.id}
                                       onClick={() => setSelectedStudent(student)}
                                     />
                                   ))}
                                </div>
                              )}
                           </div>

                           <AnimatePresence>
                              {selectedStudent && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="sci-border bg-red-900/10 border-red-500/40 p-4 shrink-0 overflow-hidden relative"
                                >
                                   <button 
                                     onClick={() => setSelectedStudent(null)}
                                     className="absolute top-2 right-2 text-zinc-500 hover:text-white"
                                   ><X size={14}/></button>
                                   <div className="flex gap-4">
                                      <div className="w-20 h-20 bg-zinc-900 border border-red-500/40 relative overflow-hidden shrink-0">
                                         {(selectedStudent.image_url || selectedStudent.tmc_character?.image_url) ? (
                                            <Image 
                                              src={selectedStudent.image_url || selectedStudent.tmc_character?.image_url || ''} 
                                              alt="Portrait" fill className="object-cover" unoptimized 
                                            />
                                         ) : <User size={40} className="m-auto opacity-20" />}
                                      </div>
                                      <div className="flex-1 min-w-0 font-mono">
                                         <h3 className="text-red-500 text-sm font-bold uppercase truncate">
                                           {selectedStudent.tmc_character?.name || selectedStudent.tma_name}
                                         </h3>
                                         <p className="text-[9px] text-red-500/70 mb-2 uppercase">{selectedStudent.tma_title}</p>
                                         <div className="grid grid-cols-2 gap-2 text-[8px] uppercase">
                                            <div className="text-zinc-500">Estado: <span className={selectedStudent.status === 'ALIVE' ? 'text-green-500' : 'text-red-500'}>{selectedStudent.status}</span></div>
                                         </div>
                                         {(selectedStudent.is_npc || selectedStudent.user_id === useTmaStore.getState().originalCharacter?.user_id) && (
                                            <button 
                                               onClick={() => {
                                                 useTmaStore.getState().setPossession(selectedStudent);
                                                 toast.success(`POSESIÓN NEURAL: ${selectedStudent.tma_name}`);
                                               }}
                                               className="mt-3 w-full py-1 bg-red-500/20 border border-red-500 text-red-500 text-[9px] uppercase hover:bg-red-500 hover:text-black transition-colors"
                                            >
                                               Inyectar Posesión
                                            </button>
                                         )}
                                      </div>
                                   </div>
                                </motion.div>
                              )}
                           </AnimatePresence>
                        </div>

                      )}
                    </motion.div>
                  </AnimatePresence>
               </div>
            </div>

            {/* Window Footer (Status Bar) */}
            <div className="h-6 bg-black/80 border-t border-blue-500/20 flex items-center justify-between px-4 font-mono text-[8px] text-blue-500/40 shrink-0">
               <div className="flex gap-4">
                  <span className="flex items-center gap-1"><Terminal size={10} /> SYS_OK</span>
                  <span className="flex items-center gap-1"><Activity size={10} /> NEURAL_LOAD: LOW</span>
               </div>
               <span>{new Date().toLocaleTimeString()}_Z_ACADEMY</span>
            </div>

            {/* Decorative Corner Grids */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-blue-500/40 pointer-events-none opacity-50" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-blue-500/40 pointer-events-none opacity-50" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all group ${active ? 'text-blue-400 scale-105' : 'text-zinc-600 hover:text-blue-500'}`}
    >
      <div className={`p-2 transition-all rounded-sm flex items-center justify-center border ${active ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'border-transparent group-hover:border-zinc-800'}`}>
        {icon}
      </div>
      <span className="font-mono text-[7.5px] font-bold tracking-tighter uppercase">{label}</span>
    </button>
  );
}

function StudentCard({ student, isSelected, onClick }: { student: TMACharacterData, isSelected: boolean, onClick: () => void }) {
  const isOriginal = student.id === useTmaStore.getState().originalCharacter?.id;
  
  return (
    <button 
      onClick={onClick}
      className={`relative p-2 flex gap-3 border transition-all text-left overflow-hidden ${
        isSelected 
        ? 'bg-blue-500/20 border-blue-500 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]' 
        : 'bg-black/20 border-blue-900/40 hover:border-blue-500/40'
      }`}
    >
      <div className="w-10 h-10 bg-zinc-900 border border-blue-500/20 shrink-0 relative overflow-hidden grayscale group-hover:grayscale-0">
         {(student.image_url || student.tmc_character?.image_url) ? (
            <Image src={student.image_url || student.tmc_character?.image_url || ''} alt="T" fill className="object-cover" unoptimized />
         ) : <User size={16} className="m-auto opacity-10" />}
      </div>
      <div className="min-w-0 font-mono">
         <h4 className="text-[9px] font-bold text-blue-400 uppercase truncate leading-none mb-1">
            {student.tmc_character?.name || student.tma_name}
         </h4>
         <p className="text-[7px] text-zinc-500 uppercase truncate mb-1">
            {student.tma_title || 'SUJETO_NO_IDENTIFICADO'}
         </p>
         <div className={`text-[6px] px-1 inline-block uppercase font-bold ${student.status === 'ALIVE' ? 'text-green-500' : 'text-red-500'}`}>
            {student.status}
         </div>
      </div>
      {isOriginal && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-500" title="TU REGISTRO" />}
    </button>
  );
}

function Loader() {
  return (
    <div className="flex gap-1 items-center">
       {[1,2,3].map(i => <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-1 h-3 bg-blue-500" />)}
    </div>
  );
}
