-- Tender 0.5.1 HOTFIX: fixes ERROR: record "new" has no field "piece_id"
-- Safe on existing Tender 0.5 installations. Does not delete or modify data.
-- Run ONLY this file in Supabase SQL Editor if migration_0_5.sql was already applied.
-- New installations can use corrected migration_0_5.sql instead.
BEGIN;

CREATE OR REPLACE FUNCTION public.tender_guard_message_rate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE sent_count int;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=NEW.author_id AND account_state='active') THEN
   RAISE EXCEPTION 'Your account is inactive';
 END IF;
 -- IMPORTANT: PL/pgSQL boolean expressions are not guaranteed to short-circuit.
 -- A direct-message row has no piece_id column, so never access NEW.piece_id
 -- in the same condition that tests TG_TABLE_NAME.
 IF TG_TABLE_NAME='piece_messages' THEN
   IF NOT public.is_piece_mod(NEW.piece_id) THEN
     IF EXISTS (
      SELECT 1 FROM public.pieces p JOIN public.piece_messages old
        ON old.piece_id=p.id
      WHERE p.id=NEW.piece_id AND old.author_id=NEW.author_id
        AND p.message_cooldown_seconds>0
        AND old.created_at>now()-(p.message_cooldown_seconds*interval '1 second')
     ) THEN
       RAISE EXCEPTION 'Piece slow mode: wait before sending another message';
     END IF;
   END IF;
 END IF;
 IF TG_TABLE_NAME='messages' THEN
   IF EXISTS(
    SELECT 1 FROM public.conversation_members m JOIN public.profiles p ON p.id=m.user_id
    WHERE m.conversation_id=NEW.conversation_id AND p.account_state<>'active'
   ) THEN RAISE EXCEPTION 'Cannot message an inactive account'; END IF;
   IF EXISTS(
    SELECT 1 FROM public.conversations c
    JOIN public.conversation_members peer ON peer.conversation_id=c.id AND peer.user_id<>NEW.author_id
    JOIN public.profiles profile ON profile.id=peer.user_id
    WHERE c.id=NEW.conversation_id AND c.kind='dm'
    AND (profile.dm_policy='none' OR
      (profile.dm_policy='friends' AND NOT EXISTS(
       SELECT 1 FROM public.friendships f
       WHERE f.status='accepted' AND
       ((f.requester=NEW.author_id AND f.recipient=peer.user_id)
         OR(f.recipient=NEW.author_id AND f.requester=peer.user_id))
      )))
   ) THEN RAISE EXCEPTION 'The recipient has changed their DM privacy settings'; END IF;
   IF EXISTS(
    SELECT 1 FROM public.conversation_members peer
    JOIN public.user_blocks b ON
      ((b.blocker_id=peer.user_id AND b.blocked_id=NEW.author_id)
       OR (b.blocker_id=NEW.author_id AND b.blocked_id=peer.user_id))
    WHERE peer.conversation_id=NEW.conversation_id AND peer.user_id<>NEW.author_id
   ) THEN RAISE EXCEPTION 'One of the conversation members blocked messaging'; END IF;
 END IF;
 SELECT
   (SELECT count(*) FROM public.messages m WHERE m.author_id=NEW.author_id AND m.created_at>now()-interval '10 seconds')
   +(SELECT count(*) FROM public.piece_messages pm WHERE pm.author_id=NEW.author_id AND pm.created_at>now()-interval '10 seconds')
 INTO sent_count;
 IF sent_count>=8 THEN
   RAISE EXCEPTION 'Woah, chill there buddy! Gotta slow down.. 😏' USING ERRCODE='P0001';
 END IF;
 RETURN NEW;
END $$;

COMMIT;
