-- Tender 0.3.2: additive profile pronouns. Existing user data is preserved.
-- Never store passwords or credentials in public.profiles.
BEGIN;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pronouns text NOT NULL DEFAULT '';
DO $tender$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname='tender_profile_pronouns_length'
      AND conrelid='public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT tender_profile_pronouns_length
      CHECK (char_length(pronouns) <= 40);
  END IF;
END $tender$;
COMMENT ON COLUMN public.profiles.pronouns IS 'Optional publicly shown self-supplied profile pronouns (40 characters max)';
COMMIT;
