import { create } from 'zustand';
import { TMAGamePeriod, TMAGameState, TMACharacterData } from '@/features/characters/api';
import type { TMAEvidencePoll } from '@/features/investigation/api';

export interface TMARoomPrivacyPoll {
  id: string;
  room_id: string;
  initiator_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  yes_count: number;
  no_count: number;
  total_voters: number;
  expires_at: string;
  created_at: string;
}

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
  isAssassinPollActive: boolean;
  
  // Local Player Context
  investigationPoints: number;
  murderPoints: number;
  characterStatus: 'ALIVE' | 'DEAD' | 'MISSING' | 'GUILTY';
  myCharacterId: string | null;
  originalCharacter: TMACharacterData | null;
  userRole: 'roleplayer' | 'staff' | 'superadmin';
  isStoreInitialized: boolean;
  
  // Exploration & VN
  selectedRoomId: string | null;
  vnState: VNState;
  vnMode: 'WHISPER' | 'GROUP' | 'CLUE';
  vnWhispers: import('@/features/vn-ui/components/VNChatOverlay').VNChatMessage[];
  activeGroupMessages: import('@/features/vn-ui/components/VNChatOverlay').VNChatMessage[];
  activeClue: import('@/features/investigation/api').TMAEvidence | null;
  lastVnActivity: number;
  isNervalisOpen: boolean;

  // Investigation & Privacy Polls
  activePoll: TMAEvidencePoll | null;
  activePrivacyPoll: TMARoomPrivacyPoll | null;

  // Actions
  setGameState: (state: TMAGameState) => void;
  setCharacterData: (char: TMACharacterData) => void;
  setPossession: (char: TMACharacterData | null) => void;
  spendInvestigationPoints: (cost: number) => void;
  setSelectedRoomId: (id: string | null) => void;
  setVnState: (state: Partial<VNState>) => void;
  setVnMode: (mode: 'WHISPER' | 'GROUP' | 'CLUE') => void;
  addVnWhisper: (msg: import('@/features/vn-ui/components/VNChatOverlay').VNChatMessage) => void;
  addVnGroupMessage: (msg: import('@/features/vn-ui/components/VNChatOverlay').VNChatMessage) => void;
  setActiveClue: (clue: import('@/features/investigation/api').TMAEvidence | null) => void;
  clearVnWhispers: () => void;
  clearVnGroupMessages: () => void;
  toggleNervalis: (open?: boolean) => void;
  setUserRole: (role: 'roleplayer' | 'staff' | 'superadmin') => void;
  setActivePoll: (poll: TMAEvidencePoll | null) => void;
  setActivePrivacyPoll: (poll: TMARoomPrivacyPoll | null) => void;
  setMyCharacterId: (id: string | null) => void;
  setStoreInitialized: (initialized: boolean) => void;
  resetToInitial: () => void;
}

export const useTmaStore = create<TmaStoreState>((set) => ({
  gamePeriod: 'FREE_TIME',
  motive: null,
  isBodyDiscoveryActive: false,
  isAssassinPollActive: false,
  investigationPoints: 7,
  murderPoints: 0,
  characterStatus: 'ALIVE',
  myCharacterId: null,
  originalCharacter: null,
  userRole: 'roleplayer',
  isStoreInitialized: false,
  
  selectedRoomId: null,
  vnState: { isActive: false, speaker: null, text: null },
  vnMode: 'WHISPER',
  vnWhispers: [],
  activeGroupMessages: [],
  activeClue: null,
  lastVnActivity: Date.now(),
  isNervalisOpen: false,
  activePoll: null,
  activePrivacyPoll: null,

  setGameState: (state) => set({
    gamePeriod: state.current_period,
    motive: state.current_motive,
    isBodyDiscoveryActive: state.body_discovery_active,
    isAssassinPollActive: state.assassin_poll_active,
  }),
  
  setCharacterData: (char) => set((state) => ({
    investigationPoints: char.investigation_points ?? 7,
    murderPoints: char.murder_points ?? 0,
    characterStatus: char.status ?? 'ALIVE',
    myCharacterId: char.id,
    originalCharacter: state.originalCharacter || char, // Persist the first one
  })),

  setPossession: (char) => {
    if (char) {
      localStorage.setItem('tma_possessed_id', char.id);
      set({ 
        myCharacterId: char.id,
        investigationPoints: char.investigation_points ?? 7,
        murderPoints: char.murder_points ?? 0,
        characterStatus: char.status ?? 'ALIVE',
      });
    } else {
      localStorage.removeItem('tma_possessed_id');
      set((state) => ({
        myCharacterId: state.originalCharacter?.id || null,
        investigationPoints: state.originalCharacter?.investigation_points ?? 7,
        murderPoints: state.originalCharacter?.murder_points ?? 0,
        characterStatus: state.originalCharacter?.status ?? 'ALIVE',
      }));
    }
  },
  
  spendInvestigationPoints: (cost) => set((state) => ({
    investigationPoints: Math.max(0, state.investigationPoints - cost)
  })),

  setSelectedRoomId: (id) => set({ selectedRoomId: id }),
  setVnState: (patch) => set((state) => ({ 
    vnState: { ...state.vnState, ...patch },
    lastVnActivity: Date.now()
  })),
  setVnMode: (mode) => set({ vnMode: mode, lastVnActivity: Date.now() }),
  addVnWhisper: (msg) => set((state) => ({ 
    vnWhispers: [...state.vnWhispers, msg],
    lastVnActivity: Date.now()
  })),
  addVnGroupMessage: (msg) => set((state) => ({ 
    activeGroupMessages: [...state.activeGroupMessages, msg],
    lastVnActivity: Date.now()
  })),
  setActiveClue: (clue) => set({ 
    activeClue: clue,
    vnMode: clue ? 'CLUE' : 'WHISPER', // Default to WHISPER if clue is cleared
    lastVnActivity: Date.now()
  }),
  clearVnWhispers: () => set({ vnWhispers: [] }),
  clearVnGroupMessages: () => set({ activeGroupMessages: [] }),
  toggleNervalis: (open) => set((state) => ({ isNervalisOpen: open ?? !state.isNervalisOpen })),
  setUserRole: (role) => set({ userRole: role }),
  setActivePoll: (poll) => set({ activePoll: poll }),
  setActivePrivacyPoll: (poll) => set({ activePrivacyPoll: poll }),
  setMyCharacterId: (id) => set({ myCharacterId: id }),
  setStoreInitialized: (initialized) => set({ isStoreInitialized: initialized }),
  resetToInitial: () => {
    localStorage.removeItem('tma_possessed_id');
    set({ 
      myCharacterId: null, 
      originalCharacter: null,
      investigationPoints: 7, 
      murderPoints: 0, 
      characterStatus: 'ALIVE',
      selectedRoomId: null,
      isStoreInitialized: false
    });
  }
}));
