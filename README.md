# Tender 🍗

**Stay close. Stay crispy.**

Tender is a responsive social messaging app with **Buffalo** the mascot. Chat with friends, build group conversations, and discover communities called **Pieces**.

**[🍗 Open Tender securely](https://fyrix341.github.io/Tender/)** · [Source code](https://github.com/FYRIX341/Tender)

## 📥 Tender 0.5.3 — Inbox & Message Formatting

**Tender now has an IN-APP CHANGELOG**: open the 📥 button in the conversation top bar → **Updates** to see Major, Minor and Patch releases with artwork, or → **News** for Tender announcements. The in-app views replace the need to browse GitHub release Markdown files. Historical Markdown files remain in GitHub only as development records.

- **Message formatting**: use `# Heading`, `## Subheading`, `**bold**`, `***bold italic***`, `__underline__`, `~~strikethrough~~`, quote blocks, lists, horizontal rules and inline/code blocks. All user markup is escaped before rendering.
- **One + button for chat tools**: Upload a File, Create Poll (DM/group), Record Voice Clip (DM/group), HTML/CSS Embed, and Rich Embed. GIF, Stickers and Emoji remain on the **right** of the composer.
- **Inbox tabs**: Unread, Mentions, Bookmarks, Reminders, Updates and News. Jump to a message in a DM, group chat or Piece, even if it's older than your latest 150 messages.
- **Right-click messages** to bookmark them or create a reminder. Reminders are private, synced to the account and shown in Tender when due while the app is open or next opened (not mobile push).
- **Profile Studio inside Settings**: same functional layout with a calmer background, no oversized "Make it yours" slogan.
- **Mark all as read** also resets unread Piece-channel indicators.

**Database setup required:** back up Supabase first, then run **[migration_0_5_3.sql](migration_0_5_3.sql)** in the *same* Supabase project as Tender. This adds RLS-protected bookmarks, reminders, and new incoming mention records, without erasing old messages. The Inbox's Updates and News work even before the migration, but cross-chat bookmarks/reminders/mentions require it.

**Note:** Existing older @mentions are not automatically backfilled; incoming mentions will be collected after the migration. News posts are curated from real Tender changes, not fabricated announcements.

## 🎨 Tender 0.5.2 — Profile Studio & Live Chats

**Profile Tags:** Pick a joined Piece Tag straight from your own profile and remove it whenever you want.

**Profile Studio:** Completely new three-column editor, big persistent live preview, sections for colors, identity, name styling, layouts, widgets, Piece Tags and images. Try **Surprise Me** palettes without saving until you're ready.

**Live messages:** DMs and Piece chats now load the **newest 150 messages** instead of the oldest. A visible-chat backup sync detects missed Realtime events, refreshes automatically and resyncs on returning to Tender.

**No SQL migration needed.** See [Tender 0.5.2 release notes](RELEASE_0_5_2.md).

## 🔧 Tender 0.5.1 — DM / Emoji Hotfix

**If you receive `record "new" has no field "piece_id"` when sending DMs**, run the short [migration_0_5_1.sql](migration_0_5_1.sql) hotfix in your existing Tender Supabase project. It repairs an anti-spam trigger that incorrectly evaluated a Piece-only column for DM messages. This does **not** delete account data or require the full 0.5 migration again.

[See instructions and root cause](RELEASE_0_5_1.md).

## 🍗 Tender 0.5 Alpha — CONTENT UPDATE

**Major alpha release.** The 0.5 source introduces message requests, DM privacy, public and private threads, safe HTML/CSS embeds, emoji shortcodes, custom stickers, the new Profile Studio with free color banners and widgets, Piece Tags, forum channels, and more.

**Before enabling 0.5:** back up Supabase and run [migration_0_5.sql](migration_0_5.sql) in the **same** Supabase project as `config.js`. Browser files cannot install schema changes.

- [What changed, limitations and rollout steps](RELEASE_0_5_ALPHA.md)
- [Frontend smoke checks](tests/tender05-smoke.cjs)

Multi-user voice/stage media, interactive embeds, and bots/the developer portal are **not included** in this alpha. Permanent account deletion is **not automated** until a separately authorized cleanup worker is deployed and verified; a 30-day request/cancellation workflow is provided.

### Previous release: 0.4.6 — Channel Button Repair


This **bug-fix update** addresses the Create Channel button that appeared to do nothing. Clicking the orange button now directly invokes the save handler, instead of depending only on the browser's form submission event. Tender also bypasses silent native validation on this form and reports database response codes in its existing persistent error box.

The Create Channel form includes a visible **Tender 0.4.6 • Channel Repair** label. If you do not see it after a hard refresh, the website you are visiting has not loaded this version of the code.

**Note:** A visible save attempt does not guarantee successful channel creation. Actual Supabase errors (permissions, missing tables, duplicate names) are displayed so they can be diagnosed individually. See [0.4.6 release notes](RELEASE_0_4_6.md).

### Previous release: 0.4.5 — Daily Chat Dates

**Tender 0.4.5 gives conversations Discord-style day separators.** When the message history crosses into a new calendar day, a slim horizontal divider appears automatically. Recent dates read **Today, October 18, 2026** or **Yesterday, October 17, 2026** (as appropriate for your browser's local date), while older messages use their full date.

Daily dividers appear in **DMs, group conversations and Piece channels**. Multiple messages from one day stay together under a single divider. They also work while messages arrive live, and the date labels refresh after midnight or when returning to the tab. Tender no longer visually merges messages sent by the same person across two different days.

The change is entirely frontend-based, preserves all past messages, and does not need a database migration. [Read the 0.4.5 release notes](RELEASE_0_4_5.md).

### Previous release: 0.4.4 — Live Profile Presence



**Tender 0.4.4 fixes false Online badges on profiles.** The old profile badge used the last saved status preference, which stayed `online` after a user disconnected. The updated full profile, DM profile side panel, friend profile page and mini profile now use the existing live Supabase presence roster.

When nobody is connected, the profile visibly says **Offline** with a gray indicator. Live connections show Online, Idle, or Do Not Disturb as selected. Invisible users appear Offline. Badges already on screen update as users connect or disconnect, without needing to close and reopen their profile. Your own badge also waits for a successful presence connection before saying Online.

See the [0.4.4 release notes](RELEASE_0_4_4.md) for the technical fix and test cases.

### Previous release: 0.4.3 — Channel Repair & Charcoal UI

**Tender 0.4.3 addresses the "Create channel does nothing" bug** with a more reliable form, persistent errors, a visible saving state, a timeout for stuck requests, and server-side confirmation before success is shown. The channel editor now opens even if the database isn't ready, and explains which existing Supabase migration is required. Owners can open the editor even when their membership row is absent, although the database must still authorize the write.

**UI overhaul:** Older CSS was forcing near-black surfaces despite newer gray styling. The refreshed Discord-inspired charcoal palette now consistently styles the server rail, conversation sidebar, chat, message box, toolbar, member panel, settings, and dialogs. Light theme remains supported.

**Important:** Actual multi-user channels require the existing `migration_0_4.sql` applied to your connected Supabase project. GitHub Pages deployment cannot change the database. Check the [0.4.3 release notes](RELEASE_0_4_3.md) for setup and troubleshooting.

### Previous release: 0.4.2 — Channels & Layout

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

For details, see the [0.4.5 update notes](RELEASE_0_4_5.md), [0.4.4 update notes](RELEASE_0_4_4.md), [0.4.3 update notes](RELEASE_0_4_3.md), [0.4.2 update notes](RELEASE_0_4_2.md), [0.4.1 update notes](RELEASE_0_4_1.md), [0.4 release notes](RELEASE_0_4.md), [0.3.5 update notes](RELEASE_0_3_5.md), [0.3.4 hotfix notes](RELEASE_0_3_4.md), [0.3.3 release notes](RELEASE_0_3_3.md), [0.3.2 changelog](RELEASE_0_3_2.md), and [0.3.1 changelog](RELEASE_0_3_1.md).

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
