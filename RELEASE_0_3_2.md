# 🍗 Tender 0.3.2 — Night Shift, Refined

**Release class:** MAJOR UI UPDATE  
**Date:** October 17, 2026

This release continues Tender 0.3.1 without resetting any accounts, chats, images, friends, or Pieces.

## 🧵 Compact Discord-inspired message layout

- **Fixed enormous vertical gaps:** chat message lists now flow as natural-height blocks instead of vertically stretched flex rows.
- Hidden action toolbars **do not reserve blank space**. Hover/focus on a message to reveal its floating reply, emoji, edit, bookmark and delete tools.
- Emoji reactions remain visible in a separate row; nearby messages from the same author are grouped.
- Existing optimistic message IDs, targeted realtime updates, scroll preservation and Piece chat composer remain intact.

## 🎨 More polished Discord-like client

- Dedicated Settings navigation sections: **My Profile, My Account, Appearance, Notifications, Privacy & Safety, Accessibility**.
- Larger avatar/banner profile preview, editable bio, display name, custom text status and status emoji.
- Optional public **pronouns** field (40 characters). Its input activates after the additive database migration succeeds.
- Existing theme preferences, accents, wallpaper personalization, presence, blocking and notifications remain.
- **Drag the divider** between chat and conversation list, or between chat and the member panel to resize. Resize is saved per device. Arrow keys work on focused dividers, double-click resets.
- Removed the old width **slider** completely.

## ⌨️ Easier keyboard interaction

- While a DM or Piece chat is open, typing a printable key automatically focuses the composer and inserts that character.
- Ignores shortcuts, input fields, open dialogs, IME composition, and read-only/unjoined Piece chats.
- Enter still sends, Shift+Enter adds a newline.

## ✅ Custom confirmation dialogs

- Deleting messages, gallery posts or forum discussions, leaving Pieces, removing friends and blocking users now use Tender-styled, cancelable confirmation dialogs.
- Escape/backdrop cancellation is respected; destructive actions require explicit confirmation.

## 🔔 Actual OS/browser notifications

- Uses the native Notifications API rather than only changing the tab title.
- Offers **Enable notifications** (requires a click), **Send test notification**, detailed permission/HTTPS status, and notification/sound filters.
- New incoming Supabase notification events may create a system notification even while Tender is visible, excluding notifications sent by yourself and duplicate event IDs.
- A minimal service worker handles supported mobile notifications while the app is open and navigation when clicked. It does not cache login or private content.
- The unread-number badge and in-app inbox are retained.

**Limitations:** A secure HTTPS origin and browser permission are mandatory. The old HTTP custom domain cannot provide system notifications until HTTPS is configured. Background notifications after all Tender tabs are closed require separately built Web Push infrastructure and are **not provided** by this release. Device/browser support varies.

## Database and deployment

One idempotent, additive SQL migration adds `public.profiles.pronouns`, with a character-length constraint. A separate GitHub Actions workflow uses the existing scoped Supabase secret to apply it on the main-branch migration push. If that migration fails or is unavailable, the remaining app still works and the pronouns editor stays disabled. No existing profile or message is erased.

## What's not included

This update is a significant visual and usability improvement, **not a full clone of every Discord feature**. Voice/video calls, streaming, full Web Push, highly configurable permission matrices, advanced bot integrations and server-wide auto-moderation need additional backend features and testing. Tender keeps its own Buffalo identity.

## QA

The Tender QA workflow checks JavaScript syntax, the new notification worker, existing message send/reconciliation tests and new regressions for compact messages, modal confirmations, resize dividers, type-to-chat, profile editor and native notifications. Real two-account/browser testing is still recommended before trusting the experience as fully regression-free.

**Stay close. Stay crispy.** 🍗
