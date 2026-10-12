# Seven Perfume — Storefront Audit and Rotation Improvements

Date: 2026-10-12  
Target: `create` branch only. `main` was not changed.

## Changes in this pass

- Reworked the fake-bottle turntable. It no longer rotates a flat label through CSS `rotateY()`, which made the bottle look like a card and mirrored the text.
- The bottle narrows as it turns toward a side view; the label fades at edge-on angles and stays readable on the reverse-facing side.
- Added a shared rotation setter so drag and keyboard controls use the same orientation logic.
- Replaced a CSS `calc()` multiplication expression with a JavaScript-computed opacity value for broader browser compatibility.
- Added Negros Island Region (NIR) to the server-side Philippine shipping region map so checkout accepts this officially established region.
- Fixed keyboard rotation: focus normally lands on the product link surrounding the bottle, not the decorative bottle div. Left/right arrow keys now find and rotate the bottle inside the focused link.
- Kept horizontal pointer dragging, pointer cancellation cleanup, click suppression after a drag, and vertical page scrolling on touch screens.
- Updated CSS/JS cache version so clients request the changed interaction.
- Preserved test-order statuses `NOT_COLLECTED` and `TEST_ORDER`; this storefront still does not collect real payment.

## What this rotation is — and is not

This is a stylized visual mockup using CSS-generated bottles. It is **not a true 360-degree product render** and does not show real side/back product details. A convincing, accurate turntable needs a matching set of product photos (or a properly modelled 3D asset) for each fragrance and size. Do not present the placeholder art as a photograph of the actual product.

## Audit findings — unresolved launch blockers

### Critical: Worker order persistence
`src/index.js` stores test orders in a global in-memory array. Worker isolates can restart and do not share that array, so orders may disappear or appear inconsistent. Persist orders in Cloudflare D1 (or another durable store) before accepting real orders.

### Critical: Payment state
There is no confirmed PayMongo integration or signed webhook reconciliation. Checkout is a test-order flow; it must not say that an order is paid or accept real payment until payment creation, webhook signature verification, idempotency, and paid/failed/refunded states are implemented and tested.

### High: Region coverage must stay current
The server-side region map now includes Negros Island Region (NIR) and treats it as Visayas for the demo rate calculation. The zone assignment is a placeholder shipping assumption, not a courier-confirmed serviceability result. Keep the frontend and backend region lists in sync when regional data changes.

### High: Shipping is estimated
J&T/LBC prices are hard-coded estimates, not live quotes or bookings. Label them as estimates and confirm coverage, rates, delivery timing, and tracking before launch.

### High: Frontend/backend catalog duplication
Product names, descriptions, and size prices are duplicated between `public/app.js` and `src/catalog.js`. Keep the server authoritative for prices and stock; add a catalog endpoint or generate both from one source, and test that manipulated client prices are ignored.

### High: Admin and personal data
Names, contact details, and delivery addresses are sensitive. Keep sample records synthetic; do not commit real order data. Verify admin-token handling, avoid exposing secrets in client code/logs, add retention/deletion controls, and move production orders out of a local JSON file or Worker memory.

### High: Branch/release risk
`create` has diverged from `main` and contains more than the rotation work. Review the complete PR diff and compare route/API changes before merging. This pass changed `create` only.

## Further improvements recommended

1. Add automated tests for order validation, server-side price calculation, shipping zones, admin authorization, and error responses.
2. Add browser end-to-end tests for every route, refresh/back/forward, invalid product IDs, empty search, cart persistence, quantity changes, and checkout failures.
3. Test on real mobile devices for drag-vs-scroll behavior, touch target sizes, responsive product-detail layouts, and reduced-motion preferences.
4. Audit every visible product claim and fragrance note against approved brand copy; remove any unsupported longevity, stock, delivery, or performance promises.
5. Confirm accessibility for keyboard-only users, screen readers, focus order, contrast, form errors, and reduced-motion.
6. Add user-facing loading, empty, success, and failure states for network/API operations.
7. Avoid showing the rotation hint on decorative hero/story bottles where no pointer interaction is wired; reserve it for interactive product cards/details.
8. Keep a visible disclaimer on the product detail that the generated bottle is illustrative until real product photography is supplied.

## Verification status

- Source-level edits are committed to `create`.
- This connector session did not run a browser or test suite. The updated drag/keyboard behavior, visual quality, and deployment still require browser verification.
- No production launch or payment readiness is claimed.


## Additional repository hygiene fixes

- Cleared the checked-in sample order record so the local admin no longer opens with a stale `TEST_PAID` / `PROCESSING` example that conflicts with the current no-payment test flow.
- Added an `npm start` script for the actual root-level local server.
- Corrected the root README so it describes the root deployment target, local start command, test-only limitations, and current release blockers.
- Removed logging of the literal local admin token from `server.js`; the startup message now only indicates whether a token is configured.
- Kept the product catalog and test-order limitations explicit; catalog deduplication and durable Worker storage remain unresolved.


## Additional regression audit

### High: Existing membership/account functionality was removed from the branch diff
Compared with main, the current create branch removes the Seven Privé menu entry and /api/account/* register/login/session/membership API code. This is a product-scope regression, not just a visual change. Do not merge PR #3 until this removal is either restored or explicitly approved. Restoring the API alone is not enough to call membership functional: it requires the D1 binding/schema, frontend routes/forms, and end-to-end account tests.

### High: Deployment instructions were stale and unsafe
The earlier deployment docs pointed to nested prototype folders even though the root wrangler.jsonc targets the current Worker. They also encouraged deploying directly to the live Worker for a visual preview. Updated the docs to use the repository root and local Wrangler preview first, with production deployment only after diff review.

### Still unresolved
- Frontend product data is still hard-coded separately from src/catalog.js; the security audit previously claimed it was fetched from /api/catalog, but current public/app.js does not do that.
- No automated test suite or browser E2E run was available in this pass.
- PR #3 remains open and create is diverged from main (25 commits ahead, 1 behind at the time of this audit).
