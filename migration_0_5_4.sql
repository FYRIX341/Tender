-- Tender 0.5.4 — inline editing and historical mentions.
-- Prerequisites: migration_0_5.sql, migration_0_5_1.sql and migration_0_5_3.sql.
-- Additive. Does not erase any messages, chat history, or accounts.
BEGIN;

ALTER TABLE public.piece_messages ADD COLUMN IF NOT EXISTS edited_at timestamptz;

-- Edit only a message you authored and can still access. The server chooses
-- the new edited_at timestamp, and checks that one row was really updated.
CREATE OR REPLACE FUNCTION public.tender_edit_own_message(
 target_kind text,target_id uuid,new_body text
) RETURNS timestamptz
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $tender$
DECLARE saved_at timestamptz; editor uuid := auth.uid();
BEGIN
 IF editor IS NULL THEN RAISE EXCEPTION 'Sign in to edit your messages'; END IF;
 IF new_body IS NULL OR char_length(btrim(new_body)) NOT BETWEEN 1 AND 4000 THEN
  RAISE EXCEPTION 'Messages must contain 1 to 4000 non-whitespace characters';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=editor AND p.account_state='active') THEN
  RAISE EXCEPTION 'Your account must be active to edit messages';
 END IF;
 IF target_kind='message' THEN
  UPDATE public.messages m SET body=btrim(new_body),edited_at=clock_timestamp()
   WHERE m.id=target_id AND m.author_id=editor
     AND public.is_chat_member(m.conversation_id,editor)
   RETURNING m.edited_at INTO saved_at;
 ELSIF target_kind='piece_message' THEN
  UPDATE public.piece_messages m SET body=btrim(new_body),edited_at=clock_timestamp()
   WHERE m.id=target_id AND m.author_id=editor
     AND public.is_piece_member(m.piece_id,editor)
   RETURNING m.edited_at INTO saved_at;
 ELSE
  RAISE EXCEPTION 'Unrecognized message type';
 END IF;
 IF saved_at IS NULL THEN RAISE EXCEPTION 'Message not found or you cannot edit it'; END IF;
 RETURN saved_at;
