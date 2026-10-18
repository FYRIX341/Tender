# Tender 0.4.4 — Live Profile Presence

**Classification:** BUG FIX  
**Date:** October 18, 2026

## Fixed: false Online status on profiles

**Before:** The profile badge used `profiles.presence_mode`, a saved preference (usually `online`). The database preference didn't change when a person logged out or closed Tender, so their profile could incorrectly display a green Online badge.

**After:** The profile badge uses `activePresence(person.id)`, which reads active Realtime presence records rather than persisted preference data.

- **Online** (green): a live presence record with online mode
- **Idle** (yellow): connected with idle mode
- **Do Not Disturb** (red): connected with DND mode
- **Offline** (gray): no live presence record, disconnected or Invisible

### Updated UI surfaces
- Full profile dialog
- DM sidebar profile
- Friend profile page
- Mini profile avatar status dot
- Already-open profiles update when a presence sync arrives; no manual refresh necessary

### Reliability
- Own online status is not claimed until the Supabase presence connection has successfully tracked the current session.
- Disconnected and failed channels set presence to Offline and clear stale roster values.
- Changing presence in Privacy Settings now publishes the new presence state, as does the existing account status menu.
- Logged-out sessions clear local presence-connection state.
- No account records or preference settings are reset.

## Validation performed
- JavaScript syntax check passed.
- Tested eight presence scenarios with mock data, including a saved Online preference with no connection (correctly shows Offline), remote live Online/Idle/DND, disconnected, self connected/disconnected and Invisible.
- Tested dynamic badge updates: Offline → Online → Offline without recreating the profile.
- Live end-to-end tests using multiple signed-in browser clients and the Supabase Realtime service are still necessary to validate network behavior.

This change is purely a frontend behavior and styling fix; **no SQL migration required**.
