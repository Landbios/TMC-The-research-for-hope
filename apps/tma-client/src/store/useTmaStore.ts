import { create } from 'zustand';
import { TMAGamePeriod, TMAGameState, TMACharacterData } from '@/features/characters/api';

interface TmaStoreState {
  // Global Game State
  gamePeriod: TMAGamePeriod;
  motive: string | null;
  isBodyDiscoveryActive: boolean;
  
  // Local Player Context
  investigationPoints: number;
  characterStatus: 'ALIVE' | 'DEAD' | 'MISSING' | 'GUILTY';
  
  // Actions
  setGameState: (state: TMAGameState) => void;
  setCharacterData: (char: TMACharacterData) => void;
  spendInvestigationPoints: (cost: number) => void;
}

export const useTmaStore = create<TmaStoreState>((set) => ({
  gamePeriod: 'FREE_TIME',
  motive: null,
  isBodyDiscoveryActive: false,
  investigationPoints: 7,
  characterStatus: 'ALIVE',
  
  setGameState: (state) => set({
    gamePeriod: state.current_period,
    motive: state.current_motive,
    isBodyDiscoveryActive: state.body_discovery_active,
  }),
  
  setCharacterData: (char) => set({
    investigationPoints: char.investigation_points ?? 7,
    characterStatus: char.status ?? 'ALIVE',
  }),
  
  spendInvestigationPoints: (cost) => set((state) => ({
    investigationPoints: Math.max(0, state.investigationPoints - cost)
  }))
}));
