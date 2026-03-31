'use client';

import { Suspense } from 'react';
import { Shield, Power } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTmaStore } from '@/store/useTmaStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const gamePeriod = useTmaStore(state => state.gamePeriod);

  // Selector visual para la cabecera
  const getBannerStyle = () => {
    switch (gamePeriod) {
      case 'NIGHTTIME':
        return 'bg-red-950/40 text-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse';
      case 'INVESTIGATION':
        return 'bg-amber-950/40 text-amber-500 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      default:
        return 'bg-(--surface-alt) text-[#CBD5E1] border-(--border)';
    }
  };

  const bannerTheme = getBannerStyle();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };
  return (
    <div className="min-h-screen bg-(--bg) text-(--text) flex flex-col items-center">
      {/* Grid Background */}
      <div className="fixed inset-0 grid-overlay pointer-events-none" />

      {/* Top Navbar DYNAMIC BANNER */}
      <nav className={`w-full relative z-20 border-b px-6 py-4 flex items-center justify-between transition-colors duration-1000 ${bannerTheme}`}>
        <div className="flex items-center gap-3">
          <Shield className={`w-5 h-5 ${gamePeriod === 'NIGHTTIME' ? 'text-red-500' : 'text-(--glow)'}`} />
          <span className="font-cinzel tracking-widest font-bold uppercase text-sm flex gap-4">
            Red Nervalis
            <span className="opacity-80 font-mono text-xs hidden sm:inline-block">
              {gamePeriod === 'NIGHTTIME' && '[ HORARIO NOCTURNO ]'}
              {gamePeriod === 'INVESTIGATION' && '[ DEADLY LIFE / INVESTIGACIÓN ]'}
              {gamePeriod === 'FREE_TIME' && '[ DAILY LIFE / TIEMPO LIBRE ]'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="mono-label hidden md:inline-block text-current">
            {gamePeriod === 'NIGHTTIME' ? 'Alarma Restricción' : 'Conexión Segura'}
          </span>
          <div className={`w-2 h-2 rounded-full shadow-lg animate-pulse ${gamePeriod === 'NIGHTTIME' ? 'bg-red-500 shadow-red-500' : 'bg-(--glow) shadow-(--glow)'}`} />
          <button 
            onClick={handleLogout}
            className="ml-4 flex items-center gap-1 px-3 py-1.5 border border-(--danger) text-(--danger) hover:bg-(--danger-hover) hover:text-white transition-colors text-[0.6rem] uppercase tracking-widest font-mono rounded-sm"
            title="Desconectar Terminal"
          >
            <Power size={12} />
            <span className="hidden sm:inline">DISCONNECT</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area (Layout con Sidebar Menú) */}
      <div className="relative z-10 w-full max-w-6xl flex-1 flex flex-col md:flex-row p-4 md:p-8 gap-6">
        
        {/* SIDEBAR NAVIGATION (Nervalis System Menu) */}
        <aside className="w-full md:w-48 flex flex-col gap-2 shrink-0">
           <div className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-50 mb-2 border-b border-current pb-1 text-(--glow)">
             SISTEMA PRINCIPAL
           </div>
           {['[ DASHBOARD ]', '[ MAPA 3D ]', '[ REGLAMENTO ]', '[ PISTAS ]'].map((item) => (
             <button key={item} className="text-left font-mono text-xs tracking-widest text-[#CBD5E1] opacity-70 hover:opacity-100 hover:bg-(--glow)/10 px-2 py-2 transition-all border border-transparent hover:border-(--glow)/50">
               {item}
             </button>
           ))}
        </aside>

        {/* CONTENIDO (ID CARD / MAPA / ETC) */}
        <main className="flex-1 w-full relative">
          <Suspense fallback={<div className="animate-pulse m-auto mono-label mt-20 text-center w-full">Sintetizando datos visuales...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
