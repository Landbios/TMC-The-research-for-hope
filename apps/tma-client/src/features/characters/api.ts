import { createClient } from '@/lib/supabase/client';

export interface CharacterData {
  id: string;
  name: string;
  image_url?: string;
  character_category: string;
  age?: string;
  height?: string;
  nationality?: string;
  created_at?: string;
}

export interface TMAProfile {
  id: string;
  email: string | null;
  role: 'roleplayer' | 'staff' | 'superadmin';
  username: string | null;
  created_at: string;
}

export interface TMACharacterData {
  id: string;
  user_id: string;
  tma_name?: string;
  image_url?: string;
  sprite_idle_url?: string;
  tma_title: string;
  tma_biography: string;
  created_at: string;
  publicMessage?: string;
  
  // V2 Stats
  investigation_points: number;
  status: 'ALIVE' | 'DEAD' | 'MISSING' | 'GUILTY';
  current_room_id?: string;
  is_hidden?: boolean;
  is_volunteer: boolean | null;

  // Campos anidados si se hace join con character_category general
  tmc_character?: CharacterData;
}

export type TMAGamePeriod = 'FREE_TIME' | 'INVESTIGATION' | 'NIGHTTIME';

export interface TMAGameState {
  id: number;
  current_period: TMAGamePeriod;
  current_motive: string | null;
  body_discovery_active: boolean;
  assassin_poll_active: boolean;
  updated_at: string;
}

// Verifica si el usuario actual tiene un personaje de TMA vinculado
export async function getTMACharacter(): Promise<TMACharacterData | null> {
  const supabase = createClient();

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

// Trae todos los personajes que tiene creados el usuario en TMC Vault general
export async function getVaultCharacters(): Promise<CharacterData[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('characters')
    .select('id, name, image_url, character_category, age, height, nationality, created_at')
    .eq('user_id', user.id);

  if (error || !data) return [];
  return data as CharacterData[];
}

// Obtiene el estado global de la partida (Singleton)
export async function getGameState(): Promise<TMAGameState | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tma_game_state')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) return null;
  return data as TMAGameState;
}

// Obtiene el perfil del usuario actual (incluyendo el rol)
export async function getUserProfile(): Promise<TMAProfile | null> {
  const supabase = createClient();

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

// Obtiene todos los personajes de TMA (Solo para Admin)
export async function getAllTMACharacters(): Promise<TMACharacterData[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tma_characters')
    .select(`
      *,
      tmc_character:tmc_character_id (
        id, name, image_url, age, height, nationality
      )
    `)
    .order('tma_name', { ascending: true });

  if (error || !data) return [];
  return data as TMACharacterData[];
}

// Actualiza el estado global de la partida (Solo para Admin / Staff)
export async function updateGameState(updates: Partial<TMAGameState>): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('tma_game_state')
    .update(updates)
    .eq('id', 1);

  if (error) throw error;
}

// Actualiza el estado de voluntario para un personaje (Roleplayer)
export async function updateVolunteerStatus(characterId: string, is_volunteer: boolean): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('tma_characters')
    .update({ is_volunteer })
    .eq('id', characterId);

  if (error) throw error;
}
