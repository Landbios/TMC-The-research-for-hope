import fs from 'fs';

const filePath = 'c:/Users/opbvn/Desktop/Wira/Programacion/TMC-The-research-for-hope/apps/tma-client/src/features/dashboard/components/NervalisOverlay.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add search filter
const searchHeader = /<div className="flex-1 overflow-y-auto custom-scrollbar pr-1">/m;
const searchInject = `                            <div className="relative mb-2 shrink-0">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500/50" size={14} />
                               <input 
                                 type="text"
                                 placeholder="BUSCAR_SUJETO..."
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                                 className="w-full bg-black/40 border border-blue-500/20 py-2 pl-9 pr-4 font-mono text-[10px] text-blue-400 focus:outline-hidden focus:border-blue-500/60 transition-colors uppercase"
                               />
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">`;
content = content.replace(searchHeader, searchInject);

// 2. Filter students map
const studentMap = /\{students\.map\(student => \(/g;
const studentFilter = `{students.filter(s => 
                                       (s.tmc_character?.name || s.tma_name || '').toUpperCase().includes(searchQuery.toUpperCase()) ||
                                       (s.tma_title || '').toUpperCase().includes(searchQuery.toUpperCase())
                                    ).map(student => (`;
content = content.replace(studentMap, studentFilter);

// 3. Expand metadata
const metadataEnd = /<div className="text-zinc-500">Energía: <span className="text-zinc-300">\{selectedStudent\.investigation_points\} IP<\/span><\/div>\s+<\/div>/m;
const metadataInject = `<div className="text-zinc-500">Energía: <span className="text-zinc-300">{selectedStudent.investigation_points} IP</span></div>
                                          </div>

                                          {selectedStudent.tmc_character && (
                                             <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[7px] border-t border-blue-500/10 pt-2 uppercase">
                                                <div className="text-zinc-500">Edad: <span className="text-zinc-300">{selectedStudent.tmc_character.age || '??'}</span></div>
                                                <div className="text-zinc-500">Altura: <span className="text-zinc-300">{selectedStudent.tmc_character.height || '??'}</span></div>
                                                <div className="text-zinc-500">Origen: <span className="text-zinc-300 truncate">{selectedStudent.tmc_character.nationality || 'DESCONOCIDO'}</span></div>
                                             </div>
                                          )}`;
content = content.replace(metadataEnd, metadataInject);

// 4. StudentCard badges
const studentStatus = /<div className={`text-\[6px\] px-1 inline-block uppercase font-bold \$\{student\.status === 'ALIVE' \? 'text-green-500' : 'text-red-500'\}\`}>\s+\{student\.status\}\s+<\/div>/m;
const studentBadgeInject = `<div className={\`text-[6px] px-1 inline-block uppercase font-bold \${student.status === 'ALIVE' ? 'text-green-500' : 'text-red-500'}\`}>
            {student.status}
         </div>
         <div className={\`text-[6px] ml-2 px-1 inline-block uppercase font-bold border \${student.is_npc ? 'border-zinc-700 text-zinc-500' : 'border-blue-500/30 text-blue-400'}\`}>
            {student.is_npc ? 'NPC' : 'USER'}
         </div>`;
content = content.replace(studentStatus, studentBadgeInject);

fs.writeFileSync(filePath, content);
console.log('Update complete');
