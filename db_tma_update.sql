-- =========== MIGRACIÓN SPRINT 5: TMA ENGINE ===========
-- INSTRUCCIONES: Ejecutar este código directamente en tu Editor SQL de Supabase.

-- 1. Actualización de tma_characters (Añadimos parámetros visuales para S.C.I.O.N)
ALTER TABLE public.tma_characters
ADD COLUMN IF NOT EXISTS sprite_idle_url text,      -- Sprite del Render 3D (Billboard genérico o id del personaje)
ADD COLUMN IF NOT EXISTS sprite_expressions jsonb,  -- Diccionario de expresiones para Visual Novel 2D
ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false; -- Controla si C sacó una tirada perfecta de sigilo

-- 2. Creación de tma_messages (Aislamos el Chat del rol genérico)
CREATE TABLE IF NOT EXISTS public.tma_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tma_room_id uuid NOT NULL REFERENCES public.tma_rooms(id) ON DELETE CASCADE,
  sender_tma_id uuid NOT NULL REFERENCES public.tma_characters(id),
  target_tma_id uuid REFERENCES public.tma_characters(id), -- Null = Mensaje Global de Sala / UUID = Susurro Privado (Secret Chat)
  content text NOT NULL,
  is_whisper boolean DEFAULT false,
  is_system_message boolean DEFAULT false, -- True cuando el mensaje es "Notaste a C espiando"
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar Políticas simples de Realtime para las tablas afectadas
-- Activamos la publicación para nuestro Chat (Mensajes) y Estado de Jugadores
alter publication supabase_realtime add table public.tma_messages;
alter publication supabase_realtime add table public.tma_characters;

-- 3. Scripts de Semilla: Creación de Salas Danganronpa Oficiales
-- Esto nos asegurará que tengamos los UUID listos para el Mapa Cenital
INSERT INTO public.tma_rooms (name, description)
VALUES 
  ('Lobby Principal', 'El corazón del Nervalis. Amplio y vigilado.'),
  ('Baños', '¿Sanitarios sin salida? Huele a lavandina.'),
  ('Cafetería', 'Las sillas de metal y las mesas largas adornan la escena. Punto ideal de reunión.'),
  ('Habitaciones', 'Pasillos silenciosos. Nadie puede cruzar tu puerta si no tiene llave.'),
  ('Capilla', 'Suntuosa e irónica. Las campanas de desesperación suenan aquí.')
ON CONFLICT DO NOTHING; -- No duplicar si ya existen

-- 4. Actualización de tma_evidences (Añadimos coordenadas para el Motor 3D)
ALTER TABLE public.tma_evidences
ADD COLUMN IF NOT EXISTS pos_x numeric DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS pos_y numeric DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS pos_z numeric DEFAULT 0.0;