END;
$tender$;
REVOKE ALL ON FUNCTION public.tender_edit_own_message(text,uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.tender_edit_own_message(text,uuid,text) TO authenticated;

-- Updates to text also keep indexed mentions accurate. Removed @mentions
-- disappear, and newly added @mentions become visible to the recipient.
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
 IF TG_OP='UPDATE' THEN
  DELETE FROM public.tender_inbox_mentions
  WHERE target_type=kind AND message_id=NEW.id;
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
DROP TRIGGER IF EXISTS tender_inbox_mention_dm_update ON public.messages;
CREATE TRIGGER tender_inbox_mention_dm_update AFTER UPDATE OF body ON public.messages
 FOR EACH ROW WHEN (OLD.body IS DISTINCT FROM NEW.body)
 EXECUTE FUNCTION public.tender_inbox_capture_mentions();
DROP TRIGGER IF EXISTS tender_inbox_mention_piece_update ON public.piece_messages;
CREATE TRIGGER tender_inbox_mention_piece_update AFTER UPDATE OF body ON public.piece_messages
 FOR EACH ROW WHEN (OLD.body IS DISTINCT FROM NEW.body)
 EXECUTE FUNCTION public.tender_inbox_capture_mentions();

-- Historical mention recovery, scoped to the logged-in user and conversations/
-- Pieces the user still belongs to. A page contains at most 500 visible rows.
-- Cursor pagination means thousands of old messages can be recovered safely
-- without a one-shot, cross-user database rewrite.
CREATE OR REPLACE FUNCTION public.tender_inbox_backfill_my_mentions(
 cursor_at timestamptz DEFAULT NULL,
 cursor_kind text DEFAULT NULL,
 cursor_id uuid DEFAULT NULL,
 batch_size integer DEFAULT 350
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $tender$
DECLARE
 viewer uuid := auth.uid();
 current_handle text;
 handle_pattern text;
 batch_count integer := least(greatest(coalesce(batch_size,350),25),500);
 result jsonb;
BEGIN
 IF viewer IS NULL THEN RAISE EXCEPTION 'Sign in to find your mentions'; END IF;
 SELECT p.handle INTO current_handle FROM public.profiles p WHERE p.id=viewer;
 IF current_handle IS NULL OR current_handle !~ '^[a-zA-Z0-9_]{3,20}$' THEN
  RAISE EXCEPTION 'A valid Tender username is required to find old mentions';
 END IF;
 IF cursor_at IS NOT NULL AND (cursor_kind NOT IN ('message','piece_message') OR cursor_id IS NULL) THEN
  RAISE EXCEPTION 'Invalid history cursor';
 END IF;
 handle_pattern:='(^|[^[:alnum:]_])@'||current_handle||'([^[:alnum:]_]|$)';
 WITH dm AS MATERIALIZED (
  SELECT m.id AS message_id,'message'::text AS target_type,
         m.author_id,m.conversation_id,NULL::uuid AS piece_id,
         NULL::uuid AS channel_id,m.body,m.created_at
  FROM public.messages m
  JOIN public.conversation_members cm ON cm.conversation_id=m.conversation_id
    AND cm.user_id=viewer
  WHERE cursor_at IS NULL OR
     (m.created_at,'message'::text,m.id) < (cursor_at,cursor_kind,cursor_id)
  ORDER BY m.created_at DESC,m.id DESC
  LIMIT batch_count
 ), piece AS MATERIALIZED (
  SELECT m.id AS message_id,'piece_message'::text AS target_type,
         m.author_id,NULL::uuid AS conversation_id,m.piece_id,
         m.channel_id,m.body,m.created_at
  FROM public.piece_messages m
  JOIN public.piece_members member ON member.piece_id=m.piece_id
    AND member.user_id=viewer
  WHERE cursor_at IS NULL OR
     (m.created_at,'piece_message'::text,m.id) < (cursor_at,cursor_kind,cursor_id)
  ORDER BY m.created_at DESC,m.id DESC
  LIMIT batch_count
 ), batch AS MATERIALIZED (
  SELECT * FROM dm UNION ALL SELECT * FROM piece
  ORDER BY created_at DESC,target_type DESC,message_id DESC
  LIMIT batch_count
 ), inserted AS (
  INSERT INTO public.tender_inbox_mentions(
   user_id,author_id,target_type,message_id,
   conversation_id,piece_id,channel_id,body_excerpt,created_at)
  SELECT viewer,b.author_id,b.target_type,b.message_id,
         b.conversation_id,b.piece_id,b.channel_id,left(b.body,380),b.created_at
  FROM batch b
  WHERE b.author_id<>viewer AND b.body ~* handle_pattern
  ON CONFLICT(user_id,target_type,message_id) DO NOTHING
  RETURNING id
 )
 SELECT jsonb_build_object(
  'scanned',count(*),'added',(SELECT count(*) FROM inserted),
  'has_more',count(*)>=batch_count,
  'cursor_at',(SELECT b.created_at FROM batch b ORDER BY b.created_at ASC,b.target_type ASC,b.message_id ASC LIMIT 1),
  'cursor_kind',(SELECT b.target_type FROM batch b ORDER BY b.created_at ASC,b.target_type ASC,b.message_id ASC LIMIT 1),
  'cursor_id',(SELECT b.message_id FROM batch b ORDER BY b.created_at ASC,b.target_type ASC,b.message_id ASC LIMIT 1)
 ) INTO result FROM batch;
 RETURN coalesce(result,'{"scanned":0,"added":0,"has_more":false}'::jsonb);
END;
$tender$;
REVOKE ALL ON FUNCTION public.tender_inbox_backfill_my_mentions(timestamptz,text,uuid,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.tender_inbox_backfill_my_mentions(timestamptz,text,uuid,integer) TO authenticated;

COMMIT;
