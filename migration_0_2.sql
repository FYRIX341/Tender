-- Tender 0.2 - additive migration. Run once in Supabase SQL Editor after schema.sql.
-- Existing accounts, conversations, messages and Pieces are preserved.
BEGIN;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status_emoji text NOT NULL DEFAULT '🍗';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS presence_mode text NOT NULL DEFAULT 'online' CHECK (presence_mode IN ('online','idle','dnd','invisible'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accent_color text NOT NULL DEFAULT '#f47735' CHECK (accent_color ~ '^#[0-9a-fA-F]{6}$');
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_effect text NOT NULL DEFAULT 'none' CHECK (profile_effect IN ('none','glow','float','sparkle'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chat_theme text NOT NULL DEFAULT 'dark' CHECK (chat_theme IN ('dark','light','midnight','cozy'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_mode text NOT NULL DEFAULT 'all' CHECK (notification_mode IN ('all','mentions','none'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_sound boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_tone text NOT NULL DEFAULT 'pop' CHECK(notification_tone IN ('pop','chime','soft'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allow_dm_requests boolean NOT NULL DEFAULT false;

ALTER TABLE public.pieces ADD COLUMN IF NOT EXISTS banner_url text;
ALTER TABLE public.pieces ADD COLUMN IF NOT EXISTS layout_style text NOT NULL DEFAULT 'classic' CHECK (layout_style IN ('classic','cards','compact'));
ALTER TABLE public.pieces ADD COLUMN IF NOT EXISTS welcome_text text NOT NULL DEFAULT '' CHECK (char_length(welcome_text)<=500);
ALTER TABLE public.piece_posts ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.piece_posts ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false;
ALTER TABLE public.piece_posts ADD COLUMN IF NOT EXISTS locked boolean NOT NULL DEFAULT false;

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edited_at timestamptz;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to uuid REFERENCES public.messages(id) ON DELETE SET NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS poll_id uuid;

CREATE TABLE IF NOT EXISTS public.conversation_reads (
 conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 last_read_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (conversation_id,user_id)
);
ALTER TABLE public.conversation_reads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reads view" ON public.conversation_reads;
CREATE POLICY "reads view" ON public.conversation_reads FOR SELECT TO authenticated USING (public.is_chat_member(conversation_id));
DROP POLICY IF EXISTS "reads insert own" ON public.conversation_reads;
CREATE POLICY "reads insert own" ON public.conversation_reads FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND public.is_chat_member(conversation_id));
DROP POLICY IF EXISTS "reads update own" ON public.conversation_reads;
CREATE POLICY "reads update own" ON public.conversation_reads FOR UPDATE TO authenticated USING (user_id=auth.uid() AND public.is_chat_member(conversation_id)) WITH CHECK (user_id=auth.uid() AND public.is_chat_member(conversation_id));

CREATE TABLE IF NOT EXISTS public.notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
 kind text NOT NULL CHECK (kind IN ('message','friend','mention')),
 conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
 piece_id uuid REFERENCES public.pieces(id) ON DELETE CASCADE,
 body text NOT NULL DEFAULT '',
 is_read boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tender_notifications_user_idx ON public.notifications(user_id,is_read,created_at DESC);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications own read" ON public.notifications;
CREATE POLICY "notifications own read" ON public.notifications FOR SELECT TO authenticated USING (user_id=auth.uid());
DROP POLICY IF EXISTS "notifications own update" ON public.notifications;
CREATE POLICY "notifications own update" ON public.notifications FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
-- No client INSERT/DELETE policies: notifications only come from trusted database triggers.
CREATE OR REPLACE FUNCTION public.notify_tender_message() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 INSERT INTO public.notifications(user_id,actor_id,kind,conversation_id,body)
 SELECT cm.user_id, NEW.author_id, 'message', NEW.conversation_id, left(NEW.body,160)
 FROM public.conversation_members cm WHERE cm.conversation_id=NEW.conversation_id AND cm.user_id<>NEW.author_id;
 RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS tender_message_notification ON public.messages;
CREATE TRIGGER tender_message_notification AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_tender_message();
CREATE OR REPLACE FUNCTION public.notify_tender_friend() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NEW.status='pending' THEN
 INSERT INTO public.notifications(user_id,actor_id,kind,body) VALUES(NEW.recipient,NEW.requester,'friend','New friend request');
 END IF;
 RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS tender_friend_notification ON public.friendships;
CREATE TRIGGER tender_friend_notification AFTER INSERT ON public.friendships FOR EACH ROW EXECUTE FUNCTION public.notify_tender_friend();

CREATE TABLE IF NOT EXISTS public.polls (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
 author_id uuid NOT NULL REFERENCES public.profiles(id),
 question text NOT NULL CHECK (char_length(trim(question)) BETWEEN 3 AND 200),
 options jsonb NOT NULL CHECK(jsonb_typeof(options)='array' AND jsonb_array_length(options) BETWEEN 2 AND 6),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.poll_votes (
 poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 option_index integer NOT NULL CHECK (option_index BETWEEN 0 AND 5),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (poll_id,user_id)
);
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='tender_message_poll_fk' AND conrelid='public.messages'::regclass) THEN
  ALTER TABLE public.messages ADD CONSTRAINT tender_message_poll_fk FOREIGN KEY (poll_id) REFERENCES public.polls(id) ON DELETE SET NULL;
 END IF;
END $$;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "poll view" ON public.polls;
CREATE POLICY "poll view" ON public.polls FOR SELECT TO authenticated USING(public.is_chat_member(conversation_id));
DROP POLICY IF EXISTS "poll create" ON public.polls;
CREATE POLICY "poll create" ON public.polls FOR INSERT TO authenticated WITH CHECK(author_id=auth.uid() AND public.is_chat_member(conversation_id));
DROP POLICY IF EXISTS "poll votes view" ON public.poll_votes;
CREATE POLICY "poll votes view" ON public.poll_votes FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.polls p WHERE p.id=poll_id AND public.is_chat_member(p.conversation_id)));
DROP POLICY IF EXISTS "poll votes create" ON public.poll_votes;
CREATE POLICY "poll votes create" ON public.poll_votes FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.polls p WHERE p.id=poll_id AND public.is_chat_member(p.conversation_id) AND option_index<jsonb_array_length(p.options)));
DROP POLICY IF EXISTS "poll votes change" ON public.poll_votes;
CREATE POLICY "poll votes change" ON public.poll_votes FOR UPDATE TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.polls p WHERE p.id=poll_id AND public.is_chat_member(p.conversation_id) AND option_index<jsonb_array_length(p.options)));

CREATE TABLE IF NOT EXISTS public.bookmarks (
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,message_id)
);
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bookmark view own" ON public.bookmarks;
CREATE POLICY "bookmark view own" ON public.bookmarks FOR SELECT TO authenticated USING(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.messages m WHERE m.id=message_id AND public.is_chat_member(m.conversation_id)));
DROP POLICY IF EXISTS "bookmark insert own" ON public.bookmarks;
CREATE POLICY "bookmark insert own" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.messages m WHERE m.id=message_id AND public.is_chat_member(m.conversation_id)));
DROP POLICY IF EXISTS "bookmark delete own" ON public.bookmarks;
CREATE POLICY "bookmark delete own" ON public.bookmarks FOR DELETE TO authenticated USING(user_id=auth.uid());

