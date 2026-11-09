# GitHub deployment with 10-day data expiry

This project can deploy from the `main` branch of `sivakalyankaricheti/Monthly-Expenses` to Vercel, with PostgreSQL hosted separately by Neon. The free plans are intended for personal/non-commercial use. Vercel Hobby currently has usage caps and pauses projects that exceed included usage; Neon Free currently includes up to 1 GB per project and 100 compute hours per month. Check both dashboards before creating anything and do not select an upgrade or paid add-on.

## One-time setup

1. Create a Neon Free project and copy its pooled PostgreSQL connection string. Keep it private.
2. In Vercel, import `sivakalyankaricheti/Monthly-Expenses` from GitHub and deploy the `main` branch.
3. In Vercel project settings, add these Production environment variables, then redeploy:
   - `DATABASE_URL`: Neon pooled PostgreSQL connection string.
   - `CRON_SECRET`: a long random secret used by Vercel's daily cleanup request.
   - `PUBLIC_BASE_URL`: the production HTTPS website URL, without a trailing slash.
   - `RESEND_API_KEY` and `MAIL_FROM`: only if password-reset email is required.
4. Keep the app on the Vercel Hobby plan and the database on Neon Free; do not enable paid overages.

The database schema and initial starter records are created by `server.mjs` when the app starts. This is a fresh database; it does not restore the old Render database.

## Data expiry

Vercel calls `/api/cron/cleanup` daily at 03:00 UTC. The endpoint requires the `CRON_SECRET` bearer token. It deletes saved history versions older than 10 days, and deletes a non-admin account plus its current records after 10 days without app activity. Daily scheduling means inactive account deletion can occur up to 24 hours after the 10-day threshold. A user who continues using the app keeps their current records; their older saved versions still expire after 10 days.

## GitHub deployment

Vercel automatically builds and deploys new commits pushed to the connected production branch. Never commit `.env` files, database connection strings, cron secrets, or email API keys.
