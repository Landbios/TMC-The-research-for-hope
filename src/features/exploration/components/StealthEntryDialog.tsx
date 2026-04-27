'use client';

import { useState } from 'react';
import { rollD20, checkSuccess } from '@/features/shared/utils/dice_utils';
import { ShieldAlert, Fingerprint, DoorOpen } from 'lucide-react';
import { DiceAnimation } from '@/features/shared/components/DiceAnimation';

interface StealthEntryDialogProps {
  roomName: string;
  onDecide: (action: 'STEALTH' | 'NORMAL', success?: boolean) => void;
  onCancel: () => void;
}

export function StealthEntryDialog({ roomName, onDecide, onCancel }: StealthEntryDialogProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  const DC = 12; // Dificultad base para sigilo

  const handleStealthAttempt = () => {
    setIsRolling(true);
    
    // Simular animación de dados
    setTimeout(() => {
      const result = rollD20(0); // Por ahora sin bonos
      const isSuccess = checkSuccess(result, DC);
      
      setRollResult(result.total);
      setSuccess(isSuccess);
      setIsRolling(false);
      
      // Delay antes de cerrar para ver el resultado
      setTimeout(() => {
        onDecide('STEALTH', isSuccess);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-250 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-md bg-[#020202] border-2 border-amber-600/50 p-6 relative overflow-hidden shadow-[0_0_50px_rgba(217,119,6,0.3)]">
        
        {/* CRT Scanline */}
        <div className="absolute inset-0 pointer-events-none crt-scanline opacity-30"></div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-4 border-b border-amber-600/30 pb-4">
            <div className="w-12 h-12 rounded-full border-2 border-amber-500 flex items-center justify-center bg-amber-500/10">
              <ShieldAlert className="text-amber-500 animate-pulse" />
            </div>
            <div>
              <h2 className="font-mono text-lg font-bold text-amber-500 tracking-wider">
                ADVERTENCIA: ZONA RESTRINGIDA
              </h2>
              <p className="font-mono text-[10px] text-amber-400/70">
                PROTOCOLO DE PRIVACIDAD DETECTADO EN: {roomName.toUpperCase()}
              </p>
            </div>
          </div>

          {!isRolling && rollResult === null ? (
            <>
              <p className="font-mono text-xs text-white leading-relaxed">
                LA SALA SE ENCUENTRA EN MODO CRÍTICO. TU ENTRADA SERÁ NOTIFICADA AUTOMÁTICAMENTE A LOS OCUPANTES A MENOS QUE UTILICES MANIOBRAS DE SIGILO.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => onDecide('NORMAL')}
                  className="group relative h-24 flex flex-col items-center justify-center gap-2 border border-blue-500/30 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/20 transition-all font-mono"
                >
                  <DoorOpen className="text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] uppercase tracking-widest text-blue-400">Entrar Normal</span>
                  <span className="text-[7px] text-blue-500/50 mt-1 uppercase">(Serás anunciado)</span>
                </button>

                <button 
                  onClick={handleStealthAttempt}
                  className="group relative h-24 flex flex-col items-center justify-center gap-2 border border-amber-500/30 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/20 transition-all font-mono"
                >
                  <Fingerprint className="text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] uppercase tracking-widest text-amber-400">Tirada de Sigilo</span>
                  <span className="text-[7px] text-amber-500/50 mt-1 uppercase">(DC {DC} • Invisibility Chance)</span>
                </button>
              </div>
              
              <button 
                onClick={onCancel}
                className="w-full py-2 font-mono text-[9px] uppercase text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                [ CANCELAR ENTRADA ]
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-6 animate-in fade-in zoom-in">
              {isRolling ? (
                <>
                  <DiceAnimation />
                  <p className="font-mono text-xs text-amber-500 animate-pulse uppercase tracking-[0.3em] mt-4">
                    CALCULANDO VECTOR DE ENTRADA...
                  </p>
                </>
              ) : (
                <>
                  <div className={`text-6xl font-bold font-mono shadow-sm ${success ? 'text-green-500' : 'text-red-500'}`}>
                    [{rollResult}]
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className={`text-xl font-bold font-mono tracking-widest uppercase ${success ? 'text-green-400' : 'text-red-400'}`}>
                      {success ? 'SIGILO EXITOSO' : 'FALLO CRÍTICO'}
                    </h4>
                    <p className="font-mono text-[9px] text-zinc-500 uppercase">
                      {success 
                        ? 'PROTOCOLO DE ENCRIPTACIÓN PERSONAL ACTIVADO. INVISIBILIDAD GARANTIZADA.' 
                        : 'SISTEMA DE ANUNCIO FORZADO. TU PRESENCIA SERÁ REPORTADA.'}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
