# Seven Perfume — Cloudflare setup

## Deployment target

The deployable Worker project is at the **repository root**:
- wrangler.jsonc
- package.json
- src/index.js
- public/

Do not set Cloudflare's root directory to seven-perfume-commerce; that is a separate nested prototype, not the current root storefront.

## Local preview

1. Install Node.js LTS.
2. From the repository root, run npm install.
3. Run npm run dev for a Wrangler development preview, or npm start for the local Node test server.
4. Test checkout and admin behavior using synthetic data only.

## Admin secret

Set a strong Worker secret named ADMIN_TOKEN in the correct Cloudflare account. Never commit it, put it in browser JavaScript, or print it to logs. The local Node server's admin API is disabled until ADMIN_TOKEN is set in its environment.

## Before deployment

npm run deploy deploys the Worker named pitotesting configured in wrangler.jsonc. This can affect the live Worker. Confirm the Cloudflare account and intended branch before running it. A GitHub branch or PR does not automatically deploy.

## Test-mode limitations

- Worker orders are stored in isolate memory and can disappear; they are not production order records.
- No PayMongo payment is collected or verified.
- J&T/LBC rates are assumptions, not live courier quotes.
- The CSS bottle turntable is illustrative, not true 360-degree product photography.

Before real sales, add durable D1 (or equivalent) order storage, verified payment webhooks, production admin access controls, verified courier rates/tracking, inventory enforcement, idempotency, and customer policies.
