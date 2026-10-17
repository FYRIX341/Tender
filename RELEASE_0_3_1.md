# 🍗 Tender 0.3.1 — Night Shift: Profiles & Pieces

**Release type:** SMALL UPDATE · **October 17, 2026**

## New in 0.3.1

### 🖼️ Piece profile pictures
- Piece owners can upload PNG, JPG, or WEBP pictures (up to 3 MB).
- Open a Piece and select the **pencil on its avatar** or **Edit Piece** to update it.
- Preview the image before saving.
- Change the picture later, or choose **Use the emoji instead of a picture** to go back to an emoji.
- Image avatars appear consistently in the Piece list, Discover cards, and Piece header.
- New Pieces can also receive a custom picture immediately.

### 👤 Clickable member profiles
- Click user pictures or names in chat messages, Piece member lists, friend lists, forum posts and gallery items.
- The resulting profile card shows the name, handle, avatar, banner, bio, custom status, and available friend/message action.
- Clicking a DM counterpart's avatar or name in the conversation list opens their profile.
- These actions use the already authenticated Supabase profile data and its existing access policies.

## Still included from Tender 0.3

The dark compact messenger UI, fixed Piece chat composer, smoother scroll reconciliation, local theme studio, per-chat wallpaper options, slash shortcuts, search filters, chat draft saving and existing Tender 0.2 chat/Piece features remain.

## Database and safety

**No additional Supabase SQL migration or credentials are required.** Piece photos use the existing `tender-banners` storage bucket and the existing Piece icon column. The update keeps legacy emoji icons working; only a Piece owner can change their Piece in the database through existing row-level security policies.

Image URLs for public Piece icons are public by design. Never use sensitive photos for a public community icon.

This remains a beta. Full server-side moderation, more Piece channel types, configurable community permission matrices, bot integrations and closed-browser push notifications are **not** included in this release.

## Website and HTTPS

The deployment is made via GitHub Pages. The secure canonical fallback is https://fyrix341.github.io/Tender/ . A newly connected custom domain should only be used for login once the domain correctly supports **HTTPS** and GitHub Pages' **Enforce HTTPS** setting is available.

## Testing

The GitHub Actions test suite checks script syntax, optimistic sends, Piece composer structure, Piece picture rendering and edit form, and accessible profile actions. Real cross-account browser tests are still recommended.

*Stay close. Stay crispy.* 🍗
