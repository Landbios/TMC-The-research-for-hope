import { createClient } from '@/lib/supabase/server';

export interface CharacterData {
  id: string;
  name: string;
  image_url: string;
  tma_title?: string;
  tma_biography?: string;
  character_category: string;
  age?: string;
  height?: string;
  nationality?: string;
  created_at?: string;
}

// Verifica si el usuario actual tiene un personaje de TMA vinculado
export async function getTMACharacter(): Promise<CharacterData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // En TMA la restricción es 1 personaje por usuario que tenga un título definitivo
  const { data, error } = await supabase
    .from('characters')
    .select('id, name, image_url, tma_title, tma_biography, character_category, age, height, nationality, created_at')
    .eq('user_id', user.id)
    .not('tma_title', 'is', null) // Si tiene title, asume que está vinculado a TMA
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data as CharacterData;
}

// Obtiene todos los personajes de The Vault de este jugador
export async function getVaultCharacters(): Promise<CharacterData[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('characters')
    .select('id, name, image_url, tma_title, tma_biography, character_category, age, height, nationality, created_at')
    .eq('user_id', user.id);

  if (error || !data) {
    return [];
  }

  return data as CharacterData[];
}
