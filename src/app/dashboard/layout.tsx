'use client';

import { Suspense } from 'react';
import { Shield, Power } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTmaStore } from '@/store/useTmaStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const gamePeriod = useTmaStore(state => state.gamePeriod);

  const getBannerStyle = () => {
    switch (gamePeriod) {
      case 'NIGHTTIME':
        return 'bg-red-950/60 text-red-500 border-b-2 border-red-500 shadow-[0_5px_30px_rgba(239,68,68,0.5)] animate-pulse';
      case 'INVESTIGATION':
        return 'bg-amber-950/60 text-amber-500 border-b-2 border-amber-500 shadow-[0_5px_30px_rgba(245,158,11,0.4)]';
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
          <Shield className={`w-5 h-5 drop-shadow-[0_0_8px_currentColor] ${gamePeriod === 'NIGHTTIME' ? 'text-red-500' : 'text-(--glow)'}`} />
          <span className="font-cinzel tracking-widest font-bold uppercase text-sm flex gap-4 drop-shadow-[0_0_5px_currentColor]">
            Red Nervalis
            <span className="opacity-90 font-mono text-xs hidden sm:inline-block">
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

      {/* Main Content Area (Centrada, sin sidebar) */}
      <div className="relative z-10 w-full max-w-7xl flex-1 flex flex-col p-4 md:p-8">
        <main className="flex-1 w-full mx-auto flex flex-col justify-center">
          <Suspense fallback={<div className="animate-pulse m-auto mono-label mt-20 text-center w-full">Sintetizando datos visuales...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
