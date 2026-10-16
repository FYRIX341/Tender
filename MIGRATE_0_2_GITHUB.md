# Tender 0.2 — run SQL without pasting it 🍗

A manual GitHub Actions workflow executes the existing `migration_0_2.sql` against your **existing Supabase project**. There is no need to paste SQL into your phone.

## One-time setup

1. Open your existing **Tender** project in [Supabase](https://supabase.com/dashboard/projects).
2. Click **Connect**. Find **Connection string → URI → Session pooler** (port **5432**). Use the *session pooler*, not the direct connection, because GitHub's hosted runners may not have IPv6 support.
3. Copy the full PostgreSQL URI. Replace the `[YOUR-PASSWORD]` placeholder **privately** with your **Supabase database password**. If your password includes special characters such as `@`, `/`, `:`, `#`, `?`, `%`, encode those characters as URL percent escapes. Do not send the URI, password, or secret to anyone in chat.
4. On GitHub open [Tender Actions secrets](https://github.com/FYRIX341/Tender/settings/secrets/actions), click **New repository secret**, and create:
   - **Name:** `TENDER_DATABASE_URL`
   - **Secret:** the completed URI (it begins with `postgresql://` or `postgres://`).
5. Open [Run Tender 0.2 Migration](https://github.com/FYRIX341/Tender/actions/workflows/migrate-tender.yml).
6. Tap **Run workflow**, choose **main**, and tap the green **Run workflow** button.
7. Open the run to check whether it finished with a **green check**. The workflow does not run automatically.
8. After success, reload [Tender](https://fyrix341.github.io/Tender/).

## Important

- The workflow runs the already existing `migration_0_2.sql` file. **Do not run the original `schema.sql` again.**
- The file includes a database transaction (`BEGIN` / `COMMIT`), and the workflow stops on errors.
- The secret remains in GitHub Actions Secrets. The workflow is manual-only, does not print the URI, and has minimal repository permissions.
- Do **not** add the PostgreSQL connection URI to `config.js`, README, a Git commit, an issue, or a screenshot.
- A Supabase **publishable key** is **not** the database connection password. Use your PostgreSQL connection URI.
- If it fails, view the run's last error lines and share **only the error message**, without passwords or URLs that may include credentials.
- GitHub's deployment job for the website is separate and cannot apply this migration by itself.
