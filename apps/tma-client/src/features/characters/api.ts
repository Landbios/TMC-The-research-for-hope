import { createClient } from '@/lib/supabase/server';

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

export interface TMACharacterData {
  id: string;
  user_id: string;
  tmc_character_id?: string;
  tma_name?: string;
  image_url?: string;
  tma_title: string;
  tma_biography: string;
  created_at: string;
  // Campos anidados si se hace join con character_category general
  tmc_character?: CharacterData;
}

// Verifica si el usuario actual tiene un personaje de TMA vinculado (en la nueva tabla tma_characters)
export async function getTMACharacter(): Promise<TMACharacterData | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Hacemos full join con los datos base de TMC Vault en caso de existir vínculo
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

  if (error || !data) {
    return null;
  }

  return data as TMACharacterData;
}

// Trae todos los personajes que tiene creados el usuario en TMC Vault general
export async function getVaultCharacters(): Promise<CharacterData[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('characters')
    .select('id, name, image_url, character_category, age, height, nationality, created_at')
    .eq('user_id', user.id);

  if (error || !data) {
    return [];
  }

  return data as CharacterData[];
}