CREATE TABLE IF NOT EXISTS public.custom_emojis (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 piece_id uuid REFERENCES public.pieces(id) ON DELETE CASCADE,
 shortcode text NOT NULL CHECK(shortcode ~ '^[a-z0-9_]{2,24}$'),
 image_path text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(owner_id,shortcode,piece_id)
);
ALTER TABLE public.custom_emojis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "emojis see" ON public.custom_emojis;
CREATE POLICY "emojis see" ON public.custom_emojis FOR SELECT TO authenticated USING (piece_id IS NULL OR public.can_view_piece(piece_id));
DROP POLICY IF EXISTS "emojis add own" ON public.custom_emojis;
CREATE POLICY "emojis add own" ON public.custom_emojis FOR INSERT TO authenticated WITH CHECK(owner_id=auth.uid() AND (piece_id IS NULL OR EXISTS(SELECT 1 FROM public.pieces p WHERE p.id=piece_id AND p.owner_id=auth.uid())));
DROP POLICY IF EXISTS "emojis delete own" ON public.custom_emojis;
CREATE POLICY "emojis delete own" ON public.custom_emojis FOR DELETE TO authenticated USING(owner_id=auth.uid());

CREATE TABLE IF NOT EXISTS public.user_blocks (
 blocker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 blocked_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(blocker_id,blocked_id),
 CHECK(blocker_id<>blocked_id)
);
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "blocks own list" ON public.user_blocks;
CREATE POLICY "blocks own list" ON public.user_blocks FOR SELECT TO authenticated USING(blocker_id=auth.uid());
DROP POLICY IF EXISTS "blocks own create" ON public.user_blocks;
CREATE POLICY "blocks own create" ON public.user_blocks FOR INSERT TO authenticated WITH CHECK(blocker_id=auth.uid());
DROP POLICY IF EXISTS "blocks own delete" ON public.user_blocks;
CREATE POLICY "blocks own delete" ON public.user_blocks FOR DELETE TO authenticated USING(blocker_id=auth.uid());
-- DM sends are stopped if either participant blocks the other.
CREATE OR REPLACE FUNCTION public.can_send_tender_dm(cid uuid, uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
SELECT uid=auth.uid() AND NOT EXISTS (
 SELECT 1 FROM public.conversations c JOIN public.conversation_members cm ON cm.conversation_id=c.id
 JOIN public.user_blocks b ON (b.blocker_id=cm.user_id AND b.blocked_id=uid) OR (b.blocker_id=uid AND b.blocked_id=cm.user_id)
 WHERE c.id=cid AND c.kind='dm'
);
$$;
DROP POLICY IF EXISTS "messages send own" ON public.messages;
CREATE POLICY "messages send own" ON public.messages FOR INSERT TO authenticated WITH CHECK (
 author_id=auth.uid() AND public.is_chat_member(conversation_id)
 AND public.can_send_tender_dm(conversation_id,auth.uid())
);

CREATE OR REPLACE FUNCTION public.can_tender_friend(a uuid,b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
SELECT a=auth.uid() AND NOT EXISTS(SELECT 1 FROM public.user_blocks WHERE (blocker_id=a AND blocked_id=b) OR (blocker_id=b AND blocked_id=a)); $$;
REVOKE ALL ON FUNCTION public.can_tender_friend(uuid,uuid) FROM public,anon;
GRANT EXECUTE ON FUNCTION public.can_tender_friend(uuid,uuid) TO authenticated;
DROP POLICY IF EXISTS "friendships request" ON public.friendships;
CREATE POLICY "friendships request" ON public.friendships FOR INSERT TO authenticated WITH CHECK(requester=auth.uid() AND status='pending' AND public.can_tender_friend(requester,recipient));

CREATE TABLE IF NOT EXISTS public.piece_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 piece_id uuid NOT NULL REFERENCES public.pieces(id) ON DELETE CASCADE,
 creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 title text NOT NULL CHECK(char_length(trim(title)) BETWEEN 3 AND 100),
 description text NOT NULL DEFAULT '' CHECK(char_length(description)<=500),
 starts_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.piece_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events view" ON public.piece_events;
CREATE POLICY "events view" ON public.piece_events FOR SELECT TO authenticated USING(public.can_view_piece(piece_id));
DROP POLICY IF EXISTS "events create" ON public.piece_events;
CREATE POLICY "events create" ON public.piece_events FOR INSERT TO authenticated WITH CHECK(creator_id=auth.uid() AND public.is_piece_mod(piece_id));
DROP POLICY IF EXISTS "events delete" ON public.piece_events;
CREATE POLICY "events delete" ON public.piece_events FOR DELETE TO authenticated USING(public.is_piece_mod(piece_id));

-- Only a Piece owner can assign core Moderator/Member permissions.
CREATE OR REPLACE FUNCTION public.set_piece_member_role(pid uuid, uid uuid, new_role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.pieces WHERE id=pid AND owner_id=auth.uid()) THEN RAISE EXCEPTION 'Only the owner can manage permissions'; END IF;
 IF new_role NOT IN ('member','moderator') THEN RAISE EXCEPTION 'Invalid member role'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.piece_members WHERE piece_id=pid AND user_id=uid AND role<>'owner') THEN RAISE EXCEPTION 'Member not found'; END IF;
 UPDATE public.piece_members SET role=new_role WHERE piece_id=pid AND user_id=uid;
END; $$;
REVOKE ALL ON FUNCTION public.set_piece_member_role(uuid,uuid,text) FROM public,anon;
GRANT EXECUTE ON FUNCTION public.set_piece_member_role(uuid,uuid,text) TO authenticated;

-- Custom Piece roles are community labels; core moderator/member authority is server-enforced.
CREATE TABLE IF NOT EXISTS public.piece_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 piece_id uuid NOT NULL REFERENCES public.pieces(id) ON DELETE CASCADE,
 name text NOT NULL CHECK(char_length(trim(name)) BETWEEN 2 AND 32),
 color text NOT NULL DEFAULT '#f47735' CHECK(color ~ '^#[0-9a-fA-F]{6}$'),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.piece_role_assignments (
 role_id uuid NOT NULL REFERENCES public.piece_roles(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 PRIMARY KEY(role_id,user_id)
);
ALTER TABLE public.piece_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piece_role_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "piece roles view" ON public.piece_roles;
CREATE POLICY "piece roles view" ON public.piece_roles FOR SELECT TO authenticated USING(public.can_view_piece(piece_id));
DROP POLICY IF EXISTS "piece roles manage" ON public.piece_roles;
CREATE POLICY "piece roles manage" ON public.piece_roles FOR ALL TO authenticated USING(EXISTS(SELECT 1 FROM public.pieces p WHERE p.id=piece_id AND p.owner_id=auth.uid())) WITH CHECK(EXISTS(SELECT 1 FROM public.pieces p WHERE p.id=piece_id AND p.owner_id=auth.uid()));
DROP POLICY IF EXISTS "piece role assignments see" ON public.piece_role_assignments;
CREATE POLICY "piece role assignments see" ON public.piece_role_assignments FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.piece_roles r WHERE r.id=role_id AND public.can_view_piece(r.piece_id)));
DROP POLICY IF EXISTS "piece role assignments manage" ON public.piece_role_assignments;
CREATE POLICY "piece role assignments manage" ON public.piece_role_assignments FOR ALL TO authenticated USING(EXISTS(SELECT 1 FROM public.piece_roles r JOIN public.pieces p ON p.id=r.piece_id JOIN public.piece_members m ON m.piece_id=p.id WHERE r.id=role_id AND p.owner_id=auth.uid() AND m.user_id=public.piece_role_assignments.user_id)) WITH CHECK(EXISTS(SELECT 1 FROM public.piece_roles r JOIN public.pieces p ON p.id=r.piece_id JOIN public.piece_members m ON m.piece_id=p.id WHERE r.id=role_id AND p.owner_id=auth.uid() AND m.user_id=public.piece_role_assignments.user_id));

