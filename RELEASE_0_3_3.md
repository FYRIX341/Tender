# 🍗 Tender 0.3.3 — Profiles, Replies & Pieces

**Release class: SMALL UPDATE** · October 17, 2026  
**Audience:** Tender's browser users on desktop and mobile

## 💬 Replies are back — and better

- **Restored Reply button** on DM messages and Piece chat messages.
- Button has an actual **Reply** label in the floating action toolbar and stays accessible on touch devices.
- Clicking Reply keeps the existing conversation mounted and does not erase the current draft or jump the chat scroll to the top.
- New quoted composer banner shows the sender, the original text, and an **X** to cancel.
- Replies include a click-to-jump quote above the answer. The original message is highlighted when located.
- If the original is outside the latest 150 fetched messages, Tender tells you instead of silently failing.
- Replies in Pieces use the same stable optimistic message IDs and realtime reconciliation as DMs.
- **Piece reply database migration is additive:** one nullable `reply_to` column, foreign key, same-Piece check and index. It does not delete or rewrite existing messages. Piece Reply buttons activate once migration is verified.

## 👤 Personal profiles like a real messaging app

- DM right sidebar now shows **the person you're messaging**, not a redundant two-person member list.
- Real profile banner, avatar, display name, username, pronouns, presence, custom text status, bio and action buttons.
- Full-profile button opens a larger **two-column profile view**, including account creation date when available.
- **Shared public Pieces** are calculated from actual user memberships. Private communities are not exposed as public mutual Pieces.
- Clicking usernames, profile pictures and the member panel remains supported.
- The Friends profile page received the same visual refresh and still supports message, remove-friend and blocking actions.

## 📨 Real Tender Piece invitation cards

- Public Piece links sent in chats render a proper preview: Piece banner, icon, name, description, known member count, and **View & Join** action.
- Invitation preview appears only when the link matches a real **public** Piece in Tender's loaded data; lookalike domains do not produce a trusted card.
- Share/Copy invitation modal available from public Piece headers.
- **`/invite`** in DMs and groups opens a picker of public Pieces you're a member of and inserts a shareable link into the current draft.
- Receiving an invitation opens the Piece detail screen so users can choose to join; public invitations do not grant membership automatically.
- Private Piece information is never included in public invitation cards.

## 💾 Data & safety

All existing messages, profiles, Pieces, reactions, profile pictures, theme preferences and account information remain. Tender stays on the same Supabase project and existing URLs.

An automatic migration workflow (same scoped GitHub Supabase secret previously used successfully) safely adds support for Piece reply references. If the migration has not completed, the rest of Tender works and only native Piece replies remain temporarily unavailable. Never post personal access tokens in issues or chat.

This isn't a full Discord clone. Tender retains its own Buffalo character and existing functionality.

## 🧪 Verification

Automated checks cover:
- working client-side optimistic/realtime send logic
- restored DM/Piece replies, correct persisted reply targets, in-place quote previews
- detailed profile cards and DM sidebar
- no accidental disclosure of private Pieces
- authenticated-domain Piece invite verification and secure link creation
- all previously added visual, notification, keyboard and messaging tests

Real-world testing with two authenticated Tender accounts is still recommended. Browser notifications remain dependent on HTTPS, supported APIs, and explicit user permission; closed-browser push is not yet available.

**Stay close. Stay crispy.** 🍗
