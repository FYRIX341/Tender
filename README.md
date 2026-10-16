# Tender 🍗

**Stay close. Stay crispy.** A responsive HTML/CSS/JavaScript messenger featuring Buffalo the mascot, private DMs, friend requests, group chats, and customizable forum-like **Pieces** with chat, discussions, and galleries.

## Live hosting

Source: https://github.com/FYRIX341/Tender

GitHub Pages deployment is configured in `.github/workflows/pages.yml` and aims to publish at https://fyrix341.github.io/Tender/ . The link only works once the deployment succeeds. If needed, open repository **Settings → Pages**, choose **GitHub Actions** as the source, then check the Actions tab.

## Required backend setup (free tier)

**GitHub Pages does not provide a messaging database.** Real accounts and messages require a free Supabase project.

1. Create a free project at https://supabase.com/dashboard/projects.
2. In **SQL Editor**, paste and run the entire [schema.sql](schema.sql). This creates tables, access restrictions, storage buckets, and Realtime publication.
3. In **Project Settings → API** (or **Connect**), copy the **Project URL** and the **publishable / anon key**.
4. On GitHub, edit [config.js](config.js) to set:
   ```js
   window.TENDER_CONFIG = {
     supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
     supabaseAnonKey: 'YOUR_PUBLIC_PUBLISHABLE_OR_ANON_KEY'
   };
   ```
   **Never** put a secret, service_role key, password, or private token in this public repo.
5. In Supabase **Authentication → URL Configuration**, set Site URL to your deployed Tender URL and allow that redirect URL. Enable email sign-in. If email confirmation is enabled, make sure your project can send sign-up emails (free email services have rate limits).
6. Wait for GitHub Pages to deploy the updated config. Register two accounts and verify they can exchange messages using different devices.

There is **no real-time demo or local-only fake chat**: before a Supabase project is connected, Tender displays setup instructions rather than pretending messages are shared.

## Current functionality

- Supabase email/password login and signup; public profile with username, display name, bio and avatar.
- Username lookup, friend requests and acceptance, private DMs and group chats.
- Realtime updates, emoji reactions, message deletion, image/PDF attachments (5 MB limit).
- Public/private Pieces with member controls and three Blocks: live chat, forum posts with threaded replies, and image gallery.
- Responsive desktop/mobile layout and Buffalo mascot artwork.

## Beta limitations and safety

This is an early **private beta**, not a fully moderated public social network. The free tier has limits, including realtime concurrency, bandwidth, emails and storage. Piece galleries for public Pieces are public URLs. Changing a Piece to private does **not** retroactively remove already shared public gallery files; do not upload sensitive content. In-browser content controls and database row-level security are a starting point, not a substitute for anti-spam systems, user reporting, blocking, abuse handling, or child-safety policies. Add these and relevant legal/privacy safeguards before promoting Tender to the public.

No paid subscription is required for users, and deployment starts at $0 within the providers' free tiers. Infrastructure is still required—"no servers" means no Discord-style user-created servers, not serverless storage of other people's messages.

## Files

- `index.html`: entry point
- `styles.css`: desktop/mobile UI
- `app.js`: Supabase-powered application
- `schema.sql`: Supabase database and access policies
- `config.js`: public, intentionally blank configuration
- `buffalo.webp`: optimized Buffalo mascot

Made with crispy enthusiasm. 🍗
