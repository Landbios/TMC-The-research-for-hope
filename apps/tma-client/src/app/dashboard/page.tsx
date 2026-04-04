import { getTMACharacterServer as getTMACharacter, getGameStateServer as getGameState, getUserProfileServer as getUserProfile } from '@/features/characters/server-api';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { GlobalTmaRegistry } from '@/components/GlobalTmaRegistry';
import { UserDashboardView } from '@/features/dashboard/components/UserDashboardView';
import { AdminDashboardView } from '@/features/dashboard/components/AdminDashboardView';
import { NervalisOverlay } from '@/features/dashboard/components/NervalisOverlay';
import { getAllTMACharacters } from '@/features/characters/api';
import { NervalisAccessButton } from '@/features/dashboard/components/NervalisAccessButton';

export default async function DashboardPage() {
  const character = await getTMACharacter();
  const gameState = await getGameState();
  const profile = await getUserProfile();

  if (!character) {
    redirect('/dashboard/enroll');
  }

  const isAdmin = profile?.role === 'staff' || profile?.role === 'superadmin';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto h-full animate-fade-in relative pt-0 md:pt-4">
      <GlobalTmaRegistry 
        character={character} 
        gameState={gameState} 
        userRole={profile?.role as 'roleplayer' | 'staff' | 'superadmin'} 
      />
      <NervalisOverlay />

      {/* Pantalla CRT global */}
      <div className="fixed inset-0 crt-scanline pointer-events-none" />

      {/* CONDITIONAL DASHBOARD CONTENT */}
      {isAdmin ? (
         <div className="w-full h-full flex flex-col gap-6">
           <AdminDashboardView initialCharacters={await getAllTMACharacters()} />
         </div>
      ) : (
         <UserDashboardView character={character} />
      )}

      {/* BOTTOM RAW DATA BLOCK */}
      {!isAdmin && (
        <div className="w-full text-center py-4 flex flex-col items-center gap-2">
           <span className="font-mono text-[8px] text-(--glow) opacity-40 uppercase tracking-[0.5em]">Neural Link Stable</span>
        </div>
      )}

      {/* ACCESS BUTTON */}
      <div className="pt-8 text-center flex flex-col items-center gap-4 w-full">
         {isAdmin ? (
           <Link 
             href="/admin"
             className="px-10 py-3 bg-red-500/10 text-red-500 font-mono text-xs tracking-widest uppercase border border-red-500/50 hover:bg-red-600 hover:text-white hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all flex items-center gap-2 group relative overflow-hidden"
           >
             <div className="absolute inset-0 bg-red-500/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none" />
             <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
             <span className="relative z-10">OVERRIDE SYSTEM (MÁSTER)</span>
             <div className="absolute top-0 left-0 w-full h-px bg-red-500/50 animate-glitch-line" />
           </Link>
         ) : (
            <NervalisAccessButton />
         )}
      </div>

    </div>
  );
}
