# Tender 0.5.1 — DM & Emoji Sending Hotfix 🍗

**Classification:** BUG FIX  
**Date:** 2026-10-18

## Symptoms

After installing the Tender 0.5 database migration, sending a DM or group message (including `:sob:`, `:fire:` and other emoji shortcodes) can fail with:

```
record "new" has no field "piece_id"
```

This is **not caused by the emoji codes**; ordinary DM text is affected as well.

## Root cause

The shared `tender_guard_message_rate()` PostgreSQL trigger is installed on both `messages` (DMs/groups) and `piece_messages` (Piece channels). Its slow-mode condition combined `TG_TABLE_NAME='piece_messages'` with `public.is_piece_mod(NEW.piece_id)` in the same boolean expression. PostgreSQL is not required to short-circuit this condition, so even a `messages` record (which has no `piece_id` column) can attempt to access that field.

## Fix

`IF TG_TABLE_NAME='piece_messages' THEN` now encloses all slow-mode references to `NEW.piece_id`. The function's other spam checks, DM privacy restrictions, blocking protections and Piece slow mode remain in place.

## For EXISTING Tender 0.5 databases

1. Open [migration_0_5_1.sql](migration_0_5_1.sql).
2. Copy all SQL into **Supabase → SQL Editor** in your Tender project.
3. Run it. **“Success. No rows returned”** is expected.
4. Send `:sob: :fire:` in a normal DM, then test an ordinary text DM and a Piece channel message.

Do **not** rerun `schema.sql` or the full 0.5 migration to address this issue.

For **fresh installs**, the original [migration_0_5.sql](migration_0_5.sql) has also been corrected; no additional 0.5.1 migration is needed after a fresh install using the revised script.

## Test coverage

The `tests/tender05-smoke.cjs` smoke suite now checks for the unsafe condition, ensures the hotfix has a properly nested Piece check, and asserts that the hotfix contains no data-destructive SQL. Browser tests and a live authenticated Supabase write are still required to confirm production behavior.

**No existing rows are dropped, truncated or deleted by the fix.**
