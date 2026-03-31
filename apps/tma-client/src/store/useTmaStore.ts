import { create } from 'zustand';
import { TMAGamePeriod, TMAGameState, TMACharacterData } from '@/features/characters/api';

interface VNState {
  isActive: boolean;
  speaker: string | null;
  text: string | null;
}

interface TmaStoreState {
  // Global Game State
  gamePeriod: TMAGamePeriod;
  motive: string | null;
  isBodyDiscoveryActive: boolean;
  
  // Local Player Context
  investigationPoints: number;
  characterStatus: 'ALIVE' | 'DEAD' | 'MISSING' | 'GUILTY';
  myCharacterId: string | null;
  
  // Exploration & VN
  selectedRoomId: string | null;
  vnState: VNState;

  // Actions
  setGameState: (state: TMAGameState) => void;
  setCharacterData: (char: TMACharacterData) => void;
  spendInvestigationPoints: (cost: number) => void;
  setSelectedRoomId: (id: string | null) => void;
  setVnState: (state: Partial<VNState>) => void;
}

export const useTmaStore = create<TmaStoreState>((set) => ({
  gamePeriod: 'FREE_TIME',
  motive: null,
  isBodyDiscoveryActive: false,
  investigationPoints: 7,
  characterStatus: 'ALIVE',
  myCharacterId: null,
  
  selectedRoomId: null,
  vnState: { isActive: false, speaker: null, text: null },
  
  setGameState: (state) => set({
    gamePeriod: state.current_period,
    motive: state.current_motive,
    isBodyDiscoveryActive: state.body_discovery_active,
  }),
  
  setCharacterData: (char) => set({
    investigationPoints: char.investigation_points ?? 7,
    characterStatus: char.status ?? 'ALIVE',
    myCharacterId: char.id,
  }),
  
  spendInvestigationPoints: (cost) => set((state) => ({
    investigationPoints: Math.max(0, state.investigationPoints - cost)
  })),

  setSelectedRoomId: (id) => set({ selectedRoomId: id }),
  setVnState: (patch) => set((state) => ({ vnState: { ...state.vnState, ...patch } }))
}));
