# Tender 0.4.2 — Channels & Layout

**Release type:** BUG FIX + UI UPDATE  
**Date:** 2026-10-18

## Fixed
- Piece owners and moderators always see the **Create channel** action, even if backend setup is missing. The app now explains the migration prerequisite instead of silently hiding the button.
- Channel creation accepts human-readable names such as `General Chat` and safely converts them to lowercase slugs (`general-chat`). The browser no longer silently blocks submissions containing spaces or capitals.
- Duplicate channel names produce a clear, actionable error before calling the backend.
- New channel inserts check the returned database ID and refresh the server-backed channel list before claiming success.
- Individual channel categories now have a **+** shortcut that opens creation with the category prefilled.
- The chat composer identifies the selected channel.

## UI improvements
- More compact Discord-inspired rails, member/sidebar regions, channel categories, channel rows, top toolbar, composer, and messages.
- Piece chat now uses a slim tab row instead of devoting a large part of the conversation to an oversized Piece banner.
- Tender's mascot, orange accent and existing personalization features remain intact.
- Mobile layout remains separately responsive.

## Important: Supabase setup
The channel UI is served by GitHub Pages, but channels are persisted in **Supabase**. Publishing these HTML/CSS/JS files does **not** install or migrate database tables.

If the Create Channel button says the channel database is unavailable:
1. Open the Supabase dashboard for your Tender project.
2. Go to **SQL Editor** and run the repository's existing [`migration_0_4.sql`](migration_0_4.sql) once, if it has not already been applied.
3. Confirm it completed without errors, then reload Tender.
4. Try a new channel, refresh, and check that the channel still appears.

Only the Piece owner or an assigned moderator can create channels; all channel changes still follow Supabase RLS policies. Do not put admin or service-role keys in frontend files.

## Smoke-test checklist
- Open an owned Piece; click the **+** next to Channels; create `General Chat`.
- Verify that `#general-chat` appears, is selected, and remains after a page reload.
- Use the **+** beside a category to create a channel in that category.
- Try creating a channel with an existing name; see a clear error.
- Switch between channels; verify independent history and composer context.
- Verify DM, Piece settings, profile gradients, calls, and mobile view are still accessible.

**Validation performed before publish:** JavaScript parses successfully and the code changes were checked statically. Live end-to-end Supabase and browser acceptance tests require a logged-in Tender session and have **not** been performed here.
