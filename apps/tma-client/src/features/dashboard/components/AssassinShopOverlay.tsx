'use client';

import { useState, useEffect } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { X, Skull, MapPin, Eye, Zap, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { AssassinConsultant } from '@/features/ai/components/AssassinConsultant';
import { ensureMurderRoom } from '@/features/admin/api';

export function AssassinShopOverlay({ onClose }: { onClose: () => void }) {
  const murderPoints = useTmaStore(state => state.murderPoints);
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const [coordinationRoomId, setCoordinationRoomId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    ensureMurderRoom().then(id => setCoordinationRoomId(id as string));
  }, []);

  const handleAction = async (action: string, cost: number) => {
    if (murderPoints < cost) {
      toast.error('PUNTOS DE ASESINATO INSUFICIENTES');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // 1. Descontar puntos
      const { error: updateError } = await supabase
        .from('tma_characters')
        .update({ murder_points: murderPoints - cost })
        .eq('id', myCharacterId);

      if (updateError) throw updateError;

      // 2. Ejecutar acción específica
      switch(action) {
        case 'REVEAL_TRUTH':
          toast.success('ARCHIVO DECODIFICADO: Ahora puedes ver la verdad de las pistas en esta sala.');
          break;
        case 'PLANT_FAKE':
          toast.success('DISTORSIÓN INICIADA: Se ha generado un residuo de evidencia falsa.');
          break;
        case 'SYSTEM_GLITCH':
          // Actualizamos el estado global para un glitch visual breve (conceptual)
          toast.error('SISTEMA COMPROMETIDO: Glitch global inducido.');
          break;
      }

      onClose();
    } catch (err) {
      console.error('Error in assassin action:', err);
      toast.error('FALLO EN EL PROTOCOLO ENCUBIERTO');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-red-950/20 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-black border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.3)] overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skull className="text-white animate-pulse" size={24} />
            <h2 className="font-mono text-lg font-bold text-white tracking-[0.2em] uppercase">
              TERMINAL DE OPERACIONES ENCUBIERTAS
            </h2>
          </div>
          <button onClick={onClose} className="text-white hover:rotate-90 transition-transform">
            <X size={24} />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-red-950/40 border-b border-red-600/30 p-2 px-6 flex justify-between items-center font-mono text-[10px]">
          <span className="text-red-400">CREDITOS DE INFAMIA DISPONIBLES:</span>
          <span className="text-white font-bold bg-red-600 px-2 py-0.5">[{murderPoints} MP]</span>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-red-600/5 via-transparent to-red-600/5 animate-scanline"></div>

          {/* Action Cards */}
          <ShopAction 
            title="DECODIFICAR VERDAD" 
            cost={1} 
            icon={<Eye className="text-red-500" />} 
            description="Permite visualizar el contenido detallado de TODAS las pistas en tu ubicación actual sin gastar IP."
            onClick={() => handleAction('REVEAL_TRUTH', 1)}
            disabled={isLoading || murderPoints < 1}
          />

          <ShopAction 
            title="DISTOSIÓN DE EVIDENCIA" 
            cost={2} 
            icon={<Zap className="text-red-500" />} 
            description="Genera una pista falsa que será visible para otros estudiantes pero que no tiene valor real."
            onClick={() => handleAction('PLANT_FAKE', 2)}
            disabled={isLoading || murderPoints < 2}
          />

          <ShopAction 
            title="SABOTAJE DEL SISTEMA" 
            cost={3} 
            icon={<AlertTriangle className="text-red-500" />} 
            description="Lanza una alerta de 'FALLO DE SISTEMA' que bloquea la visión de los demás estudiantes por 10 segundos."
            onClick={() => handleAction('SYSTEM_GLITCH', 3)}
            disabled={isLoading || murderPoints < 3}
          />

          <ShopAction 
            title="COARTADA PERFECTA" 
            cost={1} 
            icon={<MapPin className="text-red-500" />} 
            description="Te permite desplazarte a una sala adyacente sin que se registre en el log de movimientos global."
            onClick={() => handleAction('ALIBI', 1)}
            disabled={isLoading || murderPoints < 1}
          />
        </div>

        <div className="p-6 bg-red-600/5 border-t border-red-600/30">
           <AssassinConsultant roomId={coordinationRoomId} />
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
      className={`sci-border p-4 flex flex-col text-left transition-all relative overflow-hidden group ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:bg-red-600/10 hover:border-red-500'}`}
    >
       <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-red-950/20 border border-red-900/40 text-red-500">
             {icon}
          </div>
          <div className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold font-mono">
             -{cost} MP
          </div>
       </div>
       <h4 className="font-mono text-xs font-bold text-white uppercase mb-1 tracking-wider">{title}</h4>
       <p className="font-mono text-[9px] text-zinc-500 uppercase leading-tight line-clamp-2">
          {description}
       </p>
       
       <div className="absolute bottom-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-600"></div>
       </div>
    </button>
  );
}
