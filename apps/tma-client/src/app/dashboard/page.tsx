import { getTMACharacter } from '@/features/characters/api';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { Battery } from 'lucide-react';

export default async function DashboardPage() {
  const character = await getTMACharacter();

  if (!character) {
    redirect('/dashboard/enroll');
  }

  // Fallbacks for data from the Vault or Custom TMA inputs
  const finalName = character.tmc_character?.name || character.tma_name || 'UNKNOWN SUBJECT';
  const finalImageUrl = character.tmc_character?.image_url || character.image_url;
  const inceptDate = character.created_at ? new Date(character.created_at).toLocaleDateString() : 'UNKNOWN';
  
  // Specific properties (only exist if coming from TMC vault currently)
  const ageStr = character.tmc_character?.age ? character.tmc_character.age.toUpperCase() : 'CLASSIFIED';
  const nationalityStr = character.tmc_character?.nationality ? character.tmc_character.nationality.toUpperCase() : 'UNKNOWN';
  const heightStr = character.tmc_character?.height ? character.tmc_character.height.toUpperCase() : 'UNKNOWN';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto h-full animate-fade-in relative pt-4">

      {/* Pantalla CRT global (se suma al bg del layout) */}
      <div className="fixed inset-0 crt-scanline pointer-events-none" />

      {/* ID CARD MAIN CONTAINER - 80s SCIENTIFIC TERMINAL STYLE */}
      <div className="relative w-full border border-(--glow) bg-black p-4 md:p-6 flex flex-col gap-4 text-(--glow) shadow-[0_0_20px_rgba(59,130,246,0.1)]">
        
        {/* Esquinas (Cruces CSS) */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-(--glow) -translate-x-px -translate-y-px" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-(--glow) translate-x-px -translate-y-px" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-(--glow) -translate-x-px translate-y-px" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-(--glow) translate-x-px translate-y-px" />

        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-(--glow) pb-2 mb-2">
          <h1 className="font-mono text-xl md:text-2xl font-bold tracking-widest uppercase truncate max-w-[80%]">
            SUBJECT A-{character.id.split('-')[0].substring(0,2).toUpperCase()}
          </h1>
          <div className="flex items-center gap-2 opacity-80">
            <span className="font-mono text-xs hidden md:inline-block">PWR_SYS_NORM</span>
            <Battery className="w-5 h-5" />
          </div>
        </div>

        {/* GRID LAYOUT PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          
          {/* PANEL IZQUIERDO: CCTV IMAGE */}
          <div className="sci-border p-2 flex flex-col aspect-square md:aspect-auto">
            <div className="flex justify-between w-full pb-2 px-1">
              <span className="font-mono text-[10px] uppercase">CAM._FEED_01</span>
              <span className="font-mono text-[10px] uppercase animate-pulse">REC ●</span>
            </div>
            <div className="relative w-full flex-1 bg-black overflow-hidden cctv-filter border border-(--glow)/30">
              {finalImageUrl ? (
                <Image
                  src={finalImageUrl}
                  alt={finalName}
                  fill
                  className="object-cover relative z-10"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-xs text-center p-4">
                  VISUAL DATA LOST
                </div>
              )}
            </div>
          </div>

          {/* PANEL DERECHO: METADATA Y SENSOR */}
          <div className="flex flex-col gap-4">
            
            {/* DATA TABLE */}
            <div className="sci-border flex-1 p-3 flex flex-col gap-2 font-mono text-xs md:text-sm">
              <div className="flex border-b border-(--glow)/30 pb-1">
                <span className="w-1/3 opacity-70">NAME</span>
                <span className="flex-1 text-right text-(--text-muted) truncate pl-2">{finalName.toUpperCase()}</span>
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
                <span className="w-1/3 opacity-70">AGE / HEIGHT</span>
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
              <div className="flex pt-1 mt-auto">
                <span className="w-1/3 opacity-70">THREAT LEVEL</span>
                <span className="flex-1 text-right tracking-[0.2em] text-(--danger)">★★★</span>
              </div>
            </div>

            {/* RADAR / SENSOR WAVE SVG */}
            <div className="sci-border h-24 p-2 relative overflow-hidden flex flex-col justify-between">
              <span className="font-mono text-[8px] opacity-70 absolute top-1 left-2">BIO-RHYTHM SENSOR</span>
              <svg className="w-full h-full opacity-80" viewBox="0 0 200 50" preserveAspectRatio="none">
                {/* Cuadrícula interna SVG */}
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3"/>
                </pattern>
                <rect width="200" height="50" fill="url(#grid)" />
                {/* Onda senoidal estática (se puede CSS animar si se desea, pero el usuario pidió estático) */}
                <path d="M0,25 Q12.5,5 25,25 T50,25 T75,25 T100,25 T125,25 T150,25 T175,25 T200,25" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Segunda onda desfasada */}
                <path d="M0,25 Q20,40 40,25 T80,25 T120,25 T160,25 T200,25" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
              </svg>
            </div>
            
          </div>
        </div>

        {/* BOTTOM RAW DATA BLOCK */}
        <div className="w-full sci-border p-2 mt-2 bg-(--glow)/5 overflow-hidden">
           <p className="font-mono text-[8px] md:text-[10px] leading-tight text-(--glow) opacity-60 break-all">
             48 65 78 20 64 61 74 61 20 64 75 6d 70 2e 20 53 79 73 74 65 6d 20 6c 6f 63 6b 65 64 2e 0a 41 6e 6f 6d 61 6c 79 20 64 65 74 65 63 74 65 64 2e 0a 49 6e 69 74 69 61 6c 69 7a 69 6e 67 20 54 4d 41 20 70 72 6f 74 6f 63 6f 6c 73 2e 2e 2e 20 5b 4f 4b 5d 0a 42 69 6f 6d 65 74 72 69 63 73 20 73 79 6e 63 20 63 6f 6d 70 6c 65 74 65 2e 0a 41 77 61 69 74 69 6e 67 20 6f 70 65 72 61 74 6f 72 20 69 6e 70 75 74 2e
           </p>
        </div>

      </div>

      {/* ACCESS BUTTON */}
      <div className="pt-8 text-center flex flex-col items-center gap-4 w-full">
         <button className="px-10 py-3 bg-(--glow)/10 text-(--glow) font-mono text-xs tracking-widest uppercase border border-(--glow) hover:bg-(--glow) hover:text-black hover:shadow-[0_0_20px_var(--glow)] transition-all flex items-center gap-2">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
           Init System (Acceder)
         </button>
      </div>

    </div>
  );
}
