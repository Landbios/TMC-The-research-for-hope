'use client';

import { useState, useEffect } from 'react';
import { useTmaStore } from '@/store/useTmaStore';
import { useRouter, usePathname } from 'next/navigation';
import { ensureMurderRoom } from '@/features/admin/api';
import { Loader2, Skull } from 'lucide-react';

export function AssassinRevealOverlay() {
  const isAssassin = useTmaStore(state => state.isAssassin);
  const originalCharacter = useTmaStore(state => state.originalCharacter);
  const isStoreInitialized = useTmaStore(state => state.isStoreInitialized);
  const router = useRouter();
  const pathname = usePathname();
  
  const [show, setShow] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  // Detectar si el usuario es el asesino y no ha visto el overlay en esta carga de página
  useEffect(() => {
    // Si ya estamos en una ruta de "rooms", verificamos si es el cuarto secreto para no mostrar el overlay
    const isInRoom = pathname?.includes('/rooms/');
    
    const verifyEligibility = async () => {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      
      // 1. Verificar etapa del cuarto de asesinato
      const { data: coordRoom } = await supabase
        .from('tma_rooms')
        .select('coordination_stage')
        .eq('name', 'COORDINACIÓN DE ASESINATO')
        .maybeSingle();

      const isPlanning = coordRoom?.coordination_stage === 'PLANNING';

      if (isStoreInitialized && isAssassin && !hasAcknowledged && !isInRoom && isPlanning) {
        setShow(true);
      } else {
        // Si ya no es planeamiento, o ya reconoció, o está en el cuarto, ocultar
        if (isInRoom || !isPlanning) {
          setHasAcknowledged(true);
        }
        setShow(false);
      }
    };

    if (isStoreInitialized) {
      verifyEligibility();
    }
  }, [isAssassin, isStoreInitialized, hasAcknowledged, pathname]);

  const handleEnterSecretRoom = async () => {
    setIsRedirecting(true);
    try {
      const roomId = await ensureMurderRoom();
      setHasAcknowledged(true);
      setShow(false);
      router.push(`/rooms/${roomId}`);
    } catch (error) {
      console.error("Error al entrar al cuarto secreto:", error);
    } finally {
      setIsRedirecting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black overflow-hidden pointer-events-auto">
      {/* Glitch Background Effects */}
      <div className="absolute inset-0 bg-red-950/20 backdrop-blur-md animate-glitch-heavy"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      <div className="absolute inset-0 bg-linear-to-b from-red-600/10 via-transparent to-red-600/10 animate-scanline"></div>

      <div className="relative w-full max-w-2xl p-1 bg-red-600 shadow-[0_0_100px_rgba(220,38,38,0.5)]">
         <div className="bg-black p-12 flex flex-col items-center gap-8 border border-red-500/30">
            
            <div className="flex items-center justify-center w-24 h-24 border-2 border-red-600 rounded-full animate-pulse">
               <Skull size={48} className="text-red-600" />
            </div>

            <div className="space-y-4 text-center">
               <h2 className="font-cinzel text-5xl text-white uppercase tracking-[0.2em] font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  PROTOCOLO DE ASESINO ACTIVADO
               </h2>
               <div className="h-1 w-full bg-red-600/40 relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-600 animate-loading-bar"></div>
               </div>
               <p className="font-mono text-sm text-red-500/80 uppercase tracking-widest animate-pulse font-bold">
                  AUTORIZACIÓN DE NIVEL 5 // BLACKOUT_ESTABLISHED
               </p>
            </div>

            <div className="bg-red-950/20 border border-red-900/50 p-6 text-center max-w-md">
               <p className="font-mono text-[11px] text-zinc-400 leading-relaxed uppercase">
                  Has sido seleccionado para perpetrar el incidente actual. Tus privilegios de acceso han sido actualizados. Entra en la sala de coordinación para iniciar el planteamiento.
               </p>
            </div>

            <button 
              onClick={handleEnterSecretRoom}
              disabled={isRedirecting}
              className="group relative px-12 py-5 bg-transparent border-2 border-red-600 text-red-600 font-mono text-lg uppercase font-bold tracking-[0.3em] overflow-hidden hover:bg-red-600 hover:text-black transition-all duration-300 disabled:opacity-50"
            >
               <span className="relative z-10 flex items-center gap-3">
                  {isRedirecting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      SINCRONIZANDO...
                    </>
                  ) : (
                    '[ INGRESAR AL CUARTO OCULTO ]'
                  )}
               </span>
               <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </button>

            <div className="flex gap-2">
               {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-12 h-1 bg-red-600/30"></div>
               ))}
            </div>
         </div>
      </div>
      
      {/* Decorative text bits */}
      <div className="absolute bottom-6 left-6 font-mono text-[9px] text-red-500/40 uppercase gap-1 flex flex-col">
         <p>TERMINAL_ID: SCION_X86_64</p>
         <p>CONNECTION: ENCRYPTED_TUNNEL</p>
      </div>
      <div className="absolute top-6 right-6 font-mono text-[9px] text-red-500/40 uppercase gap-1 flex flex-col text-right">
         <p>USER: {originalCharacter?.tma_name?.toUpperCase()}</p>
         <p>ROLE: ASSASSIN</p>
      </div>
    </div>
  );
}
