# 🍗 Tender 0.3.5 — Your Space

**Release class: SMALL UPDATE** · October 17, 2026

A Discord-inspired usability update with Tender's own Buffalo branding. All existing accounts, chats, Pieces, message reactions, replies, invites, profiles and Supabase configuration remain unchanged.

## 🧭 Updated conversation sidebar

- **Friends at the top** of the DM sidebar with a count of pending friend requests.
- **Direct Messages in the middle**, with a compact heading, new-DM button and search.
- **Your own account bar at the bottom**, with avatar, display name, username, availability and three quick controls.
- Chat/other navigation remains on Tender's left rail; Pieces and Discover are unchanged.
- The account bar stays anchored to the bottom while the conversation list scrolls.

## 👤 Click your avatar to manage your account

- A styled popover includes a banner, avatar, name, username and custom text status.
- **View Full Profile** opens the existing rich profile modal.
- **Edit Profile** takes you to Settings → My Profile.
- Set **Online, Idle, Do Not Disturb or Invisible**. Availability persists through the existing Supabase profile field and updates the local account menu without rebuilding the current chat.
- **Copy User ID** copies only your authenticated Tender account identifier; no passwords or access tokens are displayed.
- **Switch Accounts** signs out of Tender on this device after a confirmation and returns to the secure log-in screen. It does not store credentials or maintain multiple simultaneous sessions.

## 🎙️ Mute and Deafen

- **Mute microphone** blocks starting a Tender voice-message recording while muted.
- **Deafen** silences Tender's own notification chimes and playable audio/video elements; when turned off, the app restores previously muted media to their prior state.
- These controls are stored **per account, per browser**. They do not mute your computer's microphone globally and do not indicate that Tender has voice calls (live voice channels are not implemented).
- Microphone cannot be muted mid-recording without first finishing that voice note.

## 💙 Mentions fixed and improved

- A recognized username such as **@gl3** is rendered as a separate **glowing blue clickable mention** while surrounding message text remains its original color.
- Mention clicks open a person's Tender profile.
- Plain-text escaping, normal links, and custom emojis are preserved. Links containing `@` and email addresses are not reinterpreted as mentions.
- The mention autocomplete now wraps avatars in **fixed 29×29 circles**, uses a text column for username/display name and no longer stretches profile pictures into giant ovals.
- Unknown usernames don't get false clickable profile links.

## 🔒 Compatibility and testing

This release requires **no SQL migration and no new credentials**. Availability uses the existing `profiles.presence_mode` column from earlier updates. Device-only audio controls are kept in local storage keyed by your account ID.

QA tests cover working message send/replies, rich profiles and Pieces, Settings state preservation, plus account menu actions, status writes, local mic/deafen behavior, copying IDs, account switching, safe mention formatting, autocomplete avatar proportions, and basic responsiveness.

Tests are automated and do not replace verification on real phones/desktops. Existing HTTPS requirements for notifications and sign-in still apply.

**Stay close. Stay crispy.** 🍗