-- Only authors can change text/replies; owners/mods may toggle pinned content.
DROP POLICY IF EXISTS "messages edit own" ON public.messages;
CREATE POLICY "messages edit own" ON public.messages FOR UPDATE TO authenticated USING(author_id=auth.uid() AND public.is_chat_member(conversation_id)) WITH CHECK(author_id=auth.uid() AND public.is_chat_member(conversation_id));
DROP POLICY IF EXISTS "posts update moderator" ON public.piece_posts;
CREATE POLICY "posts update moderator" ON public.piece_posts FOR UPDATE TO authenticated USING(public.is_piece_mod(piece_id) OR author_id=auth.uid()) WITH CHECK(public.is_piece_mod(piece_id) OR author_id=auth.uid());

-- Tighten client-owned notification mutation: a user may only mark read, not forge content.
CREATE OR REPLACE FUNCTION public.mark_tender_notifications_read(cid uuid DEFAULT NULL, pid uuid DEFAULT NULL, include_friends boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
 UPDATE public.notifications SET is_read=true WHERE user_id=auth.uid() AND is_read=false
 AND ((cid IS NOT NULL AND conversation_id=cid AND public.is_chat_member(cid)) OR (pid IS NOT NULL AND piece_id=pid AND public.can_view_piece(pid)) OR (include_friends AND kind='friend'));
END; $$;
REVOKE ALL ON FUNCTION public.mark_tender_notifications_read(uuid,uuid,boolean) FROM public,anon;
GRANT EXECUTE ON FUNCTION public.mark_tender_notifications_read(uuid,uuid,boolean) TO authenticated;
DROP POLICY IF EXISTS "notifications own update" ON public.notifications;
-- no client UPDATE policy: mutations go through the authenticated RPC above.

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES
 ('tender-banners','tender-banners',true,3145728,ARRAY['image/png','image/jpeg','image/webp']),
 ('tender-emoji','tender-emoji',true,262144,ARRAY['image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
DROP POLICY IF EXISTS "banner upload own" ON storage.objects;
CREATE POLICY "banner upload own" ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='tender-banners' AND split_part(name,'/',1)=auth.uid()::text);
DROP POLICY IF EXISTS "emoji upload own" ON storage.objects;
CREATE POLICY "emoji upload own" ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='tender-emoji' AND split_part(name,'/',1)=auth.uid()::text);
UPDATE storage.buckets SET allowed_mime_types=ARRAY['image/png','image/jpeg','image/webp','image/gif','application/pdf','audio/webm','audio/ogg','audio/mp4','audio/mpeg'] WHERE id='tender-chat';

-- Realtime: users only receive rows they are allowed to select through RLS.
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_reads; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.piece_events; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
COMMIT;