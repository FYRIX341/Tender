# 🍗 Tender 0.4.1 — Together

**Release class: SMALL UPDATE** · October 17, 2026

Tender 0.4.1 fixes profile gradients, adds safe auto-link cards and introduces browser-based **real 1:1 voice and video calls**. Everyone gets the new features for free. Tender/Buffalo branding, prior messages and existing accounts stay intact.

## 🎨 Two gradients, two completely independent controls

**Before:** Tender reused the profile background gradient as the username gradient, making them appear linked and leaving most of the profile card dark.

**Now:**
- **Profile background gradient:** choose two colors independently. They color the full profile dialog, mini-profile popup, right-hand DM profile and settings preview, not just the display name.
- **Display-name gradient:** select an independent pair, plus six font presets, solid/neon/shadow/gradient text effects and a solid color.
- Existing colors are migrated into the new name gradient fields once, preserving current customized names while letting you change either gradient afterward.
- Settings save through your existing authenticated Supabase profile row.

## 📞 Actual voice and video calls — 1-to-1 DMs

- Start a **voice call** or **video call** from the DM header.
- Other party gets an incoming call prompt with **Answer** and **Decline**.
- Calls use standard WebRTC for end-to-end encrypted media transport; voice/video are **not uploaded or recorded on Tender's servers**.
- The Supabase backend securely handles invitation state, SDP and ICE signals and clears them when you hang up.
- Toggle microphone mute, audio deafen and camera, including muting a camera while ringing.
- Share your screen using browser capture permission; when available, also send system/tab audio. Preview your own shared screen in-call.
- Set the other person's **voice playback volume** and **screen-share audio volume** independently. Tender remembers your choices for that person in this browser.
- Your account-dock mute/deafen buttons work with active calls as well as Tender voice-note/audio preferences.
- Leaving Tender by logging out or switching accounts closes your microphone/camera streams. Abandoned call sessions expire through an authenticated heartbeat so they do not block future conversations.
- Blocked members cannot initiate calls to each other.
- Incoming call prompts may create an optional system notification while Tender remains open, if the browser already has permission.

**Availability and limitations:** For now calls are **1:1 private DMs only**, not Piece voice channels or group calls. Both people must have Tender open in an HTTPS-capable browser with microphone permission. Video requires camera permission. Screen sharing relies on browser support; some phones do not support display capture, and screen audio availability varies. The public STUN-only setup does **not include a TURN relay**, so some NATs and restrictive networks prevent direct connections. An end-to-end call between two real signed-in accounts still needs manual browser verification beyond automated mocked WebRTC tests.

## 🔗 Link previews that look like embeds

- Paste an HTTPS link to get a polished link-preview card under the message, without broken unrelated old OpenGraph thumbnails.
- **GitHub** links show repository, file or issue context; Markdown release-note URLs show their actual file name.
- **YouTube** links show official video thumbnails when a valid video ID exists.
- **Spotify, Twitch, Reddit, Wikipedia and general HTTPS links** get labeled cards.
- Tender **Piece invites** retain their own original rich community card without generic duplicate previews.
- Preview URLs and text are validated/HTML-escaped; cards open externally in a new tab with safe `noopener noreferrer` attributes.
- Static GitHub Pages cannot safely retrieve every external site's OpenGraph metadata due CORS. The new generic link preview uses domain/path info and known-provider conventions—not an unrestricted metadata scraper.

## 🔐 Database migration & privacy

The additive `migration_0_4_1.sql` adds two independent name-gradient columns, `tender_call_sessions` and `tender_call_signals` tables with Supabase RLS, and three access-checked call lifecycle RPC functions plus a heartbeat RPC. Server-side checks require both participants to belong to the same existing two-person DM. Call signaling rows can only be read by their **intended recipient**, and call actions require member authorization. All existing messages, Pieces and accounts remain untouched.

The existing scoped Supabase HTTPS GitHub Actions workflow installs the migration automatically. **No new credentials are required.** Do not share access tokens in chat.

## 🧪 QA

The CI suite runs all prior Tender 0.3–0.4 regression tests as well as new tests for safe external link cards, gradient separation, 1:1 call creation, rejecting calls without opening media, incoming call answering, screen-sharing signaling, actual microphone track mute, stream/voice volume persistence, and restricted database policies. Automated tests use mocked browser/WebRTC behavior; they cannot prove real-world device compatibility, cross-network ICE connectivity or call quality.

**Stay close. Stay crispy. Now stay on the line! 🍗📞**
