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
DO $tender$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='tender_banner_color_valid') THEN
  ALTER TABLE public.profiles ADD CONSTRAINT tender_banner_color_valid
   CHECK (banner_color ~ '^#[0-9a-fA-F]{6}$') NOT VALID;
 END IF;
END;
$tender$;
ALTER TABLE public.profiles VALIDATE CONSTRAINT tender_banner_color_valid;

-- Piece owners may choose a community slow-mode cooldown (0 disables it).
ALTER TABLE public.pieces ADD COLUMN IF NOT EXISTS message_cooldown_seconds integer NOT NULL DEFAULT 0
 CHECK(message_cooldown_seconds BETWEEN 0 AND 120);

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
 WHERE (public.tender_dm_requests.status='pending' AND public.tender_dm_requests.created_at<now()-interval '60 seconds')
    OR (public.tender_dm_requests.status='declined' AND public.tender_dm_requests.responded_at<now()-interval '7 days')
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
 IF TG_TABLE_NAME='piece_messages' AND NOT public.is_piece_mod(NEW.piece_id) THEN
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

-- Users can file a report about a request. This creates an audit queue;
-- moderation still requires trusted staff tooling and human review.
CREATE TABLE IF NOT EXISTS public.tender_safety_reports(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 request_id uuid NOT NULL REFERENCES public.tender_dm_requests(id) ON DELETE CASCADE,
 reason text NOT NULL CHECK(char_length(trim(reason)) BETWEEN 8 AND 500),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(reporter_id,request_id)
);
ALTER TABLE public.tender_safety_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tender safety reporter sees own" ON public.tender_safety_reports;
CREATE POLICY "tender safety reporter sees own" ON public.tender_safety_reports
 FOR SELECT TO authenticated USING(reporter_id=auth.uid());
DROP POLICY IF EXISTS "tender safety report create" ON public.tender_safety_reports;
CREATE POLICY "tender safety report create" ON public.tender_safety_reports
 FOR INSERT TO authenticated WITH CHECK(
  reporter_id=auth.uid() AND EXISTS(
   SELECT 1 FROM public.tender_dm_requests r WHERE r.id=request_id AND r.recipient_id=auth.uid()
  ));

-- Organized forum channels are real persisted channels, not placeholder buttons.
ALTER TABLE public.piece_channels DROP CONSTRAINT IF EXISTS piece_channels_kind_check;
ALTER TABLE public.piece_channels ADD CONSTRAINT piece_channels_kind_check
 CHECK(kind IN ('text','announcements','forum'));
ALTER TABLE public.piece_posts ADD COLUMN IF NOT EXISTS channel_id uuid;
DO $tender$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='tender_piece_post_channel_fk') THEN
  ALTER TABLE public.piece_posts ADD CONSTRAINT tender_piece_post_channel_fk
   FOREIGN KEY(channel_id,piece_id) REFERENCES public.piece_channels(id,piece_id) ON DELETE SET NULL (channel_id);
 END IF;
END $tender$;
CREATE INDEX IF NOT EXISTS tender_forum_post_channel_idx ON public.piece_posts(channel_id,created_at DESC);
CREATE OR REPLACE FUNCTION public.tender_channel_send_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE channel_kind text;
BEGIN
 IF NEW.channel_id IS NOT NULL THEN
  SELECT c.kind INTO channel_kind FROM public.piece_channels c
  WHERE c.id=NEW.channel_id AND c.piece_id=NEW.piece_id;
  IF channel_kind='announcements' AND NOT public.is_piece_mod(NEW.piece_id) THEN
   RAISE EXCEPTION 'Only Piece moderators can post in announcement channels';
  ELSIF channel_kind='forum' THEN
   RAISE EXCEPTION 'Use discussions inside forum channels';
  END IF;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS tender_channel_send_guard_trigger ON public.piece_messages;
CREATE TRIGGER tender_channel_send_guard_trigger BEFORE INSERT ON public.piece_messages
 FOR EACH ROW EXECUTE FUNCTION public.tender_channel_send_guard();

