import fs from 'fs';

const arenaPath = 'c:/Users/opbvn/Desktop/Wira/Programacion/TMC-The-research-for-hope/apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx';
let arenaContent = fs.readFileSync(arenaPath, 'utf8');

// Update listener to only accept updates if the poll is still pending or if it's our active one transitioning
const pollUpdateLogic = `.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tma_room_privacy_polls', filter: \`room_id=eq.\${roomId}\` }, (payload) => {
         const poll = payload.new as import('@/store/useTmaStore').TMARoomPrivacyPoll;
         const currentPoll = useTmaStore.getState().activePrivacyPoll;
         
         // Only update if it's our current active poll or if it's a new pending one
         if (mounted && (currentPoll?.id === poll.id || poll.status === 'PENDING')) {
            // If it was resolved, we set it but the modal will handle its own closing
            setActivePrivacyPoll(poll);
         }
      });`;

arenaContent = arenaContent.replace(/\.on\('postgres_changes', \{ event: 'UPDATE', schema: 'public', table: 'tma_room_privacy_polls'[\s\S]+?\}\);/, pollUpdateLogic);
fs.writeFileSync(arenaPath, arenaContent);

// Update Modal to close faster
const modalPath = 'c:/Users/opbvn/Desktop/Wira/Programacion/TMC-The-research-for-hope/apps/tma-client/src/features/exploration/components/PrivacyPollModal.tsx';
let modalContent = fs.readFileSync(modalPath, 'utf8');

modalContent = modalContent.replace('}, 2000);', '}, 800);'); // Reduced to 800ms
fs.writeFileSync(modalPath, modalContent);

console.log('Update complete');
