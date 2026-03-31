-- TMA Migrations V1: Adaptación de TMC Character Vault y S.C.I.O.N para The Murder Academy

-- 1. Ampliar la tabla de personajes para incluir campos exclusivos de TMA
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS tma_title text,
  ADD COLUMN IF NOT EXISTS tma_biography text;

-- 2. Añadir el nuevo tipo de rol a la tabla de chatrooms (S.C.I.O.N)
-- Nota: Supabase / PostgreSQL requiere agregar el valor al ENUM existente `roleplay_mode`.
ALTER TYPE public.roleplay_mode ADD VALUE IF NOT EXISTS 'tma_murder_game';
