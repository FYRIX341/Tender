# Tender 0.5 Alpha — CONTENT UPDATE 🍗

**Classification:** MAJOR UPDATE (alpha / phased rollout)  
**Date:** 2026-10-18  
**Mascot:** Buffalo

## What's included

- **DM requests & safety:** Non-friends can reach you according to your privacy setting. An inbox appears beside Friends *only while requests are pending*. Includes previews, mutual friends, shared Pieces, link warnings, Accept, Decline, Decline All, Block and Report. Sender cooldown and privacy checks are enforced by SQL.
- **DM privacy controls:** Open DMs, requests required, friends only, or nobody.
- **Messaging:** Emoji shortcodes like `:sob:` and classic emoticons like `:)`; inline `(edited)` label; uploaded custom image/emoji stickers; clickable pinned-messages panel; message translations using the on-device browser Translator API when supported, otherwise an opt-in external translation link.
- **HTML/CSS embeds:** Code editor with live preview and safe `sandbox=""` iframe rendering. Scripts, outbound requests, forms, external media, and top-frame navigation are denied in embeds. Interactive embeds remain **a separate future project**.
- **Threads:** Public discussion threads and **invite-only private threads**, including real row-level security and thread replies.
- **Profile Studio 2.0:** Dedicated editor navigation, solid-color/gradient/image banners (with separate username gradients), drag-and-drop text widgets, layout presets, free Piece Tags and a moderated guestbook.
- **Pieces:** Forum channels, announcements restricted to Piece moderators, welcome/onboarding screen on first join, theme customization, user presence indicators and configurable server-enforced slow mode (0–120 seconds).
- **Calls:** Draggable 1:1 call window and size toggle. Existing 1:1 WebRTC voice/video/screen share, mic/deafen and per-person audio controls are preserved.
- **Global appearance:** Full Tender theme presets including a light palette with dark text.
- **Account options:** Reversible deactivation on next sign-in; deletion requests with a 30-day cancellation period and an honest frozen-account screen. A limited **account snapshot** export is available.

## Not part of this alpha

- **Group voice channels / Stage voice with real simultaneous participants**. These need a supported multi-user media architecture (typically an SFU, TURN, robust signaling and moderation). The existing 1:1 calling engine is not equivalent.
- **Bots and developer dashboard** (`tender.oops.wtf/dev/dashboard`): possible separate 0.5.5/0.6 project; NOT confirmed or launched.
- **Interactive HTML/JavaScript embeds**: NOT included. Script execution in public messages is not safe without a separate tightly sandboxed integration.
- **Automatic permanent deletion of Supabase Auth accounts**: NOT deployed. Current deletion flow records and freezes requests. A separate privileged data-retention/cleanup service must be implemented and tested before claiming automatic erasure.
- **Comprehensive automated moderation or ML scam detection**: current suspicious request hints detect links, and reports are stored. Human review infrastructure is still needed.
- **Cross-service real-time translation**: not implemented without explicit consent; on-device API support depends on browser.
- **Full-profile data export:** the current snapshot excludes historical message and storage contents; the UI states this limitation.

## Applying the database update

1. Back up your live Supabase project.
2. Verify the Supabase project URL in `config.js` matches the project opened in the dashboard.
3. Ensure older Tender migrations (including 0.2, 0.4 and 0.4.1) were applied.
4. Open **Supabase → SQL Editor**, paste **[migration_0_5.sql](migration_0_5.sql)**, and run it **once**. The file is written as an additive transaction using `BEGIN`/`COMMIT` with guards where possible.
5. A successful SQL Editor run may say **“Success. No rows returned.”** That's normal for schema migration.
6. Hard refresh Tender (Ctrl+Shift+R). Settings → Privacy & Safety should now show DM policy, the Profile Studio should show banner styles, and account management will have lifecycle controls.
7. Test with **two separate test accounts** before asking friends to use it. Especially test a non-friend DM request, rejection, block, private thread privacy, slow mode and a forum channel.
8. If the SQL Editor reports any error, **stop** and share the exact error; don't blindly rerun all of `schema.sql` or change RLS policies.

**The GitHub frontend cannot run SQL migrations on the user's Supabase database.** Unapplied 0.5 database features deliberately remain hidden, while older chat functions keep working.

## Security and release caveats

- Untrusted HTML is embedded in a scriptless, opaque-origin sandbox with a restrictive CSP. Never allow arbitrary user code directly into Tender's main page.
- PostgreSQL RLS, RPC authorization and server-side messaging rate limits matter more than UI-only checks.
- Historical uploaded banner pictures are preserved by default in the 0.5 migration.
- Data deletion is a sensitive backend operation; do not use a service-role key in `config.js`, browser storage or public code.
- Manual SQL execution and authenticated end-to-end smoke testing remain required before calling the rollout production-ready.

## Source tests

Run `node tests/tender05-smoke.cjs` to verify JavaScript parsing, supported emoji conversion, safe embed containers, image sticker path validation, script loading order, the 0.4.6 Create Channel fix and basic migration structure. This test does **not** replace a real Supabase database migration test.
