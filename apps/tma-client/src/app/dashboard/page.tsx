import { getTMACharacterServer as getTMACharacter, getGameStateServer as getGameState, getUserProfileServer as getUserProfile } from '@/features/characters/server-api';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Battery } from 'lucide-react';
import { TmaStoreInitializer } from '@/components/TmaStoreInitializer';
import { DashboardHudStats } from '@/features/dashboard/components/DashboardHudStats';
import { DashboardPistasButton } from '@/features/dashboard/components/DashboardPistasButton';
import { PollRealtimeListener } from '@/features/investigation/components/PollRealtimeListener';
import { GlobalPollOverlay } from '@/features/dashboard/components/GlobalPollOverlay';

export default async function DashboardPage() {
  const character = await getTMACharacter();
  const gameState = await getGameState();
  const profile = await getUserProfile();

  if (!character) {
    redirect('/dashboard/enroll');
  }

  const isAdmin = profile?.role === 'staff' || profile?.role === 'superadmin';

  // Fallbacks for data from the Vault or Custom TMA inputs
  const finalName = character.tmc_character?.name || character.tma_name || 'UNKNOWN SUBJECT';
  const finalImageUrl = character.tmc_character?.image_url || character.image_url;
  const inceptDate = character.created_at ? new Date(character.created_at).toLocaleDateString() : 'UNKNOWN';
  
  // Specific properties (only exist if coming from TMC vault currently)
  const ageStr = character.tmc_character?.age ? character.tmc_character.age.toUpperCase() : 'CLASSIFIED';
  const nationalityStr = character.tmc_character?.nationality ? character.tmc_character.nationality.toUpperCase() : 'UNKNOWN';
  const heightStr = character.tmc_character?.height ? character.tmc_character.height.toUpperCase() : 'UNKNOWN';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto h-full animate-fade-in relative pt-0 md:pt-4">
      <TmaStoreInitializer character={character} gameState={gameState} />
      <PollRealtimeListener />
      <GlobalPollOverlay />

      {/* Pantalla CRT global */}
      <div className="fixed inset-0 crt-scanline pointer-events-none" />

      {/* ID CARD MAIN CONTAINER */}
      <div className="relative w-full border border-(--glow) bg-black p-4 md:p-6 flex flex-col gap-4 text-(--glow) shadow-[0_0_25px_rgba(59,130,246,0.15)]">
        
        {/* Esquinas (Cruces CSS) */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-(--glow) -translate-x-px -translate-y-px" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-(--glow) translate-x-px -translate-y-px" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-(--glow) -translate-x-px translate-y-px" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-(--glow) translate-x-px translate-y-px" />

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-(--glow)/50 pb-2 mb-2 gap-2">
          <div className="flex items-center gap-3">
             <h1 className="font-mono text-xl md:text-2xl font-bold tracking-widest uppercase truncate shrink-0">
               SUJETO A-{character.id.split('-')[0].substring(0,2).toUpperCase()}
             </h1>
             <span className="text-(--glow)/50 font-mono text-xl hidden sm:inline-block">|</span>
             <span className="font-mono text-sm md:text-base tracking-widest uppercase opacity-80 truncate hidden sm:inline-block">
               PROTOCOLO NEURAL NERVALIS [ v.4.1.2 ]
             </span>
          </div>
          <div className="flex items-center gap-2 opacity-80">
            <span className="font-mono text-xs hidden md:inline-block">PWR_SYS_NORM</span>
            <Battery className="w-5 h-5" />
          </div>
        </div>

        {/* 3 COLUMNS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-4 h-full">
          
          {/* PANEL 1: CCTV IMAGE */}
          <div className="sci-border p-2 flex flex-col aspect-square lg:aspect-auto lg:min-h-[400px]">
             <div className="flex border-b border-(--glow)/30 pb-1 mb-2 px-1">
               <span className="font-mono text-[10px] md:text-xs">| CÓDICE DE SUJETO A-{character.id.split('-')[0].substring(0,2).toUpperCase()} / FEED_01</span>
             </div>
             <div className="flex justify-between w-full pb-1 px-1">
               <span className="font-mono text-[8px] uppercase opacity-70">CAM._FEED_01</span>
               <span className="font-mono text-[8px] uppercase animate-pulse text-red-500">REC ●</span>
             </div>
             <div className="relative w-full flex-1 bg-black overflow-hidden cctv-filter border border-(--glow)/30">
               {finalImageUrl ? (
                 <Image src={finalImageUrl} alt={finalName} fill className="object-cover relative z-10" unoptimized />
               ) : (
                 <div className="w-full h-full flex items-center justify-center font-mono text-xs text-center p-4">VISUAL DATA LOST</div>
               )}
             </div>
          </div>

          {/* PANEL 2: METADATA Y SENSOR */}
          <div className="sci-border p-2 flex flex-col lg:min-h-[400px]">
             <div className="flex border-b border-(--glow)/30 pb-1 mb-4 px-1">
               <span className="font-mono text-[10px] md:text-xs">| PERFIL DE DATOS CRÍTICOS</span>
             </div>
             
             {/* DATA TABLE */}
             <div className="flex-1 flex flex-col gap-3 font-mono text-xs md:text-sm px-1">
               <div className="flex border-b border-(--glow)/30 pb-1">
                 <span className="w-1/3 opacity-70">NAMP</span>
                 <span className="flex-1 text-right text-(--text-muted) truncate">{finalName.toUpperCase()}</span>
               </div>
               <div className="flex border-b border-(--glow)/30 pb-1">
                 <span className="w-1/3 opacity-70">INCEPT DATE</span>
                 <span className="flex-1 text-right text-(--text-muted)">{inceptDate}</span>
               </div>
               <div className="flex border-b border-(--glow)/30 pb-1">
                 <span className="w-1/3 opacity-70">DESIGNATION</span>
                 <span className="flex-1 text-right text-(--text-muted)">{character.tma_title?.toUpperCase()}</span>
               </div>
               <div className="flex border-b border-(--glow)/30 pb-1">
                 <span className="w-1/3 opacity-70">AGI / HEIGHT</span>
                 <span className="flex-1 text-right text-(--text-muted)">{ageStr} / {heightStr}</span>
               </div>
               <div className="flex border-b border-(--glow)/30 pb-1">
                 <span className="w-1/3 opacity-70">ORIGIN</span>
                 <span className="flex-1 text-right text-(--text-muted)">{nationalityStr}</span>
               </div>
               <div className="flex border-b border-(--glow)/30 pb-1">
                 <span className="w-1/3 opacity-70">MENTAL STATE</span>
                 <span className="flex-1 text-right text-(--text-muted)">UNKNOWN</span>
               </div>
               
               {/* Reactivo desde Zustand: Points y Status */}
               <DashboardHudStats />
             </div>

             {/* RADAR / SENSOR BEAT SVG */}
             <div className="h-16 w-full mt-4 flex flex-col justify-end opacity-70">
                <svg className="w-full h-full stroke-(--glow)" viewBox="0 0 400 30" fill="none" preserveAspectRatio="none">
                  <path d="M0,15 Q20,30 40,15 T80,15 T120,15 T160,15 T200,15 T240,15 T280,15 T320,15 T360,15 T400,15" strokeWidth="1"/>
                  <path d="M0,15 Q30,-5 60,15 T120,15 T180,15 T240,15 T300,15 T360,15 T420,15" strokeWidth="1" strokeOpacity="0.5"/>
                </svg>
             </div>
          </div>

          {/* PANEL 3: SISTEMA (MENU 2x2) */}
          <div className="flex flex-col gap-3 lg:min-h-[400px]">
             <div className="flex w-full px-1">
               <span className="font-mono text-[10px] md:text-xs">| RESUMEN DEL SISTEMA | RED NERVALIS</span>
             </div>

             <div className="grid grid-cols-2 grid-rows-2 gap-3 flex-1 h-full">
               
               {/* BTN 1: Dashboard Chart */}
               <button className="sci-border p-2 flex flex-col hover:bg-(--glow)/5 transition-colors group relative overflow-hidden h-full min-h-[140px]">
                 <span className="font-mono text-[9px] opacity-80 mb-2"> [ DASHBOARD ] </span>
                 <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_5px_#4ade80]" />
                 <div className="flex-1 w-full border-b border-l border-(--glow)/30 flex items-end p-1 mt-2">
                    <svg className="w-full h-full stroke-(--glow) opacity-60 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 50" preserveAspectRatio="none" fill="none">
                      <path d="M0,45 L10,35 L20,40 L30,20 L40,25 L50,10 L60,15 L70,5 L80,25 L90,15 L100,20" strokeWidth="1.5" />
                      <path d="M0,45 L10,35 L20,40 L30,20 L40,25 L50,10 L60,15 L70,5 L80,25 L90,15 L100,20 L100,50 L0,50 Z" fill="currentColor" fillOpacity="0.1" stroke="none" />
                    </svg>
                 </div>
                 <div className="w-full flex font-mono text-[8px] opacity-70 mt-2 justify-between">
                   <span>STATUS</span> <span className="text-green-400">UP: 99%</span>
                 </div>
               </button>

               {/* BTN 2: Mapa 3D */}
               <Link href="/map" className="sci-border p-2 flex flex-col items-center justify-center hover:bg-(--glow)/5 transition-colors group relative h-full min-h-[140px]">
                 <span className="font-mono text-[9px] opacity-80 self-start absolute top-2 left-2"> [ MAPA 3D ] </span>
                 <div className="w-16 h-16 rounded-full border border-(--glow)/40 relative mt-4 overflow-hidden shadow-[inset_0_0_10px_rgba(59,130,246,0.3)]">
                   <div className="absolute inset-0 border border-(--glow)/30 rounded-full transform rotate-45 scale-y-50" />
                   <div className="absolute inset-0 border border-(--glow)/30 rounded-full transform -rotate-45 scale-y-50" />
                   <div className="absolute inset-0 border border-(--glow)/30 rounded-full transform scale-x-50" />
                   <div className="absolute inset-x-0 top-1/2 h-px bg-(--glow)/50" />
                 </div>
                 <div className="h-[3px] bg-(--glow)/20 mt-4 rounded-full overflow-hidden absolute bottom-3 left-0 w-[calc(100%-1rem)] mx-2">
                   <div className="w-1/3 h-full bg-(--glow) shadow-[0_0_5px_var(--glow)] animate-pulse" />
                 </div>
               </Link>

               {/* BTN 3: Reglamento */}
               <button className="sci-border p-2 flex flex-col items-center justify-center hover:bg-(--glow)/5 transition-colors group relative h-full min-h-[140px]">
                 <span className="font-mono text-[9px] opacity-80 self-start absolute top-2 left-2"> [ REGLAMENTO ] </span>
                 <div className="w-10 h-14 border border-(--glow) mt-4 relative flex flex-col items-center p-1 px-2 opacity-80 group-hover:opacity-100 transition-opacity">
                   <div className="w-full border-b border-(--glow) mb-1 mt-1" />
                   <div className="w-3/4 border-b border-(--glow) mb-1 self-start" />
                   <div className="w-full border-b border-(--glow) mb-1" />
                   <div className="w-1/2 border-b border-(--glow) mb-1 self-start" />
                   {/* Bookmark icon shape */}
                   <div className="absolute top-0 right-1 w-2 h-4 bg-(--glow)/50" />
                 </div>
                 <div className="w-full h-px bg-(--glow)/50 absolute bottom-3 left-0"><div className="w-1.5 h-1.5 bg-(--glow) absolute -top-[2px] left-2 rounded-full" /></div>
               </button>

               {/* BTN 4: Pistas (Reactive) */}
               <DashboardPistasButton />

             </div>
          </div>
          
        </div>

        {/* BOTTOM RAW DATA BLOCK */}
        <div className="w-full sci-border p-2 mt-2 bg-(--glow)/5 overflow-hidden flex flex-col gap-1">
           <span className="font-mono text-[8px] md:text-[10px] opacity-70">| REGISTRO DE FLUJO DE DATOS NEURALES ]</span>
           <p className="font-mono text-[7px] md:text-[8.5px] leading-tight text-(--glow) opacity-60 break-all text-justify">
             01001100 01100001 00100000 01100011 01101001 01100101 01101110 01100011 01101001 01100001 00100000 01100101 01110011 00100000 01101110 01110101 01100101 01110011 01110100 01110010 01100001 00100000 01110101 01101110 01101001 01100011 01100001 00100000 01110011 01100001 01101100 01110110 01100001 01100011 01101001 01101111 01101110 00101110 00100000 01101100 01100001 00100000 01110011 01100101 01101100 01100101 01100011 01100011 01101001 01101111 01101110 00100000 01100100 01100101 01100010 01100101 00100000 01101000 01100001 01100011 01100101 01110010 01110011 01100101 00101100 00100000 01100001 01110101 01101110 00100000 01110011 01101001 00100000 01100101 01110011 00100000 01100001 01101110 01110100 01101001 01101110 01100001 01110100 01110101 01110010 01100001 01101100 00101110 01100100 01100001 01110100 01100001 00100000 01100011 01101111 01110010 01110010 01110101 01110000 01110100 01100101 01100100
           </p>
        </div>

      </div>

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
           <button className="px-10 py-3 bg-(--glow)/10 text-(--glow) font-mono text-xs tracking-widest uppercase border border-(--glow) hover:bg-(--glow) hover:text-black hover:shadow-[0_0_20px_var(--glow)] transition-all flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
             Init System (Acceder)
           </button>
         )}
      </div>

    </div>
  );
}
