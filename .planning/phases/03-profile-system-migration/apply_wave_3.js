import fs from 'fs';

const filePath = 'c:/Users/opbvn/Desktop/Wira/Programacion/TMC-The-research-for-hope/apps/tma-client/src/features/dashboard/components/NervalisOverlay.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add confirmingPossession state
const stateSection = /const \[selectedStudent, setSelectedStudent\] = useState<TMACharacterData \| null>\(null\);/m;
content = content.replace(stateSection, `const [selectedStudent, setSelectedStudent] = useState<TMACharacterData | null>(null);
  const [confirmingPossession, setConfirmingPossession] = useState<string | null>(null);`);

// 2. Possession Overhaul
const possessionButton = /<button \s+onClick=\{\(\) => \{\s+useTmaStore\.getState\(\)\.setPossession\(selectedStudent\);\s+toast\.success\(`POSESIÓN NEURAL: \$\{selectedStudent\.tma_name\}`\);\s+\}\}\s+className="mt-3 w-full py-1 bg-red-500\/20 border border-red-500 text-red-500 text-\[9px\] uppercase hover:bg-red-500 hover:text-black transition-colors"\s+>\s+Inyectar Posesión\s+<\/button>/m;

const possessionReplacement = `<button 
                                                onClick={() => {
                                                  if (confirmingPossession === selectedStudent.id) {
                                                    useTmaStore.getState().setPossession(selectedStudent);
                                                    toast.success(\`[OVERWRITE_SUCCESS]: Control total de \${selectedStudent.tma_name} establecido.\`);
                                                    setConfirmingPossession(null);
                                                  } else {
                                                    setConfirmingPossession(selectedStudent.id);
                                                    setTimeout(() => setConfirmingPossession(null), 3000);
                                                  }
                                                }}
                                                className={\`mt-3 w-full py-1 border transition-all duration-300 font-bold text-[9px] uppercase \${
                                                  confirmingPossession === selectedStudent.id 
                                                    ? 'bg-red-600 border-white text-white animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.5)] scale-105' 
                                                    : 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/40'
                                                }\`}
                                             >
                                                {confirmingPossession === selectedStudent.id 
                                                  ? '¿CONFIRMAR_SOBREESCRITURA?' 
                                                  : 'EJECUTAR_SOBREESCRITURA_NEURAL'}
                                             </button>`;

content = content.replace(possessionButton, possessionReplacement);

fs.writeFileSync(filePath, content);
console.log('Update complete');
