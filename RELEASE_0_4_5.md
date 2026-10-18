# Tender 0.4.5 — Daily Chat Dates

**Release classification:** SMALL UPDATE  
**Date:** October 18, 2026

## Added: date separators across conversations

Daily message separators automatically appear between messages from different calendar dates. Every chat stream now uses the same renderer:

- **Direct Messages**
- **Group chats**
- **Piece text and announcement channels**

### Example

```
───────── Yesterday, October 17, 2026 ─────────
whatevs 16:09
yo

Teoby Fox 16:09
why

────────── Today, October 18, 2026 ────────────
whatevs 10:03
oh yea
```

The dates are interpreted using the viewer's **local browser calendar day**, not UTC or a rolling 24-hour window. Older dates display as `October 16, 2026` (full month/day/year). A day separator appears only once for each day in the visible history.

## Realtime and accessibility
- Day separators participate in the keyed chat DOM reconciliation, so a live incoming message can create the next day's divider in the correct location.
- Removing messages also removes separators for dates that no longer have any loaded messages.
- Message groups never visually cross a local midnight, even for two messages sent within five minutes.
- Existing separators relabel from Today to Yesterday automatically after local midnight, and when the tab becomes visible again.
- Subtle horizontal rules and centered labels are responsive on desktop and mobile.
- Separators expose their labels to assistive technologies with `role="separator"`.

## Verification
- Verified date formatting for Today, Yesterday, older days, New Year's boundary, leap day and invalid timestamps.
- Verified rendering generates one divider per day even for multiple messages and unsorted input.
- Mocked realtime reconciliation for a new day, multiple new messages on the same day, deleting a day and prepending an older day. All five checks passed.
- JavaScript syntax and CSS delimiter checks pass.

This is a frontend update and **does not require a Supabase SQL migration**. It preserves all existing messages and features.

Live testing in a signed-in Tender browser is still recommended.
