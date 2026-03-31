-- MIGRACIÓN DE TMA v1.1 - DESACOPLAMIENTO DE LA BASE CENTRAL "VAULT"

-- 1. LIMPIEZA: Remover cualquier columna TMA inyectada previamente en la tabla del Vault.
-- Si ejecutaste el script anterior, esto limpiará tu tabla principal y la dejará inalterada y pura.
ALTER TABLE public.characters
  DROP COLUMN IF EXISTS tma_title,
  DROP COLUMN IF EXISTS tma_biography;

-- 2. CREACIÓN DE LA TABLA EXCLUSIVA DE TMA
CREATE TABLE IF NOT EXISTS public.tma_characters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  
  -- Si está vinculado a un personaje del Vault (TMC), se usa esta llave foránea:
  tmc_character_id uuid REFERENCES public.characters(id) ON DELETE SET NULL,
  
  -- Si NO está vinculado (fue creado directamente desde TMA), se usan estos valores nativos:
  tma_name text,
  image_url text,
  
  -- Valores obligatorios para que exista legalmente en la Academia interactiva:
  tma_title text NOT NULL,
  tma_biography text NOT NULL,
  
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT tma_characters_pkey PRIMARY KEY (id),
  CONSTRAINT tma_characters_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. HABILITACIÓN DE RLS PARA TMA CHARACTERS
ALTER TABLE public.tma_characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propios personajes de TMA"
  ON public.tma_characters
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propios personajes en TMA"
  ON public.tma_characters
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios personajes en TMA"
  ON public.tma_characters
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden borrar sus propios personajes en TMA"
  ON public.tma_characters
  FOR DELETE
  USING (auth.uid() = user_id);


