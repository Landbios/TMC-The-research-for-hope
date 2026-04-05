'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { RoomCube } from '@/features/exploration/components/RoomCube';
import { getAllRooms, getRoomEvidences, createTmaEvidence, deleteTmaEvidence } from '../api';
import { MapPin, Plus, Save, X, Edit2, Trash2, Camera, Database, Box } from 'lucide-react';
import ImageUploader from '@/features/shared/components/ImageUploader';
import { EvidenceSprite3D } from '@/features/exploration/components/EvidenceSprite3D';
import { AdminEvidenceModal } from './AdminEvidenceModal';
import { TMAEvidence } from '@/features/investigation/api';
import { toast } from 'sonner';

interface Room {
  id: string;
  name: string;
  is_invisible: boolean;
}

export function AdminRoomEditor() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [evidences, setEvidences] = useState<TMAEvidence[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<TMAEvidence | null>(null);
  const [newEvidence, setNewEvidence] = useState({ 
    title: '', 
    description_brief: '', 
    description_full: '', 
    image_url: '', 
    is_fake: false,
    pos_x: 0, 
    pos_y: 1.5, 
    pos_z: 0 
  });

  useEffect(() => {
    getAllRooms().then(setRooms);
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      getRoomEvidences(selectedRoomId).then(setEvidences);
    }
  }, [selectedRoomId]);

  const handleCanvasClick = (e: ThreeEvent<PointerEvent>) => {
    if (!isAdding) return;
    const { point } = e;
    setNewEvidence(prev => ({ ...prev, pos_x: point.x, pos_y: point.y, pos_z: point.z }));
  };

  const handleSaveNew = async () => {
    if (!selectedRoomId || !newEvidence.title) return;
    try {
      await createTmaEvidence({ ...newEvidence, room_id: selectedRoomId });
      setIsAdding(false);
      setNewEvidence({ 
        title: '', 
        description_brief: '', 
        description_full: '', 
        image_url: '', 
        is_fake: false,
        pos_x: 0, 
        pos_y: 1.5, 
        pos_z: 0 
      });
      getRoomEvidences(selectedRoomId).then(setEvidences);
      toast.success("EVIDENCIA REGISTRADA");
    } catch (err) {
      console.error("Error saving:", err);
      toast.error('Error guardando evidencia');
    }
  };

  const handleDeleteEvidence = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm('¿CONFIRMAR ELIMINACIÓN? Esta acción borrará la pista de la base de datos central.')) return;
    
    // Log para depuración
    console.log(`[TMA-ADMIN] INICIANDO BORRADO // ID: ${id}`);
    
    try {
      const success = await deleteTmaEvidence(id);
      if (success) {
         console.log(`[TMA-ADMIN] CONFIRMACIÓN DE BORRADO OK // ID: ${id}`);
         // Actualización optimista + re-fetch
         setEvidences(prev => prev.filter(e => e.id !== id));
         if (selectedRoomId) {
           getRoomEvidences(selectedRoomId).then(setEvidences);
         }
         toast.success("EVIDENCIA ELIMINADA DEL SISTEMA");
      }
    } catch (err) {
      console.error("[TMA-ERROR] ERROR EN EL BORRADO:", err);
      toast.error("ERROR DE PERMISOS O CONEXIÓN AL BORRAR");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 font-mono">
      {/* 🟢 HEADER DE CONTROL */}
      <div className="flex flex-wrap gap-4 items-center bg-zinc-950 p-4 border border-red-900/30 shadow-[0_0_30px_rgba(220,38,38,0.05)]">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase opacity-40 flex items-center gap-2">
             <Camera size={10} className="text-red-500" /> S.C.I.O.N. ROOM VIEWPORT
          </label>
          <select 
            value={selectedRoomId || ''} 
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="bg-black border border-red-500/30 text-red-500 text-xs p-2 outline-none w-56 focus:border-red-500 transition-all hover:bg-zinc-900"
          >
            <option value="">-- SELECCIONAR ZONA --</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} {r.is_invisible ? ' [HIDDEN]' : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedRoomId && (
          <div className="flex gap-2 ml-auto">
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className={`px-6 py-2 flex items-center gap-2 text-xs border transition-all ${isAdding ? 'bg-red-600 text-white border-red-500' : 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20'}`}
            >
              {isAdding ? <X size={14} /> : <Plus size={14} />}
              {isAdding ? 'CANCELAR PROTOCOLO' : 'AÑADIR PISTA'}
            </button>
          </div>
        )}
      </div>

      {/* 🔴 VISOR 3D (MAIN VIEW) */}
      <div className="relative border border-white/5 bg-zinc-950/80 overflow-hidden h-[450px]">
        {!selectedRoomId ? (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] opacity-20 uppercase tracking-[0.3em] italic">
            Esperando Sincronización Maestra...
          </div>
        ) : (
          <div className="w-full h-full relative">
            <Canvas shadows camera={{ position: [0, 5, 20], fov: 60 }}>
              <color attach="background" args={['#020000']} />
              <ambientLight intensity={0.4} />
              <pointLight position={[10, 10, 10]} intensity={1} color="#ff3333" />
              <spotLight position={[-10, 20, 10]} angle={0.2} penumbra={1} intensity={2} color="#ffffff" castShadow />
              
              <Suspense fallback={null}>
                <group onPointerDown={handleCanvasClick}>
                  <RoomCube />
                  
                  {evidences.map(ev => (
                    <EvidenceSprite3D 
                      key={ev.id} 
                      evidence={ev} 
                      isEditMode={true}
                      onClick={(e) => setEditingEvidence(e)}
                      onUpdate={() => {
                        if (selectedRoomId) {
                          getRoomEvidences(selectedRoomId).then(setEvidences);
                        }
                      }}
                    />
                  ))}

                  {isAdding && (
                    <mesh position={[newEvidence.pos_x, newEvidence.pos_y, newEvidence.pos_z]}>
                      <sphereGeometry args={[0.4, 32, 32]} />
                      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
                      <Html distanceFactor={12}>
                        <div className="bg-white text-black px-2 py-0.5 text-[7px] font-bold whitespace-nowrap shadow-[0_0_20px_white]">
                           NUEVO_PUNTO_DE_INTERÉS
                        </div>
                      </Html>
                    </mesh>
                  )}
                </group>
              </Suspense>

              <OrbitControls makeDefault maxPolarAngle={Math.PI / 1.5} />
            </Canvas>

            {/* FORMULARIO FLOTANTE (Internal) */}
            {isAdding && (
               <div className="absolute top-4 right-4 w-72 bg-black/95 p-4 border border-white/10 backdrop-blur-xl shadow-2xl animate-fade-in z-20 max-h-[90%] overflow-y-auto custom-scrollbar">
                  <h4 className="text-[10px] border-b border-red-500/20 pb-2 mb-4 flex items-center gap-2 text-red-500 font-bold tracking-widest">
                     <Database size={12} /> REGISTRO DE EVIDENCIA
                  </h4>
                  <div className="space-y-4">
                     <input 
                       type="text" 
                       placeholder="Nombre de la pista..."
                       className="w-full bg-zinc-900 border border-zinc-800 text-xs p-2 outline-none text-white focus:border-red-500/50 transition-colors"
                       value={newEvidence.title}
                       onChange={e => setNewEvidence(prev => ({ ...prev, title: e.target.value }))}
                     />
                     
                     <ImageUploader 
                       label="Asset Multimedia"
                       value={newEvidence.image_url}
                       onChange={url => setNewEvidence(prev => ({ ...prev, image_url: url }))}
                       bucketName="evidence-images"
                     />

                     <textarea 
                       placeholder="Resumen pre-descubrimiento..."
                       className="w-full bg-zinc-900 border border-zinc-800 p-2 h-16 outline-none text-white/60 focus:border-red-500/50 text-[10px]"
                       value={newEvidence.description_brief}
                       onChange={e => setNewEvidence(prev => ({ ...prev, description_brief: e.target.value }))}
                     />

                     <button 
                       onClick={handleSaveNew}
                       className="w-full py-3 bg-red-600 text-white text-[10px] uppercase font-bold hover:bg-red-500 transition-all flex items-center justify-center gap-2"
                     >
                       <Save size={14} /> PERSISTIR EN BASE DE DATOS
                     </button>
                  </div>
               </div>
            )}
          </div>
        )}
      </div>

      {/* 🔵 LISTADO DE EVIDENCIAS (BOTTOM BOX) */}
      <div className="border border-white/5 bg-zinc-950 flex flex-col min-h-[250px]">
         <div className="p-3 px-6 bg-red-500/[0.03] border-b border-red-900/20 flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-2 tracking-widest">
               <Box size={10} /> Inventario de Anomalías en Sala
            </h3>
            <span className="text-[9px] text-white/30">{evidences.length} PKTS TOTAL</span>
         </div>
         
         <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 overflow-y-auto custom-scrollbar max-h-[350px]">
            {evidences.length === 0 ? (
               <div className="col-span-full h-32 flex items-center justify-center flex-col opacity-10 gap-3">
                  <Database size={24} />
                  <p className="text-[9px] uppercase tracking-widest">Sin registros neurales</p>
               </div>
            ) : (
               evidences.map(ev => (
                  <div 
                     key={ev.id} 
                     className="bg-black/40 border border-white/5 p-3 hover:border-red-500/40 transition-all group flex flex-col gap-3"
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-900 border border-white/10 relative">
                           {ev.image_url ? (
                              <img src={ev.image_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-10">
                                 <Plus size={14} />
                              </div>
                           )}
                           {ev.is_fake && (
                              <div className="absolute -top-1 -right-1 bg-red-600 text-[6px] px-1 font-bold text-white shadow-lg">FAKE</div>
                           )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           <h4 className="text-[9px] text-white font-bold uppercase truncate group-hover:text-red-500 transition-colors">
                              {ev.title}
                           </h4>
                           <p className="text-[8px] text-white/30 uppercase mt-0.5">ID: {ev.id.slice(0, 8)}...</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-1 pt-2 border-t border-white/5">
                        <button 
                           onClick={() => setEditingEvidence(ev)}
                           className="py-1 flex items-center justify-center gap-1.5 bg-blue-500/10 text-blue-400 text-[8px] uppercase hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20"
                        >
                           <Edit2 size={10} /> Editar
                        </button>
                        <button 
                           onClick={() => handleDeleteEvidence(ev.id)}
                           className="py-1 flex items-center justify-center gap-1.5 bg-red-500/10 text-red-500 text-[8px] uppercase hover:bg-red-600 hover:text-white transition-all border border-red-500/20"
                        >
                           <Trash2 size={10} /> Borrar
                        </button>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>

      {/* 🔮 MODAL DE EDICIÓN */}
      {editingEvidence && (
         <AdminEvidenceModal 
            evidence={editingEvidence}
            onClose={() => setEditingEvidence(null)}
            onUpdate={() => {
               if (selectedRoomId) {
                  getRoomEvidences(selectedRoomId).then(setEvidences);
               }
            }}
         />
      )}
    </div>
  );
}
