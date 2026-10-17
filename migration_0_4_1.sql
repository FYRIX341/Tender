-- Tender 0.4.1: free, separate name gradients; secure one-to-one WebRTC call signaling.
-- This migration is additive; existing accounts, messages and Pieces are untouched.
BEGIN;
ALTER TABLE public.profiles
 ADD COLUMN IF NOT EXISTS name_gradient_start text,
 ADD COLUMN IF NOT EXISTS name_gradient_end text;
-- Set the name gradient to the old colors once, so existing styled names do not change.
UPDATE public.profiles
 SET name_gradient_start=COALESCE(name_gradient_start,profile_gradient_start,'#21385d'),
     name_gradient_end=COALESCE(name_gradient_end,profile_gradient_end,'#563561')
 WHERE name_gradient_start IS NULL OR name_gradient_end IS NULL;

CREATE TABLE IF NOT EXISTS public.tender_call_sessions(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
 caller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 callee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 wants_video boolean NOT NULL DEFAULT false,
 status text NOT NULL DEFAULT 'ringing'
   CHECK(status IN ('ringing','active','declined','ended')),
 created_at timestamptz NOT NULL DEFAULT now(),
 last_heartbeat_at timestamptz NOT NULL DEFAULT now(),
 answered_at timestamptz,
 ended_at timestamptz,
 CHECK(caller_id <> callee_id)
);
CREATE INDEX IF NOT EXISTS tender_call_lookup_idx
 ON public.tender_call_sessions(callee_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS tender_call_caller_idx
 ON public.tender_call_sessions(caller_id,status,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS tender_active_call_per_conversation
 ON public.tender_call_sessions(conversation_id) WHERE status IN ('ringing','active');

CREATE TABLE IF NOT EXISTS public.tender_call_signals(
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 call_id uuid NOT NULL REFERENCES public.tender_call_sessions(id) ON DELETE CASCADE,
 sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN ('offer','answer','ice','screen-announcement','screen-stop')),
 payload jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(sender_id<>recipient_id),
 CHECK(octet_length(payload::text) < 100000)
);
CREATE INDEX IF NOT EXISTS tender_signals_receive_idx ON public.tender_call_signals(call_id,recipient_id,id);

ALTER TABLE public.tender_call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_call_signals ENABLE ROW LEVEL SECURITY;

-- Explicit API permissions: PostgreSQL RLS then narrows every read/write to call participants.
GRANT SELECT ON public.tender_call_sessions TO authenticated;
GRANT SELECT, INSERT ON public.tender_call_signals TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.tender_call_signals_id_seq TO authenticated;

DROP POLICY IF EXISTS "call sessions participating users" ON public.tender_call_sessions;
CREATE POLICY "call sessions participating users" ON public.tender_call_sessions
 FOR SELECT TO authenticated
 USING ((caller_id=auth.uid() OR callee_id=auth.uid())
        AND public.is_chat_member(conversation_id));
-- Start/accept/end are security checked server RPCs, not direct client writes.
REVOKE INSERT,UPDATE,DELETE ON public.tender_call_sessions FROM authenticated,anon;
DROP POLICY IF EXISTS "call signals recipient only" ON public.tender_call_signals;
CREATE POLICY "call signals recipient only" ON public.tender_call_signals
 FOR SELECT TO authenticated
 USING (recipient_id=auth.uid() AND EXISTS(
   SELECT 1 FROM public.tender_call_sessions c WHERE c.id=call_id
     AND (c.caller_id=auth.uid() OR c.callee_id=auth.uid())
     AND public.is_chat_member(c.conversation_id)
 ));
DROP POLICY IF EXISTS "call signals from participant" ON public.tender_call_signals;
CREATE POLICY "call signals from participant" ON public.tender_call_signals
 FOR INSERT TO authenticated
 WITH CHECK(sender_id=auth.uid() AND EXISTS(
   SELECT 1 FROM public.tender_call_sessions c WHERE c.id=call_id
      AND c.status='active'
      AND ((c.caller_id=auth.uid() AND c.callee_id=recipient_id)
        OR (c.callee_id=auth.uid() AND c.caller_id=recipient_id))
      AND public.is_chat_member(c.conversation_id)
 ));
REVOKE UPDATE, DELETE ON public.tender_call_signals FROM authenticated,anon;

CREATE OR REPLACE FUNCTION public.tender_start_call(cid uuid,peer uuid,video boolean DEFAULT false)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE caller uuid:=auth.uid(); result uuid; dm_kind text;
BEGIN
 IF caller IS NULL OR caller=peer OR NOT public.is_chat_member(cid) THEN
   RAISE EXCEPTION 'Not allowed to start this call';
 END IF;
 SELECT kind INTO dm_kind FROM public.conversations WHERE id=cid;
 IF dm_kind <> 'dm' OR NOT public.is_chat_member(cid,peer)
    OR (SELECT COUNT(*) FROM public.conversation_members WHERE conversation_id=cid)<>2 THEN
   RAISE EXCEPTION 'Tender 0.4.1 supports one-to-one DMs only';
 END IF;
 IF EXISTS(SELECT 1 FROM public.user_blocks WHERE (blocker_id=caller AND blocked_id=peer)
 OR (blocker_id=peer AND blocked_id=caller)) THEN
  RAISE EXCEPTION 'Calling is unavailable for this conversation';
 END IF;
 -- End abandoned sessions before creating another, without touching active calls.
 UPDATE public.tender_call_sessions
 SET status='ended',ended_at=now()
 WHERE conversation_id=cid AND (status='ringing' AND created_at<now()-interval '90 seconds'
   OR status='active' AND last_heartbeat_at<now()-interval '45 seconds');
 -- Clear abandoned active calls involving either member (the browser may have crashed).
 UPDATE public.tender_call_sessions
 SET status='ended',ended_at=now()
 WHERE status='active' AND last_heartbeat_at<now()-interval '45 seconds'
 AND (caller_id IN (caller,peer) OR callee_id IN (caller,peer));
 -- Rate-limit callers to one live/ringing call to avoid repeated notifications.
 IF EXISTS(SELECT 1 FROM public.tender_call_sessions
           WHERE (caller_id IN (caller,peer) OR callee_id IN (caller,peer))
             AND status IN ('ringing','active')) THEN
  RAISE EXCEPTION 'You are already in a call or waiting for an answer';
 END IF;
 INSERT INTO public.tender_call_sessions(conversation_id,caller_id,callee_id,wants_video)
 VALUES(cid,caller,peer,video) RETURNING id INTO result;
 RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.tender_answer_call(call_uuid uuid,accept boolean DEFAULT true)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE room public.tender_call_sessions%ROWTYPE;
BEGIN
 SELECT * INTO room FROM public.tender_call_sessions WHERE id=call_uuid FOR UPDATE;
 IF NOT FOUND OR room.callee_id<>auth.uid() OR room.status<>'ringing'
   OR NOT public.is_chat_member(room.conversation_id)
   OR room.created_at<now()-interval '90 seconds' THEN
   RAISE EXCEPTION 'Call is no longer ringing';
 END IF;
 UPDATE public.tender_call_sessions
 SET status=CASE WHEN accept THEN 'active' ELSE 'declined' END,
 answered_at=CASE WHEN accept THEN now() ELSE answered_at END,
 ended_at=CASE WHEN accept THEN ended_at ELSE now() END
 WHERE id=call_uuid;
 RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.tender_touch_call(call_uuid uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $
DECLARE room public.tender_call_sessions%ROWTYPE;
BEGIN
 SELECT * INTO room FROM public.tender_call_sessions WHERE id=call_uuid;
 IF NOT FOUND OR auth.uid() NOT IN (room.caller_id,room.callee_id)
   OR room.status<>'active' OR NOT public.is_chat_member(room.conversation_id) THEN
   RETURN false;
 END IF;
 UPDATE public.tender_call_sessions SET last_heartbeat_at=now() WHERE id=call_uuid;
 RETURN true;
END $;

CREATE OR REPLACE FUNCTION public.tender_end_call(call_uuid uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE room public.tender_call_sessions%ROWTYPE;
BEGIN
 SELECT * INTO room FROM public.tender_call_sessions WHERE id=call_uuid FOR UPDATE;
 IF NOT FOUND OR auth.uid() NOT IN (room.caller_id,room.callee_id)
     OR NOT public.is_chat_member(room.conversation_id) THEN
   RAISE EXCEPTION 'Not authorized';
 END IF;
 UPDATE public.tender_call_sessions SET status='ended',ended_at=now()
 WHERE id=call_uuid AND status IN ('ringing','active');
 DELETE FROM public.tender_call_signals WHERE call_id=call_uuid;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.tender_start_call(uuid,uuid,boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tender_answer_call(uuid,boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tender_end_call(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tender_touch_call(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tender_start_call(uuid,uuid,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tender_answer_call(uuid,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tender_end_call(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tender_touch_call(uuid) TO authenticated;
COMMIT;