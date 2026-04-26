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
  isAssassin: boolean;
  myCharacterId: string | null;
  originalCharacter: TMACharacterData | null;
  userRole: 'roleplayer' | 'staff' | 'superadmin';
  isStoreInitialized: boolean;
  isHidden: boolean;
  isPossessing: boolean;
  
  // Exploration & VN
  selectedRoomId: string | null;
  vnState: VNState;
  vnMode: 'WHISPER' | 'GROUP' | 'CLUE';
  vnWhispers: import('@/features/vn-ui/components/VNChatOverlay').VNChatMessage[];
  activeGroupMessages: import('@/features/vn-ui/components/VNChatOverlay').VNChatMessage[];
  activeClue: import('@/features/investigation/api').TMAEvidence | null;
  lastVnActivity: number;
  isNervalisOpen: boolean;
  hasUnreadSignals: boolean;
  terminalPosition: { x: number; y: number };
  refreshCluesTrigger: number;

  // Investigation & Privacy Polls
  pendingPolls: TMAEvidencePoll[];
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
  setVnGroupMessages: (messages: import('@/features/vn-ui/components/VNChatOverlay').VNChatMessage[]) => void;
  setActiveClue: (clue: import('@/features/investigation/api').TMAEvidence | null) => void;
  clearVnWhispers: () => void;
  clearVnGroupMessages: () => void;
  toggleNervalis: (open?: boolean) => void;
  setHasUnreadSignals: (val: boolean) => void;
  setTerminalPosition: (pos: { x: number; y: number }) => void;
  triggerClueRefresh: () => void;
  setUserRole: (role: 'roleplayer' | 'staff' | 'superadmin') => void;
  setPendingPolls: (polls: TMAEvidencePoll[] | ((prev: TMAEvidencePoll[]) => TMAEvidencePoll[])) => void;
  setActivePrivacyPoll: (poll: TMARoomPrivacyPoll | null) => void;
  setMyCharacterId: (id: string | null) => void;
  patchCharacterData: (patch: Partial<TMACharacterData>) => void;
  setOriginalCharacter: (char: TMACharacterData) => void;
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
  isAssassin: false,
  myCharacterId: null,
  originalCharacter: null,
  userRole: 'roleplayer',
  isStoreInitialized: false,
  isHidden: false,
  isPossessing: false,
  
  selectedRoomId: null,
  vnState: { isActive: false, speaker: null, text: null },
  vnMode: 'WHISPER',
  vnWhispers: [],
  activeGroupMessages: [],
  activeClue: null,
  lastVnActivity: Date.now(),
  isNervalisOpen: false,
  hasUnreadSignals: false,
  terminalPosition: { x: 0, y: 0 },
  refreshCluesTrigger: 0,
  pendingPolls: [],
  activePrivacyPoll: null,

  setGameState: (state) => set({
    gamePeriod: state.current_period,
    motive: state.current_motive,
    isBodyDiscoveryActive: state.body_discovery_active,
    isAssassinPollActive: state.assassin_poll_active,
  }),
  
  setCharacterData: (char) => set((state) => {
    const isActuallyNpc = char.is_npc === true;
    
    return {
      investigationPoints: char.investigation_points ?? 7,
      murderPoints: char.murder_points ?? 0,
      characterStatus: char.status ?? 'ALIVE',
      isAssassin: char.is_assassin ?? false,
      myCharacterId: char.id,
      isHidden: char.is_hidden ?? false,
      // Solo guardamos como original si es un PC (Jugador)
      originalCharacter: !isActuallyNpc ? char : state.originalCharacter,
    };
  }),

  setOriginalCharacter: (char) => set({ originalCharacter: char }),
  patchCharacterData: (patch) => set((state) => {
     const isHidden = patch.is_hidden !== undefined ? patch.is_hidden : state.isHidden;
     const isAssassin = patch.is_assassin !== undefined ? patch.is_assassin : state.isAssassin;
     const status = patch.status !== undefined ? patch.status : state.characterStatus;
     
     return {
        isHidden,
        isAssassin,
        characterStatus: status as 'ALIVE' | 'DEAD' | 'MISSING' | 'GUILTY',
        investigationPoints: patch.investigation_points !== undefined ? patch.investigation_points : state.investigationPoints,
        murderPoints: patch.murder_points !== undefined ? patch.murder_points : state.murderPoints,
     };
  }),

  setPossession: (char) => {
    if (char) {
      localStorage.setItem('tma_possessed_id', char.id);
      set({ 
        myCharacterId: char.id,
        investigationPoints: char.investigation_points ?? 7,
        murderPoints: char.murder_points ?? 0,
        characterStatus: char.status ?? 'ALIVE',
        isAssassin: char.is_assassin ?? false,
        isPossessing: true,
      });
    } else {
      localStorage.removeItem('tma_possessed_id');
      set((state) => {
        const target = state.originalCharacter;
        if (!target) {
          console.error('TMA_STORE: No hay personaje original para restaurar.');
          return state;
        }
        return {
          myCharacterId: target.id,
          investigationPoints: target.investigation_points ?? 7,
          murderPoints: target.murder_points ?? 0,
          characterStatus: target.status ?? 'ALIVE',
          isAssassin: target.is_assassin ?? false,
          isPossessing: false,
        };
      });
    }
  },
  
  spendInvestigationPoints: (cost) => set((state) => {
    const newPoints = Math.max(0, state.investigationPoints - cost);
    // Logic for global announcement would ideally be triggered here
    // but we'll handle the UI reaction in a component observing this value
    return { investigationPoints: newPoints };
  }),

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
  setVnGroupMessages: (messages) => set({ 
    activeGroupMessages: messages,
    lastVnActivity: Date.now()
  }),
  setActiveClue: (clue) => set({ 
    activeClue: clue,
    vnMode: clue ? 'CLUE' : 'WHISPER', // Default to WHISPER if clue is cleared
    lastVnActivity: Date.now()
  }),
  clearVnWhispers: () => set({ vnWhispers: [] }),
  clearVnGroupMessages: () => set({ activeGroupMessages: [] }),
  toggleNervalis: (open) => set((state) => {
    const newState = open ?? !state.isNervalisOpen;
    return { 
      isNervalisOpen: newState,
      // Auto-clear unread signals when opening Nervalis
      hasUnreadSignals: newState ? false : state.hasUnreadSignals
    };
  }),
  setHasUnreadSignals: (val) => set({ hasUnreadSignals: val }),
  setTerminalPosition: (pos) => set({ terminalPosition: pos }),
  triggerClueRefresh: () => set((state) => ({ refreshCluesTrigger: state.refreshCluesTrigger + 1 })),
  setUserRole: (role) => set({ userRole: role }),
  setPendingPolls: (updater) => set((state) => ({ 
    pendingPolls: typeof updater === 'function' ? updater(state.pendingPolls) : updater 
  })),
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
      isAssassin: false,
      selectedRoomId: null,
      isStoreInitialized: false
    });
  }
}));
