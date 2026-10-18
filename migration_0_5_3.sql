-- Tender 0.5.3: In-app inbox saves, reminders and message mentions.
-- Apply AFTER migration_0_5.sql and migration_0_5_1.sql.
-- Additive migration: does not modify or erase existing messages or accounts.
BEGIN;

-- The same access check is used by each saved-message/reminder policy. 
-- A guessed message UUID is never enough to read or save private content.
CREATE OR REPLACE FUNCTION public.tender_inbox_can_access(kind text,mid uuid,uid uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $tender$
 SELECT uid IS NOT NULL AND mid IS NOT NULL AND (
  (kind='message' AND EXISTS(
   SELECT 1 FROM public.messages m
   WHERE m.id=mid AND public.is_chat_member(m.conversation_id,uid)
  )) OR (kind='piece_message' AND EXISTS(
   SELECT 1 FROM public.piece_messages pm
   WHERE pm.id=mid AND public.is_piece_member(pm.piece_id,uid)
  ))
 );
$tender$;
REVOKE ALL ON FUNCTION public.tender_inbox_can_access(text,uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.tender_inbox_can_access(text,uuid,uuid) TO authenticated;

CREATE TABLE IF NOT EXISTS public.tender_inbox_saves(
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 target_type text NOT NULL CHECK(target_type IN ('message','piece_message')),
 message_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,target_type,message_id)
);
CREATE INDEX IF NOT EXISTS tender_inbox_saves_user_idx ON public.tender_inbox_saves(user_id,created_at DESC);
ALTER TABLE public.tender_inbox_saves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tender inbox saves read" ON public.tender_inbox_saves;
CREATE POLICY "tender inbox saves read" ON public.tender_inbox_saves FOR SELECT TO authenticated
 USING(user_id=auth.uid() AND public.tender_inbox_can_access(target_type,message_id,auth.uid()));
DROP POLICY IF EXISTS "tender inbox saves insert" ON public.tender_inbox_saves;
CREATE POLICY "tender inbox saves insert" ON public.tender_inbox_saves FOR INSERT TO authenticated
 WITH CHECK(user_id=auth.uid() AND public.tender_inbox_can_access(target_type,message_id,auth.uid()));
DROP POLICY IF EXISTS "tender inbox saves delete" ON public.tender_inbox_saves;
CREATE POLICY "tender inbox saves delete" ON public.tender_inbox_saves FOR DELETE TO authenticated
 USING(user_id=auth.uid());
REVOKE ALL ON public.tender_inbox_saves FROM PUBLIC,anon;
GRANT SELECT,INSERT,DELETE ON public.tender_inbox_saves TO authenticated;

CREATE TABLE IF NOT EXISTS public.tender_inbox_reminders(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 target_type text NOT NULL CHECK(target_type IN ('message','piece_message')),
 message_id uuid NOT NULL,
 remind_at timestamptz NOT NULL,
 notified_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(remind_at>created_at)
);
CREATE INDEX IF NOT EXISTS tender_inbox_reminders_user_idx ON public.tender_inbox_reminders(user_id,remind_at DESC);
ALTER TABLE public.tender_inbox_reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tender inbox reminders read" ON public.tender_inbox_reminders;
CREATE POLICY "tender inbox reminders read" ON public.tender_inbox_reminders FOR SELECT TO authenticated
 USING(user_id=auth.uid() AND public.tender_inbox_can_access(target_type,message_id,auth.uid()));
DROP POLICY IF EXISTS "tender inbox reminders add" ON public.tender_inbox_reminders;
CREATE POLICY "tender inbox reminders add" ON public.tender_inbox_reminders FOR INSERT TO authenticated
 WITH CHECK(user_id=auth.uid() AND public.tender_inbox_can_access(target_type,message_id,auth.uid())
 AND remind_at>now() AND notified_at IS NULL);
DROP POLICY IF EXISTS "tender inbox reminders update" ON public.tender_inbox_reminders;
CREATE POLICY "tender inbox reminders update" ON public.tender_inbox_reminders FOR UPDATE TO authenticated
 USING(user_id=auth.uid() AND public.tender_inbox_can_access(target_type,message_id,auth.uid()))
 WITH CHECK(user_id=auth.uid() AND public.tender_inbox_can_access(target_type,message_id,auth.uid()));
DROP POLICY IF EXISTS "tender inbox reminders delete" ON public.tender_inbox_reminders;
CREATE POLICY "tender inbox reminders delete" ON public.tender_inbox_reminders FOR DELETE TO authenticated
 USING(user_id=auth.uid());
REVOKE ALL ON public.tender_inbox_reminders FROM PUBLIC,anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.tender_inbox_reminders TO authenticated;

CREATE TABLE IF NOT EXISTS public.tender_inbox_mentions(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 target_type text NOT NULL CHECK(target_type IN ('message','piece_message')),
 message_id uuid NOT NULL,
 conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
 piece_id uuid REFERENCES public.pieces(id) ON DELETE CASCADE,
 channel_id uuid REFERENCES public.piece_channels(id) ON DELETE SET NULL,
 body_excerpt text NOT NULL DEFAULT '',
 is_read boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,target_type,message_id),
 CHECK ((target_type='message' AND conversation_id IS NOT NULL AND piece_id IS NULL)
   OR (target_type='piece_message' AND piece_id IS NOT NULL AND conversation_id IS NULL))
);
CREATE INDEX IF NOT EXISTS tender_inbox_mentions_user_idx ON public.tender_inbox_mentions(user_id,is_read,created_at DESC);
ALTER TABLE public.tender_inbox_mentions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tender inbox mentions own" ON public.tender_inbox_mentions;
CREATE POLICY "tender inbox mentions own" ON public.tender_inbox_mentions FOR SELECT TO authenticated
 USING(user_id=auth.uid() AND public.tender_inbox_can_access(target_type,message_id,auth.uid()));
