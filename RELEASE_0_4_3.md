# Tender 0.4.3 — Channel Repair & Charcoal UI

**Classification:** BUG FIX + UI UPDATE  
**Date:** October 18, 2026

## Channel creation reliability
- Clicking **Create Channel** opens the editor even when the channel database is unavailable, instead of returning a short disappearing toast.
- Missing backend setup is explained inside the dialog, with a direct link to the existing SQL migration.
- The form shows **Checking channels**, **Creating**, and **Confirming saved** progress.
- Server failures, permission failures, duplicate names, and timeouts stay visible in a red error area below the form so nothing silently fails.
- The form remains open and usable after errors. Successful submissions are verified against the refreshed channel list.
- Channel names are normalized as before: `General Chat` becomes `general-chat`.
- Edit operations request an updated channel ID from Supabase, avoiding silent zero-row update success.
- Piece owners may open the form even if the frontend's member-role list is incomplete (the database still enforces permissions).

## Unified interface
- Prior CSS used `!important` black backgrounds on the server rail, conversation sidebar, header, and chat despite newer gray theme changes.
- New scoped overrides use Discord-like charcoal across **rail, sidebar, chat, composer, title bar, members panel, settings, and modal dialogs**.
- The composer is slightly lighter than the chat area, not a mismatched light box on black.
- Tender's orange personal accent, custom profile gradients, wallpapers, and light mode remain supported.
- Mobile-specific styles follow the same palette.

## Supabase prerequisite
Channels are stored in Supabase, not browser localStorage. **GitHub Pages cannot create the required database table or policies by itself.**

If you see the channel setup warning:
1. Open your Tender project in the Supabase dashboard.
2. Go to **SQL Editor**.
3. Open the repository's [`migration_0_4.sql`](migration_0_4.sql), copy its SQL, paste it into the editor and run it if you haven't already.
4. Reload the Tender website.
5. Open a Piece you own, click Channels **+**, enter `General Chat`, and create it. Refresh to verify persistence.

If SQL has already been applied but creation still fails, the modal should now show the exact database error. Check table permissions and the Piece owner/moderator role; do not put administrator keys into the public website.

## Validation
- Updated `app.js` parsed successfully.
- CSS braces verified balanced.
- Simulated **successful creation** stored normalized name `general-chat`, selected the returned channel, and displayed success.
- Simulated **duplicate** and **missing backend** scenarios showed persistent errors and did not claim success.
- Simulated the Create Channel button while backend was unavailable; verified the modal still opened with setup instructions.
- Live authenticated browser/database validation remains necessary; tests above use a mocked database.

**Release scope:** Existing accounts, messages, DMs, calls, and Piece records were not replaced or reset.
