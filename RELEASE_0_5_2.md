# Tender 0.5.2 — The Profile & Live Chat Repair 🍗

**Classification:** BUG FIX + PROFILE REDESIGN  
**Release:** 2026-10-18

## 1. Piece Tags live on YOUR profile now
- View your own public profile or open Profile Studio → Piece Tags.
- **Equip Piece Tag** opens a picker of tags from Pieces you joined, with tag colors, icons and Piece names.
- One click equips it account-wide; **Remove equipped tag** clears it.
- Piece owners still edit/create their Piece's tag in Piece settings, but members do not need to visit the Piece to equip their tag.
- Membership and tag eligibility remain enforced by the existing `tender_equip_piece_tag` RPC; no new SQL is required.

## 2. Profile Studio — COMPLETE visual replacement
- Removed the old wall of settings fields from the Profile tab.
- Dedicated responsive Profile Studio with **section navigation**, large editor and persistent **live profile preview** on the right.
- Editor sections: Identity, Banners & Colors, Username Style, Layouts, Piece Tags, Widgets, Avatar & Uploads.
- Independent color gradients for profile background and name; solid-color banners and image banners continue to work.
- Choose between Classic, Gamer, Minimalist and Cinematic layouts with visual previews.
- Live updates to the preview while typing, selecting colors or changing appearance—**saving still requires the Save button**.
- Bonus QoL: **Surprise Me** generates a coordinated gradient palette, only saved when you approve it.

## 3. DM and Piece messages now appear without refreshing
Two separate problems were addressed:
1. A conversation previously selected the **oldest** 150 messages. In longer conversations the most recent messages would never be returned. Both DM and Piece loaders now fetch the **newest** 150 records, reverse them for chronological display and retain their normal message grouping.
2. Realtime WebSocket events might disconnect or fail silently. Tender now tracks its channel status, checks the current chat's newest message on a lightweight timer while the page is visible, resyncs on tab focus, and periodically reconciles edits/deletions. This protects against missed events without losing message drafts or changing which chat is selected.

### Verification
- Run `node tests/tender05-smoke.cjs`: includes regression checks for newest-first chat fetches, reconnect/visible sync, profile-first tags, and rendering the new Studio's actual HTML.
- Existing create-channel repair is still present.
- No SQL migration and no account/data reset needed.
- Real two-person verification against the user's live Supabase project is still recommended.

### Other planned features
Bots, developer portal and real multi-user voice/stage infrastructure are **still future work**, not part of this repair.
