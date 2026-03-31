-- MIGRACIÓN DE TMA v2.0 - REGLAS DEL JUEGO DANGANRONPA

-- 1. TIPOS ENUMERADOS
CREATE TYPE public.tma_character_status AS ENUM ('ALIVE', 'DEAD', 'MISSING', 'GUILTY');
CREATE TYPE public.tma_game_period AS ENUM ('FREE_TIME', 'INVESTIGATION', 'NIGHTTIME');

-- 2. TABLA GLOBAL DEL JUEGO (SINGLETON)
CREATE TABLE IF NOT EXISTS public.tma_game_state (
  id integer PRIMARY KEY DEFAULT 1,
  current_period public.tma_game_period NOT NULL DEFAULT 'FREE_TIME',
  current_motive text,
  body_discovery_active boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT enforce_singleton CHECK (id = 1)
);

-- Insertar el estado inicial
INSERT INTO public.tma_game_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 3. SALAS DE LA ACADEMIA
CREATE TABLE IF NOT EXISTS public.tma_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  background_url text, -- Para el visor 3D en el futuro
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT tma_rooms_pkey PRIMARY KEY (id)
);

-- 4. PUNTOS DE INTERÉS / PISTAS (EVIDENCIAS)
CREATE TABLE IF NOT EXISTS public.tma_evidences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.tma_rooms(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  investigation_cost integer NOT NULL DEFAULT 1,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT tma_evidences_pkey PRIMARY KEY (id)
);

-- 5. ACTUALIZAR TMA CHARACTERS (Añadir reglas del juego)
ALTER TABLE public.tma_characters 
  ADD COLUMN IF NOT EXISTS investigation_points integer NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS status public.tma_character_status NOT NULL DEFAULT 'ALIVE',
  ADD COLUMN IF NOT EXISTS current_room_id uuid REFERENCES public.tma_rooms(id) ON DELETE SET NULL;

-- 6. POLÍTICAS DE SEGURIDAD (RLS)

-- Game State: Todos pueden leer, sólo Admins podrían editar (por ahora permitiremos lectura pública para los clientes)
ALTER TABLE public.tma_game_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura global del estado del juego"
  ON public.tma_game_state FOR SELECT
  USING (true);

-- Rooms: Lectura global
ALTER TABLE public.tma_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Estudiantes pueden ver las salas"
  ON public.tma_rooms FOR SELECT
  USING (true);

-- Evidences: Lectura global (el cliente filtrará las `is_hidden` si no las ha descubierto)
ALTER TABLE public.tma_evidences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Estudiantes pueden ver las evidencias públicas"
  ON public.tma_evidences FOR SELECT
  USING (true); 
