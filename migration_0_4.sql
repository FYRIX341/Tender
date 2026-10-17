-- Tender 0.4 community channels, visual identities and read cursors.
-- Additive/idempotent: old Piece messages stay in #general (NULL channel_id).
BEGIN;
ALTER TABLE public.profiles
 ADD COLUMN IF NOT EXISTS profile_gradient_start text DEFAULT '#21385d',
 ADD COLUMN IF NOT EXISTS profile_gradient_end text DEFAULT '#563561',
 ADD COLUMN IF NOT EXISTS name_style text NOT NULL DEFAULT 'classic',
 ADD COLUMN IF NOT EXISTS name_effect text NOT NULL DEFAULT 'solid',
 ADD COLUMN IF NOT EXISTS name_color text DEFAULT '#ffffff';
ALTER TABLE public.pieces
 ADD COLUMN IF NOT EXISTS color_secondary text DEFAULT '#293758',
 ADD COLUMN IF NOT EXISTS theme_style text NOT NULL DEFAULT 'classic',
 ADD COLUMN IF NOT EXISTS icon_shape text NOT NULL DEFAULT 'rounded',
 ADD COLUMN IF NOT EXISTS name_style text NOT NULL DEFAULT 'classic',
 ADD COLUMN IF NOT EXISTS channel_welcome text DEFAULT '';
CREATE TABLE IF NOT EXISTS public.piece_channels(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 piece_id uuid NOT NULL REFERENCES public.pieces(id) ON DELETE CASCADE,
 name text NOT NULL CHECK(char_length(name) BETWEEN 1 AND 40 AND name ~ '^[a-z0-9][a-z0-9_-]*$'),
 kind text NOT NULL DEFAULT 'text' CHECK(kind IN ('text','announcements')),
 topic text NOT NULL DEFAULT '' CHECK(char_length(topic)<=280),
 category text NOT NULL DEFAULT 'TEXT CHANNELS' CHECK(char_length(category) BETWEEN 1 AND 35),
 position integer NOT NULL DEFAULT 0,
 is_default boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(piece_id,name),
 UNIQUE(id,piece_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS tender_default_channel_unique
 ON public.piece_channels(piece_id) WHERE is_default;
INSERT INTO public.piece_channels(piece_id,name,kind,topic,category,is_default)
 SELECT p.id,'general','text','The main chat for this Piece.','TEXT CHANNELS',true
 FROM public.pieces p
 WHERE NOT EXISTS (SELECT 1 FROM public.piece_channels c WHERE c.piece_id=p.id AND c.is_default)
ON CONFLICT(piece_id,name) DO UPDATE SET is_default=true
 WHERE NOT EXISTS (SELECT 1 FROM public.piece_channels c WHERE c.piece_id=excluded.piece_id AND c.is_default);
ALTER TABLE public.piece_messages ADD COLUMN IF NOT EXISTS channel_id uuid;
DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='tender_piece_message_channel_fk') THEN
 ALTER TABLE public.piece_messages ADD CONSTRAINT tender_piece_message_channel_fk
 FOREIGN KEY(channel_id,piece_id) REFERENCES public.piece_channels(id,piece_id) ON DELETE SET NULL (channel_id);
 END IF;
END $$;
CREATE INDEX IF NOT EXISTS tender_channel_message_idx ON public.piece_messages(channel_id,created_at);
CREATE TABLE IF NOT EXISTS public.piece_channel_reads(
 channel_id uuid NOT NULL REFERENCES public.piece_channels(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 last_read_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(channel_id,user_id)
);
ALTER TABLE public.piece_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_channel_reads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tender channels visible" ON public.piece_channels;
CREATE POLICY "tender channels visible" ON public.piece_channels FOR SELECT TO authenticated
 USING(public.can_view_piece(piece_id));
DROP POLICY IF EXISTS "tender channels create" ON public.piece_channels;
CREATE POLICY "tender channels create" ON public.piece_channels FOR INSERT TO authenticated
 WITH CHECK(public.is_piece_mod(piece_id) AND NOT is_default);
DROP POLICY IF EXISTS "tender channels update" ON public.piece_channels;
CREATE POLICY "tender channels update" ON public.piece_channels FOR UPDATE TO authenticated
 USING(public.is_piece_mod(piece_id)) WITH CHECK(public.is_piece_mod(piece_id));
DROP POLICY IF EXISTS "tender channels delete" ON public.piece_channels;
CREATE POLICY "tender channels delete" ON public.piece_channels FOR DELETE TO authenticated
 USING(public.is_piece_mod(piece_id) AND NOT is_default);
DROP POLICY IF EXISTS "tender reads view own" ON public.piece_channel_reads;
CREATE POLICY "tender reads view own" ON public.piece_channel_reads FOR SELECT TO authenticated
 USING(user_id=auth.uid());
DROP POLICY IF EXISTS "tender reads insert own" ON public.piece_channel_reads;
CREATE POLICY "tender reads insert own" ON public.piece_channel_reads FOR INSERT TO authenticated
 WITH CHECK(user_id=auth.uid() AND EXISTS (SELECT 1 FROM public.piece_channels c WHERE c.id=channel_id AND public.is_piece_member(c.piece_id)));
DROP POLICY IF EXISTS "tender reads update own" ON public.piece_channel_reads;
CREATE POLICY "tender reads update own" ON public.piece_channel_reads FOR UPDATE TO authenticated
 USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE OR REPLACE FUNCTION public.tender_channel_unreads()
RETURNS TABLE(channel_id uuid, unread_count bigint, latest_at timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=''
AS $$
 SELECT c.id,
 count(m.id) FILTER (WHERE m.author_id<>auth.uid()
   AND m.created_at > COALESCE(r.last_read_at,pm.joined_at,now())) AS unread_count,
 max(m.created_at) AS latest_at
 FROM public.piece_channels c
 JOIN public.piece_members pm ON pm.piece_id=c.piece_id AND pm.user_id=auth.uid()
 LEFT JOIN public.piece_channel_reads r ON r.channel_id=c.id AND r.user_id=auth.uid()
 LEFT JOIN public.piece_messages m ON m.piece_id=c.piece_id
   AND (m.channel_id=c.id OR (m.channel_id IS NULL AND c.is_default))
 GROUP BY c.id;
$$;
REVOKE ALL ON FUNCTION public.tender_channel_unreads() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tender_channel_unreads() TO authenticated;
CREATE OR REPLACE FUNCTION public.tender_ensure_general_channel()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
BEGIN
 INSERT INTO public.piece_channels(piece_id,name,topic,is_default)
 VALUES(NEW.id,'general','The main chat for this Piece.',true)
 ON CONFLICT(piece_id,name) DO NOTHING;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS tender_piece_create_general ON public.pieces;
CREATE TRIGGER tender_piece_create_general AFTER INSERT ON public.pieces
 FOR EACH ROW EXECUTE FUNCTION public.tender_ensure_general_channel();
-- Existing default messages remain linked to their Piece via piece_id and map to #general.
-- Profile and Piece owners may customize new fields through existing owner/self update RLS.
COMMIT;