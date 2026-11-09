# GitHub deployment with Cloudflare Workers and Neon

This setup uses Cloudflare Workers for the website and API, Neon Free for PostgreSQL, and GitHub as the source repository. It does not use Vercel, Render, or Azure.

## Cloudflare setup

1. In Cloudflare, create a Worker from the GitHub repository `sivakalyankaricheti/Monthly-Expenses` and select the deployment branch.
2. Use the Cloudflare Vite plugin build (`pnpm install --frozen-lockfile`, then `pnpm run build`).
3. Create a Cloudflare Hyperdrive configuration named `monthly-expenses-neon` for the Neon production database. Use the direct Neon connection string with Neon connection pooling disabled, and disable Hyperdrive query caching for this app.
4. Bind the configuration to the Worker as `HYPERDRIVE` (the ID is stored in `wrangler.jsonc`). Hyperdrive stores the connection details encrypted; never commit or paste the connection string in GitHub.
5. Add `PUBLIC_BASE_URL` as the Worker URL. Add `RESEND_API_KEY` and `MAIL_FROM` only if password-reset email is needed.
6. Keep Cloudflare on its Free plan and Neon on its Free plan; do not enable paid overages.

## Data expiry

The Worker cron trigger runs daily at 03:00 UTC. It deletes saved history versions older than 10 days and removes a non-admin account plus its current records after 10 days without app activity. Since the trigger runs daily, inactive-account deletion may occur up to 24 hours after the 10-day threshold. Active users keep their current records; their older saved versions still expire after 10 days.

## GitHub deployment

Cloudflare Workers Builds deploys new commits from the connected GitHub branch. Keep database URLs, email keys, and other secrets only in Cloudflare Worker secret settings.
