# Seven Perfume — Cloudflare setup

This version is Cloudflare Workers-ready.

## What it does now
- Serves the existing `public/` storefront through Cloudflare static assets.
- Handles `/api/orders` through a Cloudflare Worker.
- Keeps test orders in worker memory for the CEO demo.
- Keeps the existing local `server.js` so the same project still runs locally.

## Important
This backend is TEST MODE only. In-memory orders can disappear when the Worker is restarted or evicted. Do not use this for real customer orders.

Before production we will replace the in-memory order store with Cloudflare D1 or another production database and add proper admin authentication.

## Cloudflare dashboard values
Repository: `pitotesting`
Root directory: `seven-perfume-commerce`
Build command: leave blank
Deploy command: `npx wrangler deploy`

If Cloudflare asks for a root directory, use `seven-perfume-commerce` because `wrangler.jsonc`, `package.json`, `src`, and `public` live there.
