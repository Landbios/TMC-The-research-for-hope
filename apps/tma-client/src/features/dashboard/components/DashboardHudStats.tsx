'use client';

import { useTmaStore } from '@/store/useTmaStore';

export function DashboardHudStats() {
  const investigationPoints = useTmaStore(state => state.investigationPoints);
  const characterStatus = useTmaStore(state => state.characterStatus);

  const getStatusStyle = () => {
    switch(characterStatus) {
      case 'DEAD': return 'text-red-500 line-through tracking-[0.3em] font-bold';
      case 'MISSING': return 'text-amber-500 opacity-50 tracking-[0.2em]';
      case 'GUILTY': return 'text-purple-500 tracking-[0.2em] font-bold';
      default: return 'text-green-400 tracking-[0.2em]';
    }
  };

  return (
    <>
      <div className="flex border-b border-(--glow)/30 pb-1 mt-2 pt-2">
        <span className="w-1/3 opacity-70">INV. POINTS</span>
        <span className="flex-1 text-right text-(--glow) font-bold text-base bg-(--glow)/10 px-1 border border-(--glow)/50">
          [{investigationPoints}]
        </span>
      </div>
      <div className="flex pt-1 mt-auto">
        <span className="w-1/3 opacity-70">VITAL STATE</span>
        <span className={`flex-1 text-right ${getStatusStyle()}`}>
          {characterStatus}
        </span>
      </div>
    </>
  );
}