-- Secure public/private threads with their own posts. Private membership is enforced
-- by the DB RLS functions even if a client guesses a thread UUID.
CREATE TABLE IF NOT EXISTS public.tender_threads(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 root_type text NOT NULL CHECK(root_type IN ('message','piece_message')),
 root_message_id uuid NOT NULL,
 conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
 piece_id uuid REFERENCES public.pieces(id) ON DELETE CASCADE,
 channel_id uuid REFERENCES public.piece_channels(id) ON DELETE SET NULL,
 created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 title text NOT NULL CHECK(char_length(title) BETWEEN 1 AND 80),
 is_private boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK((conversation_id IS NULL)<>(piece_id IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS tender_thread_origin_idx ON public.tender_threads(root_type,root_message_id,id);
CREATE TABLE IF NOT EXISTS public.tender_thread_members(
 thread_id uuid NOT NULL REFERENCES public.tender_threads(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 PRIMARY KEY(thread_id,user_id)
);
CREATE TABLE IF NOT EXISTS public.tender_thread_posts(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 thread_id uuid NOT NULL REFERENCES public.tender_threads(id) ON DELETE CASCADE,
 author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 body text NOT NULL CHECK(char_length(trim(body)) BETWEEN 1 AND 4000),
 created_at timestamptz NOT NULL DEFAULT now(),
 edited_at timestamptz
);
CREATE INDEX IF NOT EXISTS tender_thread_posts_idx ON public.tender_thread_posts(thread_id,created_at);

CREATE OR REPLACE FUNCTION public.tender_thread_allowed(thread_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(
  SELECT 1 FROM public.tender_threads t WHERE t.id=thread_uuid
   AND ((t.conversation_id IS NOT NULL AND public.is_chat_member(t.conversation_id))
     OR (t.piece_id IS NOT NULL AND public.is_piece_member(t.piece_id)))
   AND (NOT t.is_private OR EXISTS(
    SELECT 1 FROM public.tender_thread_members m WHERE m.thread_id=t.id AND m.user_id=auth.uid()
   ))
 );
$$;
CREATE OR REPLACE FUNCTION public.tender_create_thread(
 root_kind text,root_id uuid,thread_title text,secret boolean DEFAULT false,invited uuid[] DEFAULT '{}'::uuid[]
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE conv uuid; pid uuid; chid uuid; tid uuid; member_id uuid;
BEGIN
 IF auth.uid() IS NULL OR root_id IS NULL THEN RAISE EXCEPTION 'Sign in first'; END IF;
 IF root_kind='message' THEN
   SELECT m.conversation_id INTO conv FROM public.messages m WHERE m.id=root_id
   AND public.is_chat_member(m.conversation_id);
 ELSIF root_kind='piece_message' THEN
   SELECT m.piece_id,m.channel_id INTO pid,chid FROM public.piece_messages m WHERE m.id=root_id
   AND public.is_piece_member(m.piece_id);
 ELSE RAISE EXCEPTION 'Invalid thread type'; END IF;
 IF conv IS NULL AND pid IS NULL THEN RAISE EXCEPTION 'You cannot create a thread from this message'; END IF;
 IF array_length(invited,1)>25 THEN RAISE EXCEPTION 'Maximum 25 invited members'; END IF;
 INSERT INTO public.tender_threads(root_type,root_message_id,conversation_id,piece_id,channel_id,created_by,title,is_private)
 VALUES(root_kind,root_id,conv,pid,chid,auth.uid(),left(coalesce(nullif(trim(thread_title),''),'Discussion'),80),coalesce(secret,false))
 RETURNING id INTO tid;
 INSERT INTO public.tender_thread_members(thread_id,user_id) VALUES(tid,auth.uid());
 IF secret THEN
   FOR member_id IN SELECT DISTINCT unnest(coalesce(invited,'{}'::uuid[])) LOOP
     IF member_id<>auth.uid() AND
       ((conv IS NOT NULL AND EXISTS(SELECT 1 FROM public.conversation_members x WHERE x.conversation_id=conv AND x.user_id=member_id))
        OR (pid IS NOT NULL AND EXISTS(SELECT 1 FROM public.piece_members x WHERE x.piece_id=pid AND x.user_id=member_id)))
     THEN INSERT INTO public.tender_thread_members(thread_id,user_id) VALUES(tid,member_id) ON CONFLICT DO NOTHING; END IF;
   END LOOP;
 END IF;
 RETURN tid;
END $$;
REVOKE ALL ON FUNCTION public.tender_create_thread(text,uuid,text,boolean,uuid[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.tender_create_thread(text,uuid,text,boolean,uuid[]) TO authenticated;

ALTER TABLE public.tender_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_thread_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_thread_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tender threads visible" ON public.tender_threads;
CREATE POLICY "tender threads visible" ON public.tender_threads FOR SELECT TO authenticated
 USING(public.tender_thread_allowed(id));
DROP POLICY IF EXISTS "tender thread members visible" ON public.tender_thread_members;
CREATE POLICY "tender thread members visible" ON public.tender_thread_members FOR SELECT TO authenticated
 USING(public.tender_thread_allowed(thread_id));
DROP POLICY IF EXISTS "tender thread posts visible" ON public.tender_thread_posts;
CREATE POLICY "tender thread posts visible" ON public.tender_thread_posts FOR SELECT TO authenticated
 USING(public.tender_thread_allowed(thread_id));
DROP POLICY IF EXISTS "tender thread posts send" ON public.tender_thread_posts;
CREATE POLICY "tender thread posts send" ON public.tender_thread_posts FOR INSERT TO authenticated
 WITH CHECK(author_id=auth.uid() AND public.tender_thread_allowed(thread_id)
 AND EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.account_state='active'));
DROP POLICY IF EXISTS "tender thread posts edit" ON public.tender_thread_posts;
CREATE POLICY "tender thread posts edit" ON public.tender_thread_posts FOR UPDATE TO authenticated
 USING(author_id=auth.uid()) WITH CHECK(author_id=auth.uid());
DROP POLICY IF EXISTS "tender thread posts delete" ON public.tender_thread_posts;
CREATE POLICY "tender thread posts delete" ON public.tender_thread_posts FOR DELETE TO authenticated
 USING(author_id=auth.uid());

CREATE OR REPLACE FUNCTION public.tender_guard_thread_rate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE total integer;
BEGIN
 SELECT count(*) INTO total FROM public.tender_thread_posts p
 WHERE p.author_id=NEW.author_id AND p.created_at>now()-interval '10 seconds';
 IF total>=8 THEN RAISE EXCEPTION 'Woah, chill there buddy! Gotta slow down.. 😏'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS tender_thread_rate_trigger ON public.tender_thread_posts;
CREATE TRIGGER tender_thread_rate_trigger BEFORE INSERT ON public.tender_thread_posts
 FOR EACH ROW EXECUTE FUNCTION public.tender_guard_thread_rate();

-- Enable inbox and thread activity events if Realtime publication exists.
DO $tender$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN
  IF NOT EXISTS(SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='tender_dm_requests') THEN
   ALTER PUBLICATION supabase_realtime ADD TABLE public.tender_dm_requests;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='tender_thread_posts') THEN
   ALTER PUBLICATION supabase_realtime ADD TABLE public.tender_thread_posts;
  END IF;
 END IF;
END $tender$;

-- Explicit PostgREST privileges: RLS still limits access to each row.
REVOKE ALL ON public.tender_threads,public.tender_thread_members,public.tender_thread_posts,
 public.tender_profile_guestbook,public.tender_piece_tags,public.tender_safety_reports FROM PUBLIC,anon;
GRANT SELECT ON public.tender_threads,public.tender_thread_members TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.tender_thread_posts,public.tender_profile_guestbook TO authenticated;
GRANT SELECT,INSERT,UPDATE ON public.tender_piece_tags TO authenticated;
GRANT SELECT,INSERT ON public.tender_safety_reports TO authenticated;

-- Don't let arbitrary clients advertise another Piece's tag via direct profile update.
-- Validates every attempted profile update, regardless of call path.
CREATE OR REPLACE FUNCTION public.tender_guard_equipped_tag()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $tender$
BEGIN
 IF NEW.equipped_piece_id IS NOT NULL AND NOT EXISTS(
  SELECT 1 FROM public.tender_piece_tags tag
  JOIN public.piece_members member ON member.piece_id=tag.piece_id
  WHERE tag.piece_id=NEW.equipped_piece_id AND member.user_id=NEW.id
 ) THEN RAISE EXCEPTION 'You must belong to that Piece before equipping its tag'; END IF;
 RETURN NEW;
END;
$tender$;
DROP TRIGGER IF EXISTS tender_guard_equipped_tag_trigger ON public.profiles;
CREATE TRIGGER tender_guard_equipped_tag_trigger BEFORE INSERT OR UPDATE OF equipped_piece_id ON public.profiles
 FOR EACH ROW EXECUTE FUNCTION public.tender_guard_equipped_tag();


-- Mutual friends shown in a pending DM request without exposing the sender's
-- complete friendship graph to unrelated Tender users.
CREATE OR REPLACE FUNCTION public.tender_mutual_friends(other_id uuid)
RETURNS TABLE(friend_id uuid,display_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $tender$
 WITH mine AS (
  SELECT CASE WHEN f.requester=auth.uid() THEN f.recipient ELSE f.requester END friend_id
  FROM public.friendships f
  WHERE f.status='accepted' AND auth.uid() IN(f.requester,f.recipient)
 ), theirs AS (
  SELECT CASE WHEN f.requester=other_id THEN f.recipient ELSE f.requester END friend_id
  FROM public.friendships f
  WHERE f.status='accepted' AND other_id IN(f.requester,f.recipient)
 )
 SELECT p.id,p.display_name
 FROM mine JOIN theirs USING(friend_id)
 JOIN public.profiles p ON p.id=mine.friend_id
 WHERE other_id<>auth.uid()
  AND EXISTS(SELECT 1 FROM public.tender_dm_requests req
    WHERE (req.recipient_id=auth.uid() AND req.sender_id=other_id)
       OR (req.sender_id=auth.uid() AND req.recipient_id=other_id))
 ORDER BY p.display_name LIMIT 12;
$tender$;
REVOKE ALL ON FUNCTION public.tender_mutual_friends(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.tender_mutual_friends(uuid) TO authenticated;

COMMIT;
