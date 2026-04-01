'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { RoomCube } from '@/features/exploration/components/RoomCube';
import { getAllRooms, getRoomEvidences, createTmaEvidence } from '../api';
import { MapPin, Plus, Save, X } from 'lucide-react';

interface Evidence {
  id: string;
  room_id: string;
  title: string;
  description: string;
  pos_x: number;
  pos_y: number;
  pos_z: number;
}

interface Room {
  id: string;
  name: string;
}

export function AdminRoomEditor() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvidence, setNewEvidence] = useState({ title: '', description: '', pos_x: 0, pos_y: 0, pos_z: 0 });

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
      setNewEvidence({ title: '', description: '', pos_x: 0, pos_y: 0, pos_z: 0 });
      getRoomEvidences(selectedRoomId).then(setEvidences);
    } catch {
      alert('Error guardando evidencia');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Selector de Sala y Controles */}
      <div className="flex flex-wrap gap-4 items-center bg-red-500/5 p-4 sci-border border-red-500/20">
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] uppercase opacity-60">Seleccionar Zona</label>
          <select 
            value={selectedRoomId || ''} 
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="bg-black border border-red-500/30 text-red-500 font-mono text-xs p-2 outline-none w-48"
          >
            <option value="">-- SELECCIONAR --</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        {selectedRoomId && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`px-4 py-2 flex items-center gap-2 font-mono text-xs border transition-all ${isAdding ? 'bg-red-500 text-white border-red-500' : 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20'}`}
          >
            {isAdding ? <X size={14} /> : <Plus size={14} />}
            {isAdding ? 'CANCELAR PROTOCOLO' : 'AÑADIR EVIDENCIA'}
          </button>
        )}
      </div>

      {/* Area del Editor */}
      <div className="flex-1 min-h-[400px] relative sci-border bg-black/40">
        {!selectedRoomId ? (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs opacity-40 uppercase tracking-widest">
            Aguardando selección de zona neural...
          </div>
        ) : (
          <div className="w-full h-full">
            <Canvas shadows camera={{ position: [0, 5, 20], fov: 60 }} onPointerDown={handleCanvasClick}>
              <color attach="background" args={['#050000']} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} color="#ff3333" />
              
              <Suspense fallback={null}>
                <RoomCube />
                
                {/* Marcadores de Evidencia Existente */}
                {evidences.map(ev => (
                  <mesh key={ev.id} position={[ev.pos_x, ev.pos_y, ev.pos_z]}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
                    <Html distanceFactor={10}>
                      <div className="bg-red-600 text-white px-2 py-1 text-[8px] font-mono whitespace-nowrap shadow-[0_0_10px_red]">
                        {ev.title}
                      </div>
                    </Html>
                  </mesh>
                ))}

                {/* Marcador de Nueva Evidencia */}
                {isAdding && (
                  <mesh position={[newEvidence.pos_x, newEvidence.pos_y, newEvidence.pos_z]}>
                    <sphereGeometry args={[0.5, 16, 16]} />
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
                    <Html distanceFactor={10}>
                      <div className="bg-white text-black px-2 py-1 text-[8px] font-mono whitespace-nowrap shadow-[0_0_15px_white] animate-pulse">
                        POSICIÓN NUEVA
                      </div>
                    </Html>
                  </mesh>
                )}
              </Suspense>

              <OrbitControls makeDefault maxPolarAngle={Math.PI / 2} />
            </Canvas>
            
            {/* Formulario de Nueva Evidencia (Overlay) */}
            {isAdding && (
              <div className="absolute top-4 right-4 w-64 bg-black/90 p-4 border border-white/30 backdrop-blur shadow-xl animate-fade-in z-20">
                 <h4 className="font-mono text-xs border-b border-white/20 pb-2 mb-4 flex items-center gap-2">
                    <MapPin size={12} className="text-white" /> REGISTRAR PISTA
                 </h4>
                 <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Título de la prueba..."
                      className="w-full bg-transparent border-b border-white/40 font-mono text-xs p-1 outline-none text-white focus:border-white"
                      value={newEvidence.title}
                      onChange={e => setNewEvidence(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <textarea 
                      placeholder="Descripción detallada..."
                      className="w-full bg-transparent border border-white/20 font-mono text-[10px] p-2 h-24 outline-none text-white/80 focus:border-white/50"
                      value={newEvidence.description}
                      onChange={e => setNewEvidence(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-white/50">
                       <span>X: {newEvidence.pos_x.toFixed(2)}</span>
                       <span>Y: {newEvidence.pos_y.toFixed(2)}</span>
                       <span>Z: {newEvidence.pos_z.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={handleSaveNew}
                      className="w-full py-2 bg-white text-black font-mono text-xs uppercase font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={14} /> PERSISTIR EN DB
                    </button>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
