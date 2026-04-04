import { getTMACharacterServer as getTMACharacter, getGameStateServer as getGameState, getUserProfileServer as getUserProfile } from '@/features/characters/server-api';
import { redirect } from 'next/navigation';
import { RoomPageClient } from './RoomPageClient';

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const character = await getTMACharacter();
  const gameState = await getGameState();
  const profile = await getUserProfile();

  if (!character) {
    redirect('/dashboard/enroll');
  }

  return (
    <RoomPageClient 
      roomId={roomId}
      character={character}
      gameState={gameState}
      userRole={profile?.role as 'roleplayer' | 'staff' | 'superadmin'}
    />
  );
}
