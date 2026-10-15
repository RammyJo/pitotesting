# Seven Perfume — Storefront test project

This repository's **root project** is the Cloudflare Worker storefront. The nested `seven-perfume-commerce/` folder is a separate prototype and is not the deployment target.

## Run the root project locally

1. Install Node.js (LTS).
2. In the repository root, run `npm install`.
3. Start the local Node test server with `npm start`.
4. Open `http://localhost:4173`.

The local server stores **test orders** in `data/orders.json`. It does not process payments. To enable the local test-admin API, set an `ADMIN_TOKEN` environment variable before starting the server. Do not use a real production secret in test environments.

For the Cloudflare Worker development preview, run `npm run dev`. To deploy, use `npm run deploy` only after confirming the intended Cloudflare account, project, environment variables, and release branch.

## Current storefront features

- Page-based routes for Home, Shop, fragrance details, Saved Fragrances, Scent Finder, Our Story, Cart, Checkout, and test confirmation.
- Product size selection, quantity controls, favourites, cart persistence, search, and horizontal product shelves.
- CSS-generated placeholder bottle illustrations with a stylized drag/arrow-key turntable effect.
- Checkout validates customer fields and recalculates product prices and estimated shipping on the server.
- Test admin page at `/admin.html`; order API requires a configured admin token.
- Philippine region-based demo shipping estimates for J&T and LBC.

## Important limitations

- **Test mode only.** No PayMongo payment is collected or confirmed. Orders use `NOT_COLLECTED` and `TEST_ORDER` statuses.
- Cloudflare Worker orders are held in isolate memory and are not durable. Do not use the Worker order API for real sales until a persistent database is implemented.
- J&T/LBC fees are assumed estimates, not live courier quotes, bookings, or tracking.
- The turntable is a stylized placeholder, not a true 360-degree render or photograph of the real bottle.
- Product descriptions and notes are editorial placeholders pending approved brand copy and photography.
- The client and server currently maintain separate catalog definitions; server-side prices remain authoritative for order totals.

## Main files

- `public/index.html`, `public/style.css`, `public/app.js` — storefront UI
- `public/admin.html`, `public/admin.js` — test admin UI
- `server.js` — local Node test server
- `src/index.js` — Cloudflare Worker API and asset handler
- `src/catalog.js`, `src/order.js` — authoritative server catalog, shipping assumptions, and order validation
- `data/orders.json` — local test-order storage
- `wrangler.jsonc`, `package.json` — Cloudflare configuration and scripts
- `QA-AUDIT-ROTATION-AND-RELEASE.md`, `SECURITY-AUDIT.md`, `PRODUCTION.md` — audits and launch blockers

## Useful routes

- `#/home`
- `#/shop?gender=all`
- `#/shop?gender=men`
- `#/shop?gender=women`
- `#/product/omega`, `#/product/exodus-noir`, `#/product/solace`
- `#/favorites`
- `#/finder`
- `#/about`
- `#/cart`
- `#/checkout`

## Before merging or launching

Review the full `create` versus `main` diff. Add automated order/API tests, verify admin authentication, persist Worker orders in D1 or another database, integrate and verify payment webhooks, confirm courier rates, publish customer policies, and test the deployed site in a real browser.
