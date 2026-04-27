import { createClient } from '@/lib/supabase/server';
import { TMACharacterData, TMAProfile, TMAGameState, CharacterData } from './api';

// Verifica si el usuario actual tiene un personaje de TMA vinculado
export async function getTMACharacterServer(): Promise<TMACharacterData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('tma_characters')
    .select(`
      *,
      tmc_character:tmc_character_id (
        id, name, image_url, character_category, age, height, nationality, created_at
      )
    `)
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as TMACharacterData;
}

// Trae todos los personajes que tiene creados el usuario en TMC Vault (Server)
export async function getVaultCharactersServer(): Promise<CharacterData[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('characters')
    .select('id, name, image_url, character_category, age, height, nationality, created_at')
    .eq('user_id', user.id);

  if (error || !data) return [];
  return data as CharacterData[];
}

// Obtiene el estado global de la partida (Server version)
export async function getGameStateServer(): Promise<TMAGameState | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tma_game_state')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) return null;
  return data as TMAGameState;
}

// Obtiene el perfil del usuario actual (Server version)
export async function getUserProfileServer(): Promise<TMAProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;
  return data as TMAProfile;
}
