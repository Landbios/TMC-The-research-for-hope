'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createTmaNpc } from '../api';
import ImageUploader from '@/components/ui/ImageUploader';
import { Loader2, UserPlus, Info } from 'lucide-react';

export function AdminNpcCreator() {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [biography, setBiography] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [spriteUrl, setSpriteUrl] = useState('');
  const [status, setStatus] = useState<'ALIVE' | 'DEAD' | 'MISSING' | 'GUILTY'>('ALIVE');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title || !biography || !imageUrl) {
      toast.error('INPUT_ERROR: Faltan datos críticos para el NPC.');
      return;
    }

    setLoading(true);
    try {
      await createTmaNpc({
        tma_name: name,
        tma_title: title,
        tma_biography: biography,
        image_url: imageUrl,
        sprite_idle_url: spriteUrl || imageUrl,
        status: status
      });

      toast.success('SYS_INIT: NPC REGISTRADO CON ÉXITO.');
      // Reset form
      setName('');
      setTitle('');
      setBiography('');
      setImageUrl('');
      setSpriteUrl('');
    } catch (err: unknown) {
      console.error(err);
      toast.error('SYS_ERROR: Fallo al registrar el NPC.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div className="flex items-center gap-3 border-b border-red-500/30 pb-2">
        <UserPlus className="text-red-500" size={20} />
        <h2 className="font-mono text-lg font-bold text-red-500 uppercase tracking-widest">
           REGISTRO DE SUJETO NO JUGADOR (NPC)
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        
        {/* Left Column: Images */}
        <div className="space-y-6">
           <ImageUploader 
             label="CÓDIGO VISUAL (AVATAR)"
             value={imageUrl}
             onChange={setImageUrl}
             aspectRatio={1}
           />
           <ImageUploader 
             label="PROTOCOLO DE CUERPO (SPRITE)"
             value={spriteUrl}
             onChange={setSpriteUrl}
             aspectRatio={0.7}
           />
           <div className="sci-border p-3 flex gap-2 items-start bg-red-500/5 text-red-500/70 border-red-500/20">
              <Info size={14} className="mt-0.5 shrink-0" />
              <p className="font-mono text-[9px] leading-tight uppercase">
                Los NPCs registrados aquí serán compartidos y podrán ser poseídos por cualquier miembro del Staff.
              </p>
           </div>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-mono text-[10px] text-red-500 uppercase tracking-tighter opacity-70">Identidad del Sujeto</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="NOMBRE"
                  className="w-full bg-black border border-red-500/30 p-2 font-mono text-sm text-(--glow) focus:outline-none focus:border-red-500 focus:bg-red-500/5"
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[10px] text-red-500 uppercase tracking-tighter opacity-70">Título Definitivo</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="E.G. DIRECTOR"
                  className="w-full bg-black border border-red-500/30 p-2 font-mono text-sm text-(--glow) focus:outline-none focus:border-red-500 focus:bg-red-500/5"
                />
              </div>
           </div>

           <div className="space-y-1">
              <label className="font-mono text-[10px] text-red-500 uppercase tracking-tighter opacity-70">Biografía / Perfil Psicológico</label>
              <textarea 
                value={biography}
                onChange={e => setBiography(e.target.value)}
                placeholder="INSERTAR DATOS BIOGRÁFICOS..."
                className="w-full h-32 bg-black border border-red-500/30 p-2 font-mono text-sm text-(--glow) focus:outline-none focus:border-red-500 focus:bg-red-500/5 resize-none"
              />
           </div>

           <div className="space-y-1">
              <label className="font-mono text-[10px] text-red-500 uppercase tracking-tighter opacity-70">Estado del Sistema</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value as 'ALIVE' | 'DEAD' | 'MISSING' | 'GUILTY')}
                className="w-full bg-black border border-red-500/30 p-2 font-mono text-sm text-(--glow) focus:outline-none focus:border-red-500"
              >
                <option value="ALIVE">VIVO (STABLE)</option>
                <option value="DEAD">MUERTO (TERMINATED)</option>
                <option value="MISSING">DESAPARECIDO (LOST)</option>
                <option value="GUILTY">CULPABLE (EXPOSED)</option>
              </select>
           </div>

           <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-mono text-sm font-bold uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={18} />}
                {loading ? 'SINCRONIZANDO...' : 'INICIALIZAR PROTOCOLO NPC'}
              </button>
           </div>
        </div>
      </form>
    </div>
  );
}
