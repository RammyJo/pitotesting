# Seven Perfume V9.3

This is the cleaned project package for the Seven Perfume test storefront. It continues the existing V8/V9 project and does not include old version ZIPs.

## V9.3 changes
- Switched display typography to heavier Manrope sans-serif for readability on the ivory/white design.
- Added one consistent, delegated navigation handler so page links and CTAs route in the same tab. Browser back/forward is supported.
- Product image click opens an in-page gallery with three temporary views and a fast zoom transition. Replace the placeholder bottle renderings with official product photos when available.
- “VIEW DETAILS” opens the selected fragrance's detailed product page in the same tab. The product name is no longer a second navigation button.
- Favorites toggle in place without rebuilding the product grid.
- Add to Cart keeps the shopper's page position stable while opening the cart drawer.
- Cart bottle thumbnails are contained in fixed-size boxes so they cannot overlap cart text or neighboring rows.
- View Details now uses the same centralized route handler as the other navigation controls and the destination renders immediately before the page-entry animation.
- Instagram and Facebook icons are included in every standard page footer and link to the official URLs supplied for Seven Perfume.

## Run locally (Windows)
1. Install Node.js LTS if needed.
2. Double-click `run.bat`.
3. Open the local URL printed by the terminal.

## Cloudflare deployment
- Worker name: `pitotesting` (`wrangler.jsonc`).
- From this project folder, run `npm install`, authenticate with `npx wrangler login`, and deploy with `npx wrangler deploy`.
- Membership registration requires a real Cloudflare D1 database binding named `DB` and the schema in `migrations/0001_v9_membership.sql`. See `DEPLOYMENT.md`.

## Demo limitations
- This remains a test-mode order flow. No real money is charged.
- Shipping rates are placeholders; no LBC/J&T API is connected.
- PayMongo and verified payment webhooks are not connected.
- Seven Privé account registration requires the real D1 binding.
- Configure `ADMIN_TOKEN` as a secret; never put production credentials in frontend files or commit them.
- Catalog data, scent descriptions, and the temporary gallery visuals should be confirmed/replaced with official brand assets before launch.
- Visual browser testing could not be completed in this environment; verify the package on a real browser/phone after local run or deployment.
