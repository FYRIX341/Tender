# 🍗 Tender 0.4 — Communities Unleashed

**Release class: MAJOR UPDATE** · October 17, 2026

A big free customization and community upgrade, built directly on the existing Tender backend. **No account resets, no erased DMs or Piece histories, no new credentials.** Buffalo stays.

## 🧩 Pieces feel like communities

- **Piece icons in the left rail**: joined public/private communities appear as clickable icons underneath Tender's main navigation.
- **Unread indicators**: subtle white markers and red numbered badges for missed Piece activity, channel badges, and the existing DM unread counters.
- **Text and announcement channels**: each Piece gets a default **#general**, with a list of independently named channels organized into categories.
- Owners and moderators can **create and edit channels** with names, types, descriptions, categories and sort positions; owners can delete non-default channels.
- **Messages are truly assigned to their channel** on the backend—not merely hidden with a front-end filter.
- **Old Piece messages stay visible in #general** without rewriting or deleting past messages. If a custom channel is deleted, its messages are preserved in #general.
- Channel draft text is kept separate, including when switching channels mid-composition; an in-flight send cannot move to another channel.
- **Unread counts are stored per user and channel** in Supabase, so they survive page refresh and new sessions. Migration seeds existing #general as read to prevent thousands of old notifications.
- The old Forum, Gallery, Events, community banner, custom roles and Piece invite cards remain available.

## 🟢 Actual DM and group presence

- **Online / Idle / DND / Offline** dots appear on DM avatars.
- A group indicates **online when more members are connected than offline**; a tie is treated as offline.
- Presence uses an ephemeral authenticated Supabase Realtime room rather than assuming everyone whose profile says “Online” is actually connected.
- **Invisible** untracks you from other people's online indicators. Presence is connection-dependent; temporary network disruptions can affect results.
- The DM list remains compact and shows a white unread dot plus its unread badge.

## 👤 Better profiles, less friction

- Click a member's **avatar or display name** to open a compact profile popup—not the huge full profile.
- The mini card has real avatar, banner or gradient, username, availability, bio, custom status, message/friend actions, and **Full profile**.
- Full profiles remain accessible from the popup and right-hand DM panel.
- **FREE profile gradients**, with independent start/end colors.
- **FREE styled display names** with six font presets and Solid, Gradient, Neon and Shadow effects. Display-name effects are supported in the rendered full profile and name links.
- **FREE animated GIF avatars**, up to 2 MB; GIF files now use an updated existing avatar storage bucket.
- Piece owners can customize **Piece icon images including GIF (up to 3 MB), emoji icon, rounded/circular/square/squircle shape, two-color gradient, theme preset, name font, welcome message, banner, visibility and description**.
- Existing avatars, banners, Piece images and uploaded files are preserved.

## 😀 Every emoji, not thirty

- Bundled **3,963 fully-qualified Unicode 18.0 emoji sequences** (including flags, skin tones and ZWJ variants) from Unicode's official emoji test data. No external API key.
- Search, categories, Recent, custom emoji and sticker tab, plus paging in groups of 150 for smooth performance.
- The same complete emoji picker is available for **reactions** and the message composer.
- Exact glyph appearance depends on the user's OS/browser emoji font; newer glyphs may display as missing on old devices.
- GIF sharing remains available using supported direct GIPHY/Tenor media links; a full hosted GIF search service needs an external provider and is not claimed as implemented.

## 🔐 Upgrade details

An **additive, idempotent** `migration_0_4.sql` creates `piece_channels`, `piece_channel_reads`, the nullable channel link in `piece_messages`, profile/branding fields and updated MIME permissions for GIF uploads. Migration is automatically attempted by GitHub Actions using Tender's **existing scoped Supabase credential**. No one should paste API tokens into chat. Supabase RLS protects channel administration and read positions.

If the migration hasn't finished, the existing #general chat continues to work and Tender shows the legacy channel fallback; enhanced management and visual persistence activate after the migration succeeds.

### QA

Automated JavaScript syntax and regression tests cover previously working 0.3–0.3.5 conversations, replies, notifications, profiles and settings, plus Unicode catalog completeness, category search, majority presence, mini profiles, safe name styles, channel drafts, per-channel message assignment and non-destructive migration design.

**Limitations:** These tests do not replace two-account browser verification. Live calls, voice channels, unrestricted font-file uploads, Nitro billing, and managed GIF-provider search are **not** part of Tender 0.4.

**Stay close. Stay crispy.** 🍗🔥

Unicode emoji sequence data © Unicode, Inc. See https://www.unicode.org/terms_of_use.html.
