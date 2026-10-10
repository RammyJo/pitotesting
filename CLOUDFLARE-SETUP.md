# Seven Perfume — Cloudflare-ready setup (V7)

## Cloudflare Worker
Repository: `pitotesting`
Root directory: `seven-perfume-commerce` if the project remains inside that folder.
Build command: leave blank.
Deploy command: `npx wrangler deploy`.

## Admin protection
The order API is no longer public.

Create a Cloudflare Worker secret named:
`ADMIN_TOKEN`

Use a strong random value. Do not commit it to GitHub and do not put it in frontend JavaScript.

Local testing: `run.bat` generates a temporary local admin token and prints it in the Command Prompt. Use that token at `/admin.html`.

## Important test-mode limitation
The Cloudflare Worker still keeps TEST orders in memory. That is intentionally temporary for the CEO demo. Worker instances can restart or scale, so these are not durable business records.

Before real customers:
- replace memory storage with D1/Supabase/Postgres
- add proper admin identity/access control (Cloudflare Access is recommended for the admin route)
- connect PayMongo server-side
- confirm payments with PayMongo webhooks
- replace assumed shipping rates with verified courier data/API
- add production policies and customer support information
