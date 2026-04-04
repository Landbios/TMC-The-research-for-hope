'use client';

import { useTmaStore } from '@/store/useTmaStore';

export function DashboardHudStats() {
  const investigationPoints = useTmaStore(state => state.investigationPoints);
  const murderPoints = useTmaStore(state => state.murderPoints);
  const characterStatus = useTmaStore(state => state.characterStatus);
  const userRole = useTmaStore(state => state.userRole);

  const getStatusStyle = () => {
    switch(characterStatus) {
      case 'DEAD': return 'text-red-500 line-through tracking-[0.3em] font-bold';
      case 'MISSING': return 'text-amber-500 opacity-50 tracking-[0.2em]';
      case 'GUILTY': return 'text-purple-500 tracking-[0.2em] font-bold';
      default: return 'text-green-400 tracking-[0.2em]';
    }
  };

  const showMurderPoints = murderPoints > 0 || userRole === 'staff' || userRole === 'superadmin';

  return (
    <div className="flex flex-col gap-1 mt-2">
      <div className="flex border-b border-(--glow)/30 pb-1 pt-2">
        <span className="w-1/3 opacity-70">INV. POINTS</span>
        <span className="flex-1 text-right text-(--glow) font-bold text-base bg-(--glow)/10 px-1 border border-(--glow)/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
          [{investigationPoints}]
        </span>
      </div>

      {showMurderPoints && (
        <div className="flex border-b border-red-500/30 pb-1 pt-2 animate-in slide-in-from-right duration-500">
          <span className="w-1/3 text-red-500 font-bold opacity-80 uppercase tracking-tighter">MURDER PTS</span>
          <span className="flex-1 text-right text-red-500 font-bold text-base bg-red-500/10 px-1 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            [{murderPoints}]
          </span>
        </div>
      )}

      <div className="flex pt-1 mt-auto">
        <span className="w-1/3 opacity-70 uppercase tracking-tighter">VITAL STATE</span>
        <span className={`flex-1 text-right ${getStatusStyle()}`}>
          {characterStatus}
        </span>
      </div>
    </div>
  );
}