DROP POLICY IF EXISTS "tender inbox mentions read change" ON public.tender_inbox_mentions;
CREATE POLICY "tender inbox mentions read change" ON public.tender_inbox_mentions FOR UPDATE TO authenticated
 USING(user_id=auth.uid() AND public.tender_inbox_can_access(target_type,message_id,auth.uid()))
 WITH CHECK(user_id=auth.uid() AND public.tender_inbox_can_access(target_type,message_id,auth.uid()));
REVOKE ALL ON public.tender_inbox_mentions FROM PUBLIC,anon,authenticated;
GRANT SELECT,UPDATE ON public.tender_inbox_mentions TO authenticated;
-- No client-side mention INSERT; only trusted message triggers create them.

CREATE OR REPLACE FUNCTION public.tender_inbox_capture_mentions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $tender$
DECLARE recipient record; kind text; cid uuid; pid uuid; channel uuid;
BEGIN
 IF TG_TABLE_NAME='messages' THEN
   kind:='message';cid:=NEW.conversation_id;pid:=NULL;channel:=NULL;
 ELSIF TG_TABLE_NAME='piece_messages' THEN
   kind:='piece_message';cid:=NULL;pid:=NEW.piece_id;channel:=NEW.channel_id;
 ELSE RETURN NEW;
 END IF;
 FOR recipient IN
  SELECT DISTINCT p.id
  FROM regexp_matches(NEW.body,'(^|[^[:alnum:]_])@([a-z0-9_]{3,20})','gi') AS capture(parts)
  JOIN public.profiles p ON lower(p.handle)=lower((capture.parts)[2])
  WHERE p.id<>NEW.author_id
    AND ((kind='message' AND EXISTS(
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id=cid AND cm.user_id=p.id
    )) OR (kind='piece_message' AND EXISTS(
      SELECT 1 FROM public.piece_members pm
      WHERE pm.piece_id=pid AND pm.user_id=p.id
    )))
  LIMIT 20
 LOOP
   INSERT INTO public.tender_inbox_mentions
    (user_id,author_id,target_type,message_id,conversation_id,piece_id,channel_id,body_excerpt,created_at)
   VALUES(recipient.id,NEW.author_id,kind,NEW.id,cid,pid,channel,left(NEW.body,380),NEW.created_at)
   ON CONFLICT(user_id,target_type,message_id) DO NOTHING;
 END LOOP;
 RETURN NEW;
END;
$tender$;
DROP TRIGGER IF EXISTS tender_inbox_mention_dm ON public.messages;
CREATE TRIGGER tender_inbox_mention_dm AFTER INSERT ON public.messages
 FOR EACH ROW EXECUTE FUNCTION public.tender_inbox_capture_mentions();
DROP TRIGGER IF EXISTS tender_inbox_mention_piece ON public.piece_messages;
CREATE TRIGGER tender_inbox_mention_piece AFTER INSERT ON public.piece_messages
 FOR EACH ROW EXECUTE FUNCTION public.tender_inbox_capture_mentions();

-- Messages can be deleted by their authors; don't retain private excerpts in
-- bookmarks, reminders or mentions after the underlying message is gone.
CREATE OR REPLACE FUNCTION public.tender_inbox_cleanup_deleted_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $tender$
DECLARE kind text;
BEGIN
 IF TG_TABLE_NAME='messages' THEN kind:='message';
 ELSIF TG_TABLE_NAME='piece_messages' THEN kind:='piece_message';
 ELSE RETURN OLD; END IF;
 DELETE FROM public.tender_inbox_mentions WHERE target_type=kind AND message_id=OLD.id;
 DELETE FROM public.tender_inbox_reminders WHERE target_type=kind AND message_id=OLD.id;
 DELETE FROM public.tender_inbox_saves WHERE target_type=kind AND message_id=OLD.id;
 RETURN OLD;
END;
$tender$;
DROP TRIGGER IF EXISTS tender_inbox_deleted_dm ON public.messages;
CREATE TRIGGER tender_inbox_deleted_dm AFTER DELETE ON public.messages
 FOR EACH ROW EXECUTE FUNCTION public.tender_inbox_cleanup_deleted_message();
DROP TRIGGER IF EXISTS tender_inbox_deleted_piece ON public.piece_messages;
CREATE TRIGGER tender_inbox_deleted_piece AFTER DELETE ON public.piece_messages
 FOR EACH ROW EXECUTE FUNCTION public.tender_inbox_cleanup_deleted_message();

DO $tender$
BEGIN
 IF EXISTS(SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime')
 AND NOT EXISTS(SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime'
                AND schemaname='public' AND tablename='tender_inbox_mentions') THEN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tender_inbox_mentions;
 END IF;
END;
$tender$;


-- The existing 0.2 notification table has no client UPDATE policy; use a
-- scoped RPC to mark only the authenticated user's alerts as read.
CREATE OR REPLACE FUNCTION public.tender_inbox_mark_all_read()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $tender$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in first'; END IF;
 UPDATE public.notifications SET is_read=true WHERE user_id=auth.uid() AND is_read=false;
 UPDATE public.tender_inbox_mentions SET is_read=true WHERE user_id=auth.uid() AND is_read=false
  AND public.tender_inbox_can_access(target_type,message_id,auth.uid());
END;
$tender$;
REVOKE ALL ON FUNCTION public.tender_inbox_mark_all_read() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.tender_inbox_mark_all_read() TO authenticated;


COMMIT;
