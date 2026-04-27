import Link from 'next/link';
import { AcademyMap } from '@/features/exploration/components/AcademyMap';
import { VNDialogBox } from '@/features/vn-ui/components/VNDialogBox';
import { getTMACharacterServer as getTMACharacter, getGameStateServer as getGameState, getUserProfileServer as getUserProfile } from '@/features/characters/server-api';
import { GlobalTmaRegistry } from '@/components/GlobalTmaRegistry';
import { redirect } from 'next/navigation';

export default async function MapPage() {
  const character = await getTMACharacter();
  const gameState = await getGameState();
  const profile = await getUserProfile();

  if (!character) {
    redirect('/dashboard/enroll');
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen bg-black text-(--glow) relative overflow-hidden pointer-events-auto">
      <GlobalTmaRegistry 
        character={character} 
        gameState={gameState} 
        userRole={profile?.role as 'roleplayer' | 'staff' | 'superadmin'} 
      />
      
      {/* Botón de retroceso al Dashboard */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/dashboard" className="px-5 py-2.5 border-[1.5px] border-(--glow) bg-black/70 backdrop-blur-md hover:bg-(--glow) hover:text-black transition-all font-mono text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          DASHBOARD
        </Link>
      </div>

      {/* 3D Canvas Layer Z-0 */}
      <AcademyMap />

      {/* VN UI Layer Z-50 */}
      <VNDialogBox />
      
      {/* Superposición temporal de estática ligera y scanlines */}
      <div className="fixed inset-0 crt-scanline pointer-events-none z-40 opacity-50 mix-blend-overlay" />
    </div>
  );
}
