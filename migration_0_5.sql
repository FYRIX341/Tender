-- Tender 0.5: content update foundation. Apply AFTER schema.sql and 0.2/0.4/0.4.1 migrations.
-- Additive schema: existing accounts, conversations, messages and Pieces are preserved.
-- Requires manual execution in the SAME Supabase project as Tender. Never publish a service-role key.
BEGIN;

ALTER TABLE public.profiles
 ADD COLUMN IF NOT EXISTS dm_policy text NOT NULL DEFAULT 'requests'
   CHECK (dm_policy IN ('everyone','requests','friends','none')),
 ADD COLUMN IF NOT EXISTS account_state text NOT NULL DEFAULT 'active'
   CHECK (account_state IN ('active','deactivated','deletion_requested')),
 ADD COLUMN IF NOT EXISTS deletion_requested_at timestamptz,
 ADD COLUMN IF NOT EXISTS banner_mode text NOT NULL DEFAULT 'gradient'
   CHECK (banner_mode IN ('gradient','solid','image')),
 ADD COLUMN IF NOT EXISTS banner_color text NOT NULL DEFAULT '#21385d',
 ADD COLUMN IF NOT EXISTS profile_layout text NOT NULL DEFAULT 'classic',
 ADD COLUMN IF NOT EXISTS profile_widgets jsonb NOT NULL DEFAULT '["about","status","pieces"]'::jsonb,
 ADD COLUMN IF NOT EXISTS equipped_piece_id uuid REFERENCES public.pieces(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD CONSTRAINT tender_banner_color_valid CHECK (banner_color ~ '^#[0-9a-fA-F]{6}$') NOT VALID;
-- Mark existing rows as verified after checking old profile data; no account updates required.
ALTER TABLE public.profiles VALIDATE CONSTRAINT tender_banner_color_valid;

-- Direct messages from strangers are requests, not unconsented full chat membership.
CREATE TABLE IF NOT EXISTS public.tender_dm_requests(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 body text NOT NULL CHECK(char_length(trim(body)) BETWEEN 1 AND 600),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined')),
 created_at timestamptz NOT NULL DEFAULT now(),
 responded_at timestamptz,
 CHECK(sender_id<>recipient_id),
 UNIQUE(sender_id,recipient_id)
);
CREATE INDEX IF NOT EXISTS tender_dm_requests_inbox ON public.tender_dm_requests(recipient_id,status,created_at DESC);
ALTER TABLE public.tender_dm_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tender requests visible to participants" ON public.tender_dm_requests;
CREATE POLICY "tender requests visible to participants" ON public.tender_dm_requests FOR SELECT TO authenticated
 USING(auth.uid() IN (sender_id,recipient_id));
-- Insert and status mutation ONLY through SECURITY DEFINER RPCs below.
REVOKE INSERT,UPDATE,DELETE ON public.tender_dm_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.tender_dm_requests TO authenticated;

CREATE OR REPLACE FUNCTION public.tender_can_contact(sender uuid,recipient uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT sender IS NOT NULL AND recipient IS NOT NULL AND sender<>recipient
 AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=sender AND p.account_state='active')
 AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=recipient AND p.account_state='active')
 AND NOT EXISTS (SELECT 1 FROM public.user_blocks b
   WHERE (b.blocker_id=sender AND b.blocked_id=recipient)
      OR (b.blocker_id=recipient AND b.blocked_id=sender));
$$;

