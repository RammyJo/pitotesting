# Seven Perfume — Rotation Update and Release QA Audit

Date: 2026-10-12
Target: `create` branch only. The live `main` branch was not changed.

## Implemented in this pass

- Changed the CSS-generated placeholder product bottles to cylindrical silhouettes with round cap/body shading.
- Added horizontal pointer-drag rotation to the placeholder bottle illustrations. This is a **simulated 3D effect**, not a true 360-degree product-photo set.
- Added a visible “DRAG TO ROTATE” hint to product cards and product-detail art.
- Updated the home hero and Our Story illustrations to use cylindrical bottle silhouettes too.
- Changed the test order status from `TEST_PAID` / `PROCESSING` to `NOT_COLLECTED` / `TEST_ORDER` in both the Cloudflare Worker and local Node server. The checkout does not collect real payment, so it must not imply that it has.
- Bumped the static asset query version so browsers request the updated storefront files.

## High-priority issues still open

### 1. Orders are not durably stored in the Cloudflare Worker
The Worker stores orders in a global in-memory array. Cloudflare can evict or replace isolates, and different isolates do not share that array. Orders can disappear or be inconsistent. Before real sales, use D1, Durable Objects, or another persistent database and test retries/concurrency.

### 2. Payments are not integrated
Checkout is a test-order flow only. No payment provider confirms payment, and no webhook reconciles paid/refunded/failed states. Do not accept real orders or describe them as paid until payment integration and webhook verification exist.

### 3. Courier prices are assumptions, not live quotations
J&T and LBC amounts are hard-coded estimates. There is no live courier API, serviceability check, parcel booking, or tracking integration. Clearly label these as estimates until verified against the actual courier contract/API.

### 4. Frontend and backend catalog data are duplicated
The storefront hard-codes product names/descriptions and size prices in `public/app.js`; the backend separately defines catalog data in `src/catalog.js`. They can drift after a product or price update. Consolidate the catalog or fetch it from `/api/catalog` and verify that checkout always uses server-side prices.

### 5. Test order PII needs careful handling
Orders contain names, emails, phone numbers and delivery addresses. Keep test data synthetic, protect the admin token, never commit real order records, and define a retention/deletion policy before launch. The local JSON file is not a production multi-user database.

### 6. The open branch needs a release review
The `create` branch has diverged from `main` and contains broader changes than the bottle preview. Review the complete pull-request diff before merging; do not merge unrelated account/membership removals or sample order data unintentionally.

## Additional quality checks to complete before launch

- Test all routes with browser back/forward, refresh, invalid product IDs, empty search results, and mobile navigation.
- Test cart persistence, duplicate items, quantity limits, all three sizes, and cart contents after failed checkout.
- Test checkout validation with invalid email, phone, region, postal code, missing fields, network failure, and server error.
- Test admin access with no token, wrong token, correct token, logout, refresh, and clearing test orders.
- Verify keyboard navigation, screen-reader labels, contrast, reduced-motion behavior, and touch interactions on a real phone.
- Replace all placeholder bottle illustrations and unverified fragrance descriptions with approved brand assets and verified product copy before launch.
- Add automated tests for order validation, shipping calculations, API authorization, and route templates. Run a browser-based end-to-end suite against the preview deployment.

## Validation limits

The GitHub file edits succeeded on `create`. I have not yet run a browser session or end-to-end tests against the preview URL, so the drag interaction and responsive appearance still need hands-on verification. The rotation is intentionally a stylized CSS mockup; it cannot reveal a real bottle's back/side details.
