-- =========== MIGRACIÓN DE CLUES Y CONSENSO GLOBAL ===========
-- 1. Extendemos tma_evidences para soportar Descripciones y Multimedia
ALTER TABLE public.tma_evidences
ADD COLUMN IF NOT EXISTS description_brief text,
ADD COLUMN IF NOT EXISTS description_detailed text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS is_fake boolean DEFAULT false;

-- 2. Sistema de Votación Global (Consenso de Investigación)
CREATE TABLE IF NOT EXISTS public.tma_evidence_polls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evidence_id uuid NOT NULL REFERENCES public.tma_evidences(id) ON DELETE CASCADE,
  initiator_id uuid NOT NULL REFERENCES public.tma_characters(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED'
  yes_count integer DEFAULT 0,
  no_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.tma_evidence_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id uuid NOT NULL REFERENCES public.tma_evidence_polls(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL REFERENCES public.tma_characters(id) ON DELETE CASCADE,
  vote boolean NOT NULL, -- True = YES, False = NO
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(poll_id, voter_id)
);

-- 3. Log de Investigación (Evidencias ya encontradas por cada personaje)
CREATE TABLE IF NOT EXISTS public.tma_character_evidences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id uuid NOT NULL REFERENCES public.tma_characters(id) ON DELETE CASCADE,
  evidence_id uuid NOT NULL REFERENCES public.tma_evidences(id) ON DELETE CASCADE,
  added_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(character_id, evidence_id)
);

-- 4. Habilitar Realtime para las nuevas tablas
ALTER TABLE public.tma_evidence_polls REPLICA IDENTITY FULL;
ALTER TABLE public.tma_evidence_votes REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.tma_evidence_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tma_evidence_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tma_character_evidences;

-- 5. Trigger básico para actualizar el conteo de votos (Opcional, pero ayuda al Realtime)
CREATE OR REPLACE FUNCTION public.handle_evidence_vote()
RETURNS trigger AS $$
BEGIN
  IF NEW.vote = true THEN
    UPDATE public.tma_evidence_polls SET yes_count = yes_count + 1 WHERE id = NEW.poll_id;
  ELSE
    UPDATE public.tma_evidence_polls SET no_count = no_count + 1 WHERE id = NEW.poll_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_evidence_vote
AFTER INSERT ON public.tma_evidence_votes
FOR EACH ROW EXECUTE FUNCTION public.handle_evidence_vote();
