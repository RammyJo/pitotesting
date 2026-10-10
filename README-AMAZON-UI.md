# Seven Perfume — Amazon-inspired storefront (test project)

This is a **complete local project**, based on the existing Seven Perfume V8.3 test project, with the new Amazon-inspired interface applied. It includes the frontend, local test server, catalog/order validation, Wrangler configuration, and admin page.

## Run it on your computer

1. Extract this ZIP.
2. Open the `seven-perfume-commerce` folder.
3. Double-click `run.bat` (Node.js must be installed).
4. Open `http://localhost:4173`.

## What changed in the interface

- Persistent search bar and Amazon-inspired category/navigation bar
- Premium Seven-style color palette and typography
- Compact catalog tools and two-column product grid on phones
- Product detail modal, size selectors, favourites, sorting and category filtering
- Smooth hover/touch motion and reduced-motion accessibility
- Cart stored in the browser across refreshes
- ZIP code field and checkout payload aligned with the existing test server

## Test-mode warnings

- Orders and payments remain in **TEST MODE**. No real payment is taken.
- LBC/J&T fees are assumed development rates, not official quotations or a live courier integration.
- The backend recalculates product prices and shipping from its catalog; the browser does not set authoritative prices.
- The admin API is protected. Configure an `ADMIN_TOKEN` before using the admin order endpoints.
- This project has **not** been published to the live Cloudflare site by this ZIP. The connected GitHub update request was rejected, so the live site remains unchanged until these files are committed and deployed.

## Files

- `public/index.html`, `public/style.css`, `public/app.js` — new storefront UI
- `server.js`, `src/` — local test backend and catalog validation
- `public/admin.html`, `public/admin.js` — test admin interface
- `wrangler.jsonc`, `package.json` — Cloudflare Worker configuration
