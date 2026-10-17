# 🍗 Tender 0.3.4 — Settings Stability Hotfix

**Release class:** BUG FIX · October 17, 2026

**Reported by:** Tender beta tester after the 0.3.3 release

## Fixed

- **Saving custom status no longer jumps you to the top of the settings page.**
- Profile changes now update the local profile cache and the on-screen preview **without rebuilding the Settings page**.
- Saving bio, pronouns, display name or status emoji preserves the form, keyboard focus, cursor position, and scroll offset.
- Profile preview immediately shows your saved custom status.
- The saved profile's sidebar name is still updated.
- Changing appearance, privacy and notification preferences no longer needlessly remounts the entire settings page.
- If an unrelated realtime event redraws the current Settings tab, Tender captures and restores the unfinished form values, scroll positions and current caret/focus. Deliberately switching settings tabs does not carry edits over to an unrelated form.
- File uploads remain protected: browser file inputs are never artificially restored.

## Unchanged

Tender 0.3.3 DMs, replies, Piece invites, full profiles, reactions, account data, pictures, existing Supabase configuration, and browser notification settings remain unchanged. **No database migration or extra credentials required.**

## Testing

Node regression checks include a mocked profile save that verifies the database update and asserts **zero Settings remounts**, plus simulations of unsaved form text, cursor/focus and scroll positions surviving a redraw. All preexisting tests continue to run.

This automated testing doesn't replace a real browser check. If a tester still experiences resetting, gather the browser, OS, exact setting edited, and whether they pressed Enter or clicked Save.

**Stay close. Stay crispy.** 🍗
