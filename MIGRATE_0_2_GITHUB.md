# Tender 0.2 — One button, NO database URL 🍗

**Updated approach:** We switched from the PostgreSQL connection string to Supabase's **HTTPS Management API**. The old `TENDER_DATABASE_URL` secret is no longer used. No IPv6 connection, no pasting SQL, no creating a new database, and **no changing your Tender or Supabase Project URL**.

## Setup (one time)

1. Open [Supabase Access Tokens](https://supabase.com/dashboard/account/tokens).
2. Create a **new scoped personal access token**, name it `Tender GitHub Migration`, select **only your existing Tender project**, and grant **Database → Read and Write** permission. Set a short expiry if offered. Copy the token; it is shown only once.
3. Open [Tender GitHub Actions secrets](https://github.com/FYRIX341/Tender/settings/secrets/actions) and select **New repository secret**.
4. Secret name: `SUPABASE_ACCESS_TOKEN`. Secret value: the access token you copied (`sbp_...`). Click **Add secret**.
5. Open [Run Tender 0.2 Migration](https://github.com/FYRIX341/Tender/actions/workflows/migrate-tender.yml).
6. Click **Run workflow**, select `main`, then **Run workflow**. It is manual-only.
7. Open that run and look for the green check. Then refresh [Tender](https://fyrix341.github.io/Tender/).

You need **neither** the old `TENDER_DATABASE_URL` secret **nor** a Session pooler URL anymore. You can delete the old `TENDER_DATABASE_URL` secret under GitHub Secrets after setting up the new method.

## Security and troubleshooting

- **Never share the token or screenshots containing it.** Never paste it in a chat or commit it to a GitHub file.
- The token is not your website's public publishable key. Use a **Supabase Personal Access Token** with project-specific Database Read & Write.
- This GitHub workflow runs the unchanged SQL file `migration_0_2.sql` and includes a harmless `SELECT 1` check first.
- Supabase currently labels this [SQL Management API endpoint experimental](https://supabase.com/docs/reference/api/v1-run-a-query). If GitHub reports `401`, `403`, `404`, or a SQL error, stop and inspect the message instead of blindly retrying.
- For security after successful installation, revoke the token in Supabase and delete the `SUPABASE_ACCESS_TOKEN` GitHub secret. A future migration would require a new token.
- The original `schema.sql` is **not** run again; current Tender accounts, messages, and Pieces are not deliberately replaced.

Supabase official documentation: [Management API authentication](https://supabase.com/docs/reference/api/introduction), [SQL query endpoint](https://supabase.com/docs/reference/api/v1-run-a-query), [Scoped personal tokens](https://supabase.com/docs/guides/platform/personal-access-tokens).
