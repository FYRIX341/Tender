-- Tender 0.3.3: non-destructive native replies inside Pieces.
-- Existing Piece messages remain unchanged; newly added reply_to is nullable.
BEGIN;
ALTER TABLE public.piece_messages ADD COLUMN IF NOT EXISTS reply_to uuid;
DO $tender$
BEGIN
 IF NOT EXISTS (
   SELECT 1 FROM pg_constraint WHERE conname='tender_piece_message_reply_fk'
   AND conrelid='public.piece_messages'::regclass
 ) THEN
  ALTER TABLE public.piece_messages
    ADD CONSTRAINT tender_piece_message_reply_fk
    FOREIGN KEY(reply_to) REFERENCES public.piece_messages(id) ON DELETE SET NULL;
 END IF;
END $tender$;
CREATE INDEX IF NOT EXISTS tender_piece_reply_target_idx
 ON public.piece_messages(reply_to) WHERE reply_to IS NOT NULL;

-- Prevent forged replies pointing to a message in another community.
CREATE OR REPLACE FUNCTION public.tender_validate_piece_reply()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $body$
BEGIN
 IF NEW.reply_to IS NOT NULL AND NOT EXISTS (
   SELECT 1 FROM public.piece_messages
   WHERE id=NEW.reply_to AND piece_id=NEW.piece_id
 ) THEN
   RAISE EXCEPTION 'Reply must reference a message in the same Piece';
 END IF;
 RETURN NEW;
END;
$body$;
DROP TRIGGER IF EXISTS tender_validate_piece_reply_trigger ON public.piece_messages;
CREATE TRIGGER tender_validate_piece_reply_trigger
 BEFORE INSERT OR UPDATE OF reply_to,piece_id ON public.piece_messages
 FOR EACH ROW EXECUTE FUNCTION public.tender_validate_piece_reply();
COMMIT;
