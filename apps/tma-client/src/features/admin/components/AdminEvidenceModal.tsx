'use client';

import React, { useState } from 'react';
import { X, Save, Trash2, Image as ImageIcon, Info, HelpCircle, DollarSign, EyeOff, Eye } from 'lucide-react';
import { TMAEvidence } from '@/features/investigation/api';
import { updateTmaEvidenceDetail, deleteTmaEvidence } from '@/features/admin/api';
import { toast } from 'sonner';

interface AdminEvidenceModalProps {
  evidence: TMAEvidence;
  onClose: () => void;
  onUpdate: () => void;
}

export function AdminEvidenceModal({ evidence, onClose, onUpdate }: AdminEvidenceModalProps) {
  const [formData, setFormData] = useState({
    title: evidence.title,
    description_brief: evidence.description_brief || '',
    description_full: evidence.description_full || '',
    image_url: evidence.image_url || '',
    investigation_cost: evidence.investigation_cost || 1,
    is_fake: evidence.is_fake || false,
    is_hidden: evidence.is_hidden || false
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTmaEvidenceDetail(evidence.id, formData);
      toast.success("EVIDENCIA ACTUALIZADA");
      onUpdate();
      onClose();
    } catch {
      toast.error("ERROR AL GUARDAR");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿SEGURO QUE DESEAS ELIMINAR ESTA PISTA?")) return;
    try {
      await deleteTmaEvidence(evidence.id);
      toast.success("EVIDENCIA ELIMINADA");
      onUpdate();
      onClose();
    } catch {
      toast.error("ERROR AL ELIMINAR");
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-red-600/10 border-b border-red-500/30 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3 text-red-500">
             <Save size={18} />
             <h3 className="font-mono text-xs font-bold tracking-widest uppercase">Editor de Pista Administrativo</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar font-mono">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-2">
               <Info size={12} className="text-red-500" /> Título de la Pista
            </label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 p-2 font-mono text-[11px] text-white focus:border-red-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-2">
                <DollarSign size={12} className="text-red-500" /> Coste (IP)
              </label>
              <input 
                type="number" 
                value={formData.investigation_cost}
                onChange={(e) => setFormData({...formData, investigation_cost: parseInt(e.target.value)})}
                className="w-full bg-zinc-900 border border-zinc-800 p-2 font-mono text-[11px] text-white focus:border-red-500 outline-none"
              />
            </div>
            <div className="flex items-end pb-1 gap-4">
               <button 
                 onClick={() => setFormData({...formData, is_fake: !formData.is_fake})}
                 className={`flex-1 h-9 border font-mono text-[9px] uppercase transition-all ${formData.is_fake ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
               >
                 {formData.is_fake ? '!! PIEZA FALSA !!' : 'Pista Real'}
               </button>
               <button 
                 onClick={() => setFormData({...formData, is_hidden: !formData.is_hidden})}
                 className={`p-2 border transition-all ${formData.is_hidden ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-zinc-800 text-zinc-500'}`}
                 title={formData.is_hidden ? 'Oculto para alumnos' : 'Visible para alumnos'}
               >
                 {formData.is_hidden ? <EyeOff size={16} /> : <Eye size={16} />}
               </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-2">
               <HelpCircle size={12} className="text-red-500" /> Descripción Breve
            </label>
            <input 
              type="text" 
              value={formData.description_brief}
              onChange={(e) => setFormData({...formData, description_brief: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 p-2 font-mono text-[11px] text-zinc-400 focus:border-red-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-2">
               <Info size={12} className="text-red-500" /> Informe Detallado (Hallazgo)
            </label>
            <textarea 
              value={formData.description_full}
              onChange={(e) => setFormData({...formData, description_full: e.target.value})}
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-800 p-2 font-mono text-[10px] text-zinc-300 focus:border-red-500 outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-2">
               <ImageIcon size={12} className="text-red-500" /> Imagen del Hallazgo (URL)
            </label>
            <input 
              type="text" 
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 p-2 font-mono text-[11px] text-white focus:border-red-500 outline-none"
              placeholder="https://..."
            />
            {formData.image_url && (
              <div className="relative w-full aspect-video bg-black border border-zinc-900 mt-2 overflow-hidden">
                <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-red-500/20 bg-black flex gap-3">
          <button 
            onClick={handleDelete}
            className="p-3 border border-red-900/50 text-red-900 hover:bg-red-950 hover:text-red-600 transition-all font-mono text-xs uppercase"
          >
            <Trash2 size={16} />
          </button>
          <button 
            disabled={isSaving}
            onClick={handleSave}
            className="flex-1 py-3 bg-red-600 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50"
          >
            {isSaving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
          </button>
        </div>

      </div>
    </div>
  );
}
