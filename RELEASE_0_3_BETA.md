# 🍗 Tender 0.3 — Night Shift (Private Beta)

**Status: PRE-RELEASE · NOT DEPLOYED TO THE PUBLIC TENDER WEBSITE**

Tender 0.3 is being developed on the branch `tender-0.3-private-beta`. Production remains on `main`. No database reset or schema migration is required for the changes in this preview.

## The chat repair (priority #1)

- Generate the message UUID on the client and use the **same ID** for optimistic display and the database insert, so realtime updates reconcile that row instead of duplicating it.
- Replace chat-wide redraws on realtime message events with targeted, keyed message-list reconciliation.
- Preserve an older-message scroll position; smooth-scroll **once** when you send; show a jump-to-latest pill when new messages arrive while you read older ones.
- Prevent async message loads from one conversation overwriting the currently selected conversation.
- Preserve a message's unsent draft separately for each conversation on the current device.
- Avoid resetting the UI shell on routine message notifications.

## Piece chat fixes

- Opening a Piece defaults to **Chat**, not Forum.
- The composer is anchored outside the scrollable Piece header instead of being pushed far below the fold.
- Empty Pieces show a clear chat placeholder and a Join button when needed.
- Realtime typing broadcasts also work in Piece chat for members.
- Public Pieces have shareable invitation links (the receiver must still be allowed to view/join the Piece).

## 0.3 visual refresh and personalization

- Compact, dark OLED-inspired three-column layout with Buffalo/Tender branding.
- Expandable navigation rail and hideable, width-adjustable members panel.
- Grouped author/message rows; subtle hover actions and timestamps.
- Compact composer; responsive mobile layout.
- Appearance Studio: density, font size, secondary accent, preset gradients, reduced effects, theme export/import.
- Device-local conversation wallpaper presets (clean, dots, grid, aurora), or an HTTPS image URL.
- Existing Supabase-backed profile colors, banners, effects, status, notification sounds and basic roles are preserved.

## Working feature additions in this branch

- Slash autocomplete: `/help`, `/roll`, `/coin`, `/shrug`, `/me`, `/tableflip`, `/poll`, `/gif`, `/search`, `/theme`, `/who`, `/trivia`, `/embed`.
- Private command feedback and an interactive mini-trivia round; `/roll` and `/coin` post their result as an ordinary chat message.
- @mention suggestions from current members.
- Structured rich announcements using `/embed` with author, hex color, title, thumbnail and footer (stored as normal message text).
- Advanced searchable messages with date, author, current-conversation and accessible-Piece filters.
- Explicit attachment upload / sending statuses (not fake percentage progress).
- Existing DMs, groups, attachment handling, reactions, basic polls, voices, bookmarks, profiles, events, custom emoji and Piece moderation tools are retained.

## Not complete / requires real backend work

These **have not been represented as functional production features**:

- Multiple independent persistent channels per Piece with configurable membership and permissions.
- Fully custom permission matrices, user-facing reaction-role panels and automated role rewards.
- Community XP/leveling, shared multiplayer mini-games, and cross-device leaderboards.
- Trustworthy server-side auto-moderation, tamper-resistant audit/staff logs, and a proper user-reporting and review queue.
- YouTube/RSS webhook relays (require secure backend workers and third-party integration).
- Private invitation links with configurable expiry/uses and reliable online presence.
- Fully independent threaded conversations for every Piece, message deletion undo, server-side profile privacy exceptions, and closed-browser push notifications.
- True fine-grained media upload percentages; Supabase's current simple upload call exposes stages rather than progress callbacks.

These must not be “faked” only in frontend code. They need separately reviewed schema/RLS/backend support and security testing before enabling on a social platform.

## Private beta testing checklist

- [ ] Sign in on two different accounts (do not use production secrets in test logs).
- [ ] Send 10 messages in a DM rapidly; ensure no duplicate messages and no repeating scroll-to-top animation.
- [ ] Read older DM messages while another account sends new ones; confirm the position stays still and jump pill works.
- [ ] Try a Piece with zero messages, then join and send a message from a permitted account.
- [ ] Check a narrow mobile display (keyboard open) and desktop layout.
- [ ] Try avatar/banner, attachments, poll, edit/delete, reaction, bookmark, typing and search to ensure 0.2 regression-free behavior.
- [ ] Switch conversations with two unsent drafts to confirm they don't leak into each other.
- [ ] Test `/embed`, `/help`, `/roll`, and @mentions.
- [ ] Review access controls (especially invite links and private Pieces) with a nonmember test account.

The GitHub Actions **Tender 0.3 Private Beta Checks** workflow runs JavaScript syntax and static/smoke checks and packages the site as the **Tender-0.3-private-beta** artifact for local evaluation. Successful CI does *not* replace real browser testing with authenticated Supabase accounts.

No production secrets, service role keys, or personal access tokens belong in this branch.

*Stay close. Stay crispy.* 🍗
