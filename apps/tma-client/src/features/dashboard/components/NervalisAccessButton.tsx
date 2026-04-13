'use client';

import { useTmaStore } from '@/store/useTmaStore';

export function NervalisAccessButton() {
  const toggleNervalis = useTmaStore(state => state.toggleNervalis);
  const hasUnreadSignals = useTmaStore(state => state.hasUnreadSignals);

  return (
    <button 
      onClick={() => toggleNervalis(true)}
      className="relative px-10 py-3 bg-(--glow)/10 text-(--glow) font-mono text-xs tracking-widest uppercase border border-(--glow) hover:bg-(--glow) hover:text-black hover:shadow-[0_0_20px_var(--glow)] transition-all flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
      </svg>
      Acceso Terminal Nervalis
      {hasUnreadSignals && <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full animate-ping" />}
      {hasUnreadSignals && <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full" />}
    </button>
  );
}
