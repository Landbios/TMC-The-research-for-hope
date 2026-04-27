import fs from 'fs';

const filePath = 'c:/Users/opbvn/Desktop/Wira/Programacion/TMC-The-research-for-hope/apps/tma-client/src/features/dashboard/components/VerticalChatLog.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update State
const stateStart = /export function VerticalChatLog\(\) \{\s+const myCharacterId = useTmaStore\(state => state\.myCharacterId\);\s+const currentRoomId = '00000000-0000-0000-0000-000000000000';/m;
content = content.replace(stateStart, `export function VerticalChatLog() {
  const myCharacterId = useTmaStore(state => state.myCharacterId);
  const currentRoomIdStore = useTmaStore(state => state.currentRoomId);
  const [activeChannel, setActiveChannel] = useState<'GLOBAL' | 'LOCAL'>('GLOBAL');
  
  const currentRoomId = activeChannel === 'GLOBAL' 
    ? '00000000-0000-0000-0000-000000000000' 
    : currentRoomIdStore;`);

// 2. Add Channel Switcher UI
const switcherInject = `      {/* Channel Switcher */}
      <div className="flex gap-2 p-2 border-b border-blue-500/10 bg-black/20">
         <button 
           onClick={() => setActiveChannel('GLOBAL')}
           className={\`flex-1 py-1 font-mono text-[9px] uppercase tracking-widest border transition-all \${
             activeChannel === 'GLOBAL' 
               ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
               : 'bg-transparent border-zinc-800 text-zinc-600 hover:border-blue-500/30'
           }\`}
         >
           [RED_GLOBAL]
         </button>
         <button 
           onClick={() => setActiveChannel('LOCAL')}
           className={\`flex-1 py-1 font-mono text-[9px] uppercase tracking-widest border transition-all \${
             activeChannel === 'LOCAL' 
               ? 'bg-green-600/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
               : 'bg-transparent border-zinc-800 text-zinc-600 hover:border-green-500/30'
           }\`}
         >
           [SECTOR_LOCAL]
         </button>
      </div>

      {/* Messages Log */}`;
content = content.replace(/\{(\/\* Messages Log \*\/)\}/, switcherInject);

// 3. Dynamic Message Styling
const messageStyles = /bg-blue-600\/20 border border-blue-500\/30 text-blue-100 rounded-l-md rounded-br-sm/g;
const messageStylesReplacement = `\${activeChannel === 'GLOBAL' ? 'bg-blue-600/20 border-blue-500/30 text-blue-100' : 'bg-green-600/20 border-green-500/30 text-green-100'} rounded-l-md rounded-br-sm`;
content = content.replace(messageStyles, messageStylesReplacement);

// 4. Update Red Label at Bottom
const redLabel = /RED: GLOBAL_COMM/;
content = content.replace(redLabel, `RED: \${activeChannel === 'GLOBAL' ? 'GLOBAL_COMM' : 'SECTOR_LINK'}`);

const publicLabel = /ESTADO: PÚBLICO/;
content = content.replace(publicLabel, `ESTADO: \${activeChannel === 'GLOBAL' ? 'PÚBLICO' : 'ENCRIPTADO_SECTOR'}`);

fs.writeFileSync(filePath, content);
console.log('Update complete');
