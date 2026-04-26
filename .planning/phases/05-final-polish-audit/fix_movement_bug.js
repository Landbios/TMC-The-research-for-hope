import fs from 'fs';

const storePath = 'c:/Users/opbvn/Desktop/Wira/Programacion/TMC-The-research-for-hope/apps/tma-client/src/store/useTmaStore.ts';
let storeContent = fs.readFileSync(storePath, 'utf8');

// 1. Add setOriginalCharacter to Interface
storeContent = storeContent.replace('patchCharacterData: (patch: Partial<TMACharacterData>) => void;', 'patchCharacterData: (patch: Partial<TMACharacterData>) => void;\n  setOriginalCharacter: (char: TMACharacterData) => void;');

// 2. Add setOriginalCharacter Implementation
storeContent = storeContent.replace('patchCharacterData: (patch) => set((state) => {', 'setOriginalCharacter: (char) => set({ originalCharacter: char }),\n  patchCharacterData: (patch) => set((state) => {');

fs.writeFileSync(storePath, storeContent);

// 3. Update TmaStoreInitializer
const initPath = 'c:/Users/opbvn/Desktop/Wira/Programacion/TMC-The-research-for-hope/apps/tma-client/src/components/TmaStoreInitializer.tsx';
let initContent = fs.readFileSync(initPath, 'utf8');

const newEffect = `  useEffect(() => {
    if (!initialized.current) {
      const store = useTmaStore.getState();
      
      if (gameState) {
        store.setGameState(gameState);
      }
      
      const setupPossession = async () => {
        const possessedId = typeof window !== 'undefined' ? localStorage.getItem('tma_possessed_id') : null;
        
        if (character) {
          // Guardamos siempre el original sin cambiar el ID activo aún
          store.setOriginalCharacter(character);
          
          if (!character.is_npc) {
             // Si hay posesión y somos staff, priorizamos al NPC
             if (possessedId && possessedId !== character.id && (userRole === 'staff' || userRole === 'superadmin')) {
               const npc = await getTmaCharacterById(possessedId);
               if (npc) {
                  store.setPossession(npc);
               } else {
                  store.setCharacterData(character);
               }
             } else {
               // Si no hay posesión, el original es el activo
               store.setCharacterData(character);
             }
          } else {
             // Si el personaje inicial ES un NPC, necesitamos buscar el original real
             const pc = await getTMACharacter();
             if (pc) store.setOriginalCharacter(pc);
             store.setPossession(character);
          }
        }

        if (userRole) {
          store.setUserRole(userRole);
        }
        
        store.setStoreInitialized(true);
      };

      setupPossession();
      initialized.current = true;
    }
  }, [gameState, character, userRole]);`;

initContent = initContent.replace(/useEffect\(\(\) => \{[\s\S]+?\}, \[gameState, character, userRole\]\);/, newEffect);

fs.writeFileSync(initPath, initContent);
console.log('Update complete');
