# Tender 🍗

**Stay close. Stay crispy.**

Tender is a responsive social messaging app with **Buffalo** the mascot. Chat with friends, build group conversations, and discover communities called **Pieces**.

**[🍗 Open Tender securely](https://fyrix341.github.io/Tender/)** · [Source code](https://github.com/FYRIX341/Tender)

## ✨ Tender 0.4.2 — Channels & Layout

**Tender 0.4.2 improves Piece channel creation and switches to a tighter Discord-inspired workspace** while retaining Tender’s identity. Staff can create channels using the main **+** button or a category **+**, and channel names containing spaces and capitals are converted into safe channel slugs automatically. Clear errors are shown for duplicates, unavailable database schema and save failures. Piece chat removes most of the oversized header so the conversation gets the space it deserves.

**Backend note:** The live Supabase project must have the existing `migration_0_4.sql` applied for channel creation and read permissions to work. Publishing the static website alone cannot install database tables or policies. See [the 0.4.2 notes](RELEASE_0_4_2.md) for a quick test and troubleshooting guide.

### Previous release: 0.4.1 — Together

**Tender 0.4 gives Pieces real channels and makes customization free.** Your joined Pieces appear as icons in the left rail, with unread badges; channels can have their own conversations, categories, topics and unread history. Every old Piece chat remains in **#general**. DM and group icons now show live connection-aware status markers.

Click an avatar or name for a **mini profile**, with a button to view the full page. Express yourself with **free gradients, six name-font presets, four text effects and animated GIF avatars**. Piece owners can style their community icon, color gradient, name, welcome message and theme. The redesigned emoji picker contains **3,963 Unicode 18.0 sequences**, including all supported fully-qualified combinations, rather than a short list.

**Tender 0.4.1 brings real peer-to-peer voice and video calls to 1-to-1 DMs.** Tap 📞 or 📹 in a DM to call, answer or decline incoming calls, mute your microphone, deafen audio, toggle your camera, or share your screen. Your friend's voice and shared-screen audio have separate per-person volume controls. **Full-profile background gradients and username gradients are now independent**, and HTTPS links get attractive, safely rendered preview cards (with enhanced GitHub and YouTube cards). Voice/video traffic runs through WebRTC, not Supabase storage.

The **automatic additive Supabase migrations** preserve accounts, chats, Pieces and messages. The new 0.4.1 migration adds secure call setup tables and independent display-name gradient colors.

### What you can do

- **Your profile:** Customize your bio, presence, gradient, name font/effects, regular or animated GIF avatar and banner. Click someone's avatar for a quick profile card.
- **Find your people:** Discover users, send friend requests, and connect with friends.
- **Chat:** Send private messages, create group chats, reply to messages, and see messages update in real time. Replies have previews, jump-to-original, blue @mentions, and safe link preview cards.
- **Express yourself:** Search and react with the entire bundled Unicode 18 emoji catalog, use recent picks, custom stickers, GIF links and supported attachments.
- **Explore Pieces:** Join communities shown in an icon rail; browse text and announcement channels, category lists, real unread badges, forums, galleries and events. Piece owners can create channels and customize GIF/emoji icons and themes. Public Pieces have shareable invitation cards.
- **Make it yours:** Choose *separate* gradients for your full profile and display name, fonts, themes and chat wallpapers. Set your status and control Tender's audio from your account dock.
- **Call a friend:** Start a real voice or video call in a private DM, share your screen, mute/deafen, and set different voice and stream volumes. Requires microphone/camera permission and an HTTPS browser with WebRTC.
- **Stay in the loop:** See in-app notifications while using Tender, including incoming call prompts.

For details, see the [0.4.2 update notes](RELEASE_0_4_2.md), [0.4.1 update notes](RELEASE_0_4_1.md), [0.4 release notes](RELEASE_0_4.md), [0.3.5 update notes](RELEASE_0_3_5.md), [0.3.4 hotfix notes](RELEASE_0_3_4.md), [0.3.3 release notes](RELEASE_0_3_3.md), [0.3.2 changelog](RELEASE_0_3_2.md), and [0.3.1 changelog](RELEASE_0_3_1.md).

## 📱 Made for desktop and mobile

Tender runs in your browser—no app-store installation required. The interface adapts to both phones and computers.

## 🛠️ Built with

- HTML, CSS, and JavaScript
- Supabase for authentication, data, storage, and realtime features
- GitHub Pages for web hosting

## 🌱 What's next?

Tender is still evolving. Advanced channel-level permissions, managed GIF search, group calls, voice channels, TURN relay service, automatic moderation and rich third-party feed integrations are future work—not features that are already live.

## 🛡️ Beta notice

Tender is an early beta. Free-tier limits apply, and features may change. The shape of newer Unicode emoji depends on your device's font. Native notifications require HTTPS, browser permission, and an open Tender tab; closed-browser push is not implemented. The custom domain tender.oops.wtf should not be used for passwords until GitHub Pages HTTPS is enabled. Browser notifications with the page open are supported; background push notifications are not yet implemented. Microphone/deafen controls affect Tender voice notes and active calls, not your entire device. Tender supports 1-to-1 WebRTC calls, but **not** group voice channels or group calls. Calls may fail on symmetric NAT/firewalls until a TURN relay is configured. Screen capture and screen audio availability vary by browser. Switching accounts signs out of the current session. Public Piece gallery links may remain accessible after a Piece is made private, so avoid sharing sensitive files. Full moderation, anti-spam, and safety systems are still works in progress.

---

**Made with crispy enthusiasm. Stay close. Stay crispy.** 🍗
