# 🍗 Tender 0.2 — The Crispy Update

**Release category: MAJOR UPDATE**  
GitHub Pages: https://fyrix341.github.io/Tender/

The existing Tender accounts, DMs, groups, Pieces, and data remain in the same Supabase project. `config.js` is unchanged.

## Install the database upgrade (required for new features)

1. Log in to your existing Supabase Tender project.
2. Go to **SQL Editor → New query**.
3. Open [migration_0_2.sql](migration_0_2.sql) on GitHub and **copy the entire file**.
4. Paste it into Supabase SQL Editor and click **Run once**. Expect “Success. No rows returned” if all statements completed.
5. Refresh Tender after your GitHub Pages update completes. Use **Ctrl+Shift+R** if necessary.
6. Test sign-in with your two existing accounts; send messages, react, upload avatars and images, and test the new profile settings.

**Do NOT run the original `schema.sql` again.** The 0.2 migration uses `ALTER TABLE` and new tables/policies to preserve your existing data.

If the migration fails, copy the **full database error with the line number** into the conversation. Do not paste passwords, tokens, database URI credentials, or secret keys.

## New features in this build

- Avatar upload uses unique filenames to avoid an upsert/overwrite RLS conflict.
- Optimistic chat sending (instant pending bubble), immediate local reaction toggles, realtime subscription refreshes.
- Inline image/GIF attachment previews, audio player for voice notes, PDF file cards, 5 MB upload limit.
- Profile banners, theme presets, accent colors, animated profile options, emoji statuses and privacy/notification settings.
- Unread badges, notification inbox, Chrome/browser notification permission while the page is open, optional sounds/tone presets.
- Reply-to, edit, forward **text**, pin, bookmark and search messages; optional read receipts and broadcast typing indicators.
- Emoji picker, personal and Piece emoji uploads, standalone oversized emoji stickers, direct GIPHY/Tenor media GIF link embeds.
- Chat polls with votes; Piece event schedule, owner-customizable banner/icon/layout/welcome message, forum tags/pin/lock.
- Core Piece owner/moderator/member permissions, assignable decorative community labels and basic block/unblock controls.
- Responsive desktop/mobile UI, improved feedback, accessible reduced-motion preference.

## Limitations (important)

This is a **beta**, not Discord-scale production infrastructure. Backend feature behavior needs live testing after the migration.

- **Background push when Chrome is fully closed is NOT implemented.** Browser notifications are available while Tender is open in a tab and permission is granted. Real closed-browser push requires service workers, VAPID and a secure notification sender.
- **GIF search is NOT integrated.** Use a direct GIPHY/Tenor media link; no GIF API key is required.
- **Emoji picker is curated, not the complete Unicode standard.** Unicode emojis can also be typed with your system picker; uploaded shortcodes work in chat.
- Custom Piece role labels are decorative; **server-checked Moderator/Member** roles provide actual elevated permissions.
- **True zero-delay across devices cannot be guaranteed.** Optimistic UI is immediate; network propagation depends on Supabase connection and latency.
- Custom uploads and voice notes use Supabase Storage free tier. File limits and public media exposure apply.
- Notifications for earlier messages are not retroactively backfilled; new notifications arrive after the migration.
- New `user_blocks` enforcement prevents blocked DMs; signed-in users can still browse public Pieces.
- Reports, comprehensive anti-spam, automated content moderation, child-safety enforcement, and legal/privacy policies need more development before public promotion.

## Technical architecture

Static HTML/CSS/JavaScript on free GitHub Pages; Supabase Auth, PostgreSQL with row-level security, Storage and Realtime. Only the **publishable** frontend key belongs in `config.js`; never put a secret or `service_role` key in the repo.

Official mascot: Buffalo 🍗
