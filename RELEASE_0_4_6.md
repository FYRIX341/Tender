# Tender 0.4.6 — Channel Button Repair

**Classification:** BUG FIX  
**Date:** 2026-10-18

## Symptoms reported
The Create Channel dialog opens, its submit button is enabled and filled-in, but clicking it sometimes appears to do nothing. Browser Network panels show repeated `GET /tender_call_sessions` polls rather than the expected `POST /piece_channels`.

## Fix
1. Add a `data-action="channel-submit"` click handler to the form's orange Create Channel button. The handler calls `submitChannelForm` directly and prevents the default click to avoid double submission.
2. Add `novalidate` to the channel form so browser-native constraint validation cannot silently suppress a submit event. The channel handler already normalizes and validates the channel name and category itself.
3. Keep the existing `submit` listener for keyboard submission and provide the same save routine for both paths.
4. Display Supabase error codes in the persistent channel error box, including meaningful permission details for `42501`.
5. Add a `Tender 0.4.6 • Channel Repair` marker inside the dialog for verifying that the custom domain loads the latest site code.
6. Bump asset cache parameters to prevent browsers from reusing stale JavaScript and CSS.

## What the network request means
- A `POST /piece_channels` and a `201 Created` plus the channel appearing after refresh indicates success.
- A failed POST with `42501` generally indicates permission grants or Row Level Security (RLS) restrictions. Verify whether the user is the Piece owner/moderator and whether the matching membership role exists. Check the exact server error before changing SQL.
- If there is no POST, the browser may have suppressed the form submission, the website may be running stale code, or the frontend may reject the attempt before sending it. The updated dialog gives a visible error for those cases.
- Requests named `tender_call_sessions` are call polling; they are unrelated to channel creation.

## Verification
- Updated application JavaScript passes parsing.
- Tested a simulated click on the button, confirming it invokes `submitChannelForm` exactly once and cancels the browser's default submission.
- Confirmed direct-click action and `novalidate` markup both appear in the updated application.

## Deployment notes
The canonical source is `FYRIX341/Tender` on GitHub. The production custom domain `https://tender.oops.wtf/` was not independently reachable from the verification environment. Updating this repository does not prove that the custom domain's hosting automatically picked up those assets. Users should look for the 0.4.6 label in Create Channel after a hard refresh.

**No new SQL migration is required for this frontend fix.** If errors continue with 0.4.6, inspect the saved error code and backend database policy before changing permissions.
