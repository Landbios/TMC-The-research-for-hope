'use client';

import { Suspense } from 'react';
import { Shield, Power } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };
  return (
    <div className="min-h-screen bg-(--bg) text-(--text) flex flex-col items-center">
      {/* Grid Background */}
      <div className="fixed inset-0 grid-overlay pointer-events-none" />

      {/* Top Navbar */}
      <nav className="w-full relative z-20 border-b border-(--border) bg-(--surface-alt) px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-(--glow)" />
          <span className="font-cinzel tracking-widest text-[#CBD5E1] font-bold uppercase text-sm">
            Red Nervalis
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="mono-label hidden md:inline-block">Conexión Segura</span>
          <div className="w-2 h-2 rounded-full bg-(--glow) shadow-[0_0_8px_var(--glow)] animate-pulse" />
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

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-5xl p-6 md:p-10 flex-1 flex flex-col">
        <Suspense fallback={<div className="animate-pulse m-auto mono-label">Sintetizando datos...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
