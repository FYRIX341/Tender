# Tender 🍗

**Stay close. Stay crispy.**

Tender is a responsive social messaging app with **Buffalo** the mascot. Chat with friends, build group conversations, and discover communities called **Pieces**.

**[🍗 Open Tender securely](https://fyrix341.github.io/Tender/)** · [Source code](https://github.com/FYRIX341/Tender)

## ✨ Tender 0.3.5 — Your Space

**Tender 0.3.5 brings a proper account dock to the left sidebar.** Friends are at the top, DMs occupy the middle and your own avatar, voice-note mute/deafen controls and Settings live at the bottom. Click your avatar to edit your profile, change availability (Online/Idle/DND/Invisible), copy your user ID or sign out to switch accounts. Verified `@mentions` now glow blue without recoloring entire messages, and autocomplete avatars stay square instead of stretching.

Piece owners can change their picture in **Edit Piece** or by clicking the Piece picture. You can switch back to an emoji whenever you like. These features reuse the existing Supabase setup, with no new SQL migration.

### What you can do

- **Your profile:** Sign up, sign in, customize your display name, bio, avatar, banner and status. Click a person's picture or name to open their profile.
- **Find your people:** Discover users, send friend requests, and connect with friends.
- **Chat:** Send private messages, create group chats, reply to messages, and see messages update in real time. Replies have previews and jump-to-original. Clickable blue @mentions highlight only the usernames.
- **Express yourself:** React with emojis and share supported attachments.
- **Explore Pieces:** Join or create communities with live chat, threaded-style message replies, discussions and galleries. Owners can upload custom icons. Public Pieces have invitation cards that can be shared in DMs.
- **Make it yours:** Choose themes, gradients, fonts and chat wallpapers. A bottom account dock lets you edit your profile, switch between availability modes, mute Tender voice-note recording and deafen Tender audio.
- **Stay in the loop:** See in-app notifications while using Tender.

For details, see the [0.3.5 update notes](RELEASE_0_3_5.md), [0.3.4 hotfix notes](RELEASE_0_3_4.md), [0.3.3 release notes](RELEASE_0_3_3.md), [0.3.2 changelog](RELEASE_0_3_2.md), and [0.3.1 changelog](RELEASE_0_3_1.md).

## 📱 Made for desktop and mobile

Tender runs in your browser—no app-store installation required. The interface adapts to both phones and computers.

## 🛠️ Built with

- HTML, CSS, and JavaScript
- Supabase for authentication, data, storage, and realtime features
- GitHub Pages for web hosting

## 🌱 What's next?

Tender is still evolving. Advanced community permissions, automatic moderation, rich third-party feed integrations, and other server-dependent features are future work—not features that are already live.

## 🛡️ Beta notice

Tender is an early beta. Free-tier limits apply, and features may change. Native notifications require HTTPS, browser permission, and an open Tender tab; closed-browser push is not implemented. The custom domain tender.oops.wtf should not be used for passwords until GitHub Pages HTTPS is enabled. Browser notifications with the page open are supported; background push notifications are not yet implemented. Microphone/deafen buttons affect Tender's voice notes and audio only; Tender does not have live voice channels, and switching accounts signs out of the current session. Public Piece gallery links may remain accessible after a Piece is made private, so avoid sharing sensitive files. Full moderation, anti-spam, and safety systems are still works in progress.

---

**Made with crispy enthusiasm. Stay close. Stay crispy.** 🍗
