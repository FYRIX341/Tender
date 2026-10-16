# Tender 0.2 — run SQL without pasting it 🍗

A manual GitHub Actions workflow executes the existing `migration_0_2.sql` against your **existing Supabase project**. There is no need to paste SQL into your phone.

## Fix: GitHub Actions says `Network is unreachable`

If the log mentions `db.svrculrtxjudkcljhutn.supabase.co` and an IPv6 address, the secret contains the **Direct connection** URL. GitHub's runner can't reach that IPv6 address on Supabase's free plan.

**You do not need to rerun or paste SQL, reset your password, or create a new project.**

1. In the **existing Tender** Supabase project, click **Connect**.
2. Change connection type from **Direct connection** to **Session pooler** (not Transaction pooler). Choose **URI** and verify port **5432**.
3. Copy the whole URI. It will have a host such as `aws-0-REGION.pooler.supabase.com` (actual host varies), and the username must be `postgres.svrculrtxjudkcljhutn`. **Do not invent the pooler host; copy it from Supabase.**
4. Replace the `[YOUR-PASSWORD]` portion privately with your database password (URL-encode special characters).
5. Go to [GitHub Actions secrets](https://github.com/FYRIX341/Tender/settings/secrets/actions), click the **existing** `TENDER_DATABASE_URL`, then **Update secret** and replace its value with the complete Session pooler URI.
6. Return to [Run Tender 0.2 Migration](https://github.com/FYRIX341/Tender/actions/workflows/migrate-tender.yml), click **Run workflow**, select `main`, and run again.

The workflow now rejects direct/incorrect connection hosts **before** running any SQL, with an explanation that doesn't expose the secret.

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