-- Trusted helper returns existing DM or creates it without the old "friends only" restriction.
-- Access is granted only to authenticated callers of tender_contact_user / tender_accept_dm_request.
CREATE OR REPLACE FUNCTION public.tender_open_dm(sender uuid,recipient uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE existing uuid; created uuid;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext(least(sender::text,recipient::text)||':'||greatest(sender::text,recipient::text)));
 SELECT c.id INTO existing FROM public.conversations c
 WHERE c.kind='dm'
   AND EXISTS(SELECT 1 FROM public.conversation_members m WHERE m.conversation_id=c.id AND m.user_id=sender)
   AND EXISTS(SELECT 1 FROM public.conversation_members m WHERE m.conversation_id=c.id AND m.user_id=recipient)
 LIMIT 1;
 IF existing IS NOT NULL THEN RETURN existing; END IF;
 INSERT INTO public.conversations(kind,created_by) VALUES('dm',sender) RETURNING id INTO created;
 INSERT INTO public.conversation_members(conversation_id,user_id) VALUES (created,sender),(created,recipient);
 RETURN created;
END $$;
REVOKE ALL ON FUNCTION public.tender_open_dm(uuid,uuid) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.tender_contact_user(other_id uuid,initial_text text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE mode text; friended boolean; conversation uuid; request_id uuid; text_body text;
BEGIN
 IF auth.uid() IS NULL OR other_id IS NULL THEN RAISE EXCEPTION 'Sign in and select a recipient'; END IF;
 IF NOT public.tender_can_contact(auth.uid(),other_id) THEN RAISE EXCEPTION 'This account cannot receive your message'; END IF;
 SELECT p.dm_policy INTO mode FROM public.profiles p WHERE p.id=other_id;
 SELECT EXISTS(SELECT 1 FROM public.friendships f
  WHERE f.status='accepted' AND
   ((f.requester=auth.uid() AND f.recipient=other_id) OR (f.recipient=auth.uid() AND f.requester=other_id)))
 INTO friended;
 IF mode='none' OR (mode='friends' AND NOT friended) THEN
   RAISE EXCEPTION 'This member only accepts messages from their allowed contacts';
 END IF;
 IF friended OR mode='everyone' THEN
   conversation:=public.tender_open_dm(auth.uid(),other_id);
   RETURN jsonb_build_object('kind','conversation','id',conversation);
 END IF;
 text_body:=left(trim(coalesce(initial_text,'')),600);
 IF text_body='' THEN
   RETURN jsonb_build_object('kind','compose_request');
 END IF;
 -- Avoid request flooding: only one open request per sender/recipient, >=60 sec cooldown after decline.
 INSERT INTO public.tender_dm_requests(sender_id,recipient_id,body,status)
 VALUES(auth.uid(),other_id,text_body,'pending')
 ON CONFLICT(sender_id,recipient_id) DO UPDATE
 SET body=EXCLUDED.body,status='pending',created_at=now(),responded_at=NULL
 WHERE public.tender_dm_requests.status='pending'
    OR public.tender_dm_requests.responded_at IS NULL
    OR public.tender_dm_requests.responded_at<now()-interval '7 days'
 RETURNING id INTO request_id;
 IF request_id IS NULL THEN RAISE EXCEPTION 'Wait before sending another message request'; END IF;
 RETURN jsonb_build_object('kind','request','id',request_id);
END $$;

CREATE OR REPLACE FUNCTION public.tender_accept_dm_request(request_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE req public.tender_dm_requests%ROWTYPE; cid uuid;
BEGIN
 SELECT * INTO req FROM public.tender_dm_requests WHERE id=request_id AND recipient_id=auth.uid() AND status='pending' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Request unavailable or already handled'; END IF;
 IF NOT public.tender_can_contact(req.sender_id,req.recipient_id) THEN RAISE EXCEPTION 'One of these accounts is unavailable or blocked'; END IF;
 cid:=public.tender_open_dm(req.sender_id,req.recipient_id);
 IF trim(req.body)<>'' THEN
   INSERT INTO public.messages(conversation_id,author_id,body) VALUES(cid,req.sender_id,req.body);
 END IF;
 UPDATE public.tender_dm_requests SET status='accepted',responded_at=now() WHERE id=req.id;
 RETURN cid;
END $$;

CREATE OR REPLACE FUNCTION public.tender_decline_dm_request(request_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 UPDATE public.tender_dm_requests SET status='declined',responded_at=now()
 WHERE id=request_id AND recipient_id=auth.uid() AND status='pending';
 IF NOT FOUND THEN RAISE EXCEPTION 'Request unavailable'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.tender_contact_user(uuid,text),public.tender_accept_dm_request(uuid),public.tender_decline_dm_request(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.tender_contact_user(uuid,text),public.tender_accept_dm_request(uuid),public.tender_decline_dm_request(uuid) TO authenticated;

-- Deny client-side DMs to deactivated recipients and slow down rapid message floods.
-- This protects the database even if someone bypasses the Tender website.
CREATE OR REPLACE FUNCTION public.tender_guard_message_rate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE sent_count int;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=NEW.author_id AND account_state='active') THEN
   RAISE EXCEPTION 'Your account is inactive';
 END IF;
 IF TG_TABLE_NAME='messages' THEN
   IF EXISTS(
    SELECT 1 FROM public.conversation_members m JOIN public.profiles p ON p.id=m.user_id
    WHERE m.conversation_id=NEW.conversation_id AND p.account_state<>'active'
   ) THEN RAISE EXCEPTION 'Cannot message an inactive account'; END IF;
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
CREATE INDEX IF NOT EXISTS tender_messages_spam_idx ON public.messages(author_id,created_at DESC);
CREATE INDEX IF NOT EXISTS tender_piece_messages_spam_idx ON public.piece_messages(author_id,created_at DESC);
DROP TRIGGER IF EXISTS tender_dm_message_rate ON public.messages;
CREATE TRIGGER tender_dm_message_rate BEFORE INSERT ON public.messages
 FOR EACH ROW EXECUTE FUNCTION public.tender_guard_message_rate();
DROP TRIGGER IF EXISTS tender_piece_message_rate ON public.piece_messages;
CREATE TRIGGER tender_piece_message_rate BEFORE INSERT ON public.piece_messages
 FOR EACH ROW EXECUTE FUNCTION public.tender_guard_message_rate();

-- Deactivation is reversible. Deletion requests require a separate privileged
-- cleanup worker; never claim that the DB has removed auth.users by itself.
CREATE OR REPLACE FUNCTION public.tender_set_deactivated(make_inactive boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in first'; END IF;
 IF make_inactive THEN
   UPDATE public.profiles SET account_state='deactivated' WHERE id=auth.uid() AND account_state='active';
 ELSE
   UPDATE public.profiles SET account_state='active' WHERE id=auth.uid() AND account_state='deactivated';
 END IF;
END $$;
CREATE OR REPLACE FUNCTION public.tender_request_account_deletion()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in first'; END IF;
 UPDATE public.profiles SET account_state='deletion_requested',deletion_requested_at=now()
 WHERE id=auth.uid() AND account_state IN ('active','deactivated');
 IF NOT FOUND THEN RAISE EXCEPTION 'Deletion already requested or account unavailable'; END IF;
END $$;
CREATE OR REPLACE FUNCTION public.tender_cancel_account_deletion()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 UPDATE public.profiles SET account_state='active',deletion_requested_at=NULL
 WHERE id=auth.uid() AND account_state='deletion_requested' AND deletion_requested_at>now()-interval '30 days';
 IF NOT FOUND THEN RAISE EXCEPTION 'No cancellable deletion request'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.tender_set_deactivated(boolean),public.tender_request_account_deletion(),public.tender_cancel_account_deletion() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.tender_set_deactivated(boolean),public.tender_request_account_deletion(),public.tender_cancel_account_deletion() TO authenticated;

-- Free Piece tags: one active membership-based tag per account.
CREATE TABLE IF NOT EXISTS public.tender_piece_tags(
 piece_id uuid PRIMARY KEY REFERENCES public.pieces(id) ON DELETE CASCADE,
 tag text NOT NULL CHECK(tag ~ '^[A-Z0-9]{2,5}$'),
 emoji text NOT NULL DEFAULT '🍗' CHECK(char_length(emoji)<=16),
 color text NOT NULL DEFAULT '#f47735' CHECK(color ~ '^#[0-9a-fA-F]{6}$')
);
ALTER TABLE public.tender_piece_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tender piece tags read" ON public.tender_piece_tags;
CREATE POLICY "tender piece tags read" ON public.tender_piece_tags FOR SELECT TO authenticated
 USING(public.can_view_piece(piece_id));
DROP POLICY IF EXISTS "tender piece tags insert owner" ON public.tender_piece_tags;
CREATE POLICY "tender piece tags insert owner" ON public.tender_piece_tags FOR INSERT TO authenticated
 WITH CHECK(EXISTS(SELECT 1 FROM public.pieces p WHERE p.id=piece_id AND p.owner_id=auth.uid()));
DROP POLICY IF EXISTS "tender piece tags edit owner" ON public.tender_piece_tags;
CREATE POLICY "tender piece tags edit owner" ON public.tender_piece_tags FOR UPDATE TO authenticated
 USING(EXISTS(SELECT 1 FROM public.pieces p WHERE p.id=piece_id AND p.owner_id=auth.uid()))
 WITH CHECK(EXISTS(SELECT 1 FROM public.pieces p WHERE p.id=piece_id AND p.owner_id=auth.uid()));
CREATE OR REPLACE FUNCTION public.tender_equip_piece_tag(pid uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF pid IS NOT NULL AND NOT EXISTS(
  SELECT 1 FROM public.tender_piece_tags t JOIN public.piece_members m ON m.piece_id=t.piece_id
  WHERE t.piece_id=pid AND m.user_id=auth.uid()
 ) THEN RAISE EXCEPTION 'Join this Piece before equipping its tag'; END IF;
 UPDATE public.profiles SET equipped_piece_id=pid WHERE id=auth.uid();
END $$;
REVOKE ALL ON FUNCTION public.tender_equip_piece_tag(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.tender_equip_piece_tag(uuid) TO authenticated;

-- A profile guestbook has owner approval and only friends may submit notes.
CREATE TABLE IF NOT EXISTS public.tender_profile_guestbook(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 body text NOT NULL CHECK(char_length(trim(body)) BETWEEN 1 AND 220),
 approved boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(profile_id<>author_id)
);
ALTER TABLE public.tender_profile_guestbook ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tender guestbook read" ON public.tender_profile_guestbook;
CREATE POLICY "tender guestbook read" ON public.tender_profile_guestbook FOR SELECT TO authenticated
 USING(approved OR profile_id=auth.uid() OR author_id=auth.uid());
DROP POLICY IF EXISTS "tender guestbook friend submission" ON public.tender_profile_guestbook;
CREATE POLICY "tender guestbook friend submission" ON public.tender_profile_guestbook FOR INSERT TO authenticated
 WITH CHECK(author_id=auth.uid() AND NOT approved AND
 EXISTS(SELECT 1 FROM public.friendships f WHERE f.status='accepted'
 AND ((f.requester=auth.uid() AND f.recipient=profile_id)
   OR(f.recipient=auth.uid() AND f.requester=profile_id))));
DROP POLICY IF EXISTS "tender guestbook owner moderation" ON public.tender_profile_guestbook;
CREATE POLICY "tender guestbook owner moderation" ON public.tender_profile_guestbook FOR UPDATE TO authenticated
 USING(profile_id=auth.uid()) WITH CHECK(profile_id=auth.uid());
DROP POLICY IF EXISTS "tender guestbook delete" ON public.tender_profile_guestbook;
CREATE POLICY "tender guestbook delete" ON public.tender_profile_guestbook FOR DELETE TO authenticated
 USING(profile_id=auth.uid() OR author_id=auth.uid());

COMMIT;
