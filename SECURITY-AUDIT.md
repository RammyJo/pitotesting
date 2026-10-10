# Seven Perfume V7 — code and UX audit

This audit distinguishes **bugs**, **security risks**, and **quality/consistency issues**. No web application can be guaranteed to be bug-free, but the V7 pass addresses the major problems visible in this test codebase.

## Critical / high-risk findings fixed

### 1. Public order list
**Problem:** `GET /api/orders` returned every order to anyone.
**Risk:** Customer names, emails, phone numbers and delivery addresses could be exposed.
**Fix:** The endpoint now requires `Authorization: Bearer <ADMIN_TOKEN>` and returns 401/503 without it.

### 2. Public order deletion
**Problem:** `DELETE /api/orders` was unauthenticated.
**Risk:** Anyone who discovered the endpoint could erase every order in the test store.
**Fix:** The delete endpoint now requires the admin token.

### 3. Client-controlled prices and totals
**Problem:** The browser sent `subtotal`, `shipping`, `price` and `total`, and the backend accepted them.
**Risk:** A modified browser request could turn a ₱600 item into a ₱1 item.
**Fix:** The server now accepts only product IDs, size IDs, quantities, customer data and courier choice. Prices, weights, shipping and totals are recalculated from the server catalog.

### 4. Admin stored-XSS path
**Problem:** The old admin page injected order fields directly into `innerHTML`.
**Risk:** A malicious customer field could execute JavaScript whenever an admin opened the order page.
**Fix:** Admin rendering now HTML-escapes every stored value.

### 5. Orders stored in Worker global memory
**Problem:** `globalThis.__SEVEN_TEST_ORDERS__` is not durable storage and is not shared reliably across Worker instances.
**Risk:** Orders can disappear after restart/eviction and different instances can have different data.
**Fix:** The limitation is explicitly isolated to TEST MODE. Production notes now require D1/Supabase/Postgres before real sales.

### 6. No admin authentication model
**Problem:** The previous admin page was effectively public.
**Fix:** Admin API is token-protected; the admin UI uses `sessionStorage`, not URL query strings. Production should additionally use Cloudflare Access or equivalent identity controls.

### 7. Wildcard CORS in local server
**Problem:** The old Node server sent `Access-Control-Allow-Origin: *`.
**Risk:** It unnecessarily widened cross-origin access to the order API.
**Fix:** Same-origin requests are accepted; cross-origin requests are rejected.

## Functional bugs fixed

### 8. Size price on product cards did not update
**Problem:** Change handlers were attached before the product grid was rendered, so dynamically created `<select>` elements had no listener.
**Fix:** Event delegation listens on the grid after rendering.

### 9. Quick View / checkout backdrop overlap
**Problem:** `.cartOpen .backdrop`, `.modalOpen .backdrop`, and `.checkoutOpen .backdrop` made all three backdrops visible at once. The topmost backdrop could capture clicks intended for another layer.
**Fix:** Each state now activates only its own backdrop.

### 10. Browser could create duplicate test submissions
**Problem:** Checkout had no request-in-flight lock.
**Fix:** The place-order button is disabled while the request runs, and the backend also rate-limits order creation.

### 11. Client trusted a successful fetch too much
**Problem:** Errors could leave the checkout in an inconsistent state and lead to `j.order` access when no order existed.
**Fix:** HTTP status and response shape are checked, errors are caught, and the UI recovers cleanly.

### 12. Random order IDs could collide
**Problem:** `Math.random()` with a six-digit range could produce duplicates.
**Fix:** IDs now use a `crypto.randomUUID()`-derived value.

## Data consistency problems fixed

### 13. Catalog and pricing duplicated across layers
**Problem:** Product names, sizes, prices and shipping assumptions were separately hard-coded in different files.
**Risk:** A price could be changed in one layer but not another.
**Fix:** `src/catalog.js` is the single source of truth; the storefront reads products, sizes, region mapping and rates from `/api/catalog`. The server still recalculates all order totals.

### 14. `server.js` and Worker had separate order logic
**Problem:** Local Node and Cloudflare Worker accepted different shapes/validation behavior.
**Fix:** Shared `src/catalog.js` and `src/order.js` now contain the catalog and order-calculation logic used by both environments.

### 15. ZIP code missing from checkout
**Problem:** The earlier UI said nationwide delivery but did not collect the ZIP code.
**Fix:** Added a required 4-digit ZIP field with postal-code autofill hints and server validation.

## Security and reliability improvements

### 16. Request-body limits
Large order payloads were previously accepted without an explicit application limit.
**Fix:** 50 KB maximum JSON body in Worker and local server.

### 17. Basic rate limiting
There was no protection against repeated order submissions.
**Fix:** A lightweight per-IP in-memory rate window limits order creation attempts. This is useful for the demo, but production should use a durable/global rate-limiting strategy.

### 18. Security headers
**Problem:** The app had no explicit security header layer.
**Fix:** Added CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy on Worker/local server responses.

### 19. Inline admin JavaScript
**Problem:** Admin logic was embedded directly in HTML, making CSP harder and mixing concerns.
**Fix:** Moved it into `/admin.js`.

### 20. Unpinned Wrangler dependency
**Problem:** `wrangler: latest` can silently change between deployments.
**Fix:** Pinned to the version used by the successful deployment: `4.148.0`.

### 21. Local order data could accidentally enter Git
**Problem:** `data/orders.json` is a PII-bearing file.
**Fix:** Added `.gitignore` rules and removed the data file from the distributable. The local server recreates it as needed.

## UX / visual inconsistencies fixed

### 22. Mobile navigation disappeared completely
**Problem:** The desktop nav was simply hidden on small screens.
**Fix:** Added a small mobile menu button and drawer.

### 23. Card size selector looked less polished than Quick View
**Fix:** Styled the catalog size selector to match the refined Quick View selector.

### 24. Test checkout label overstated security
**Problem:** "SECURE TEST CHECKOUT" could imply a production payment system when payment was still simulated.
**Fix:** Changed it to a neutral `CHECKOUT` heading; the test-mode notice remains explicit.

### 25. Form autofill and accessibility
**Fix:** Added labels, `autocomplete`, input modes, ARIA states, live regions, Escape-to-close behavior and better button labels.

## Remaining production blockers

- No durable production database yet.
- No real PayMongo integration/webhook verification yet.
- No true courier API/rate lookup yet.
- No inventory enforcement yet.
- No production admin identity/SSO yet.
- No order idempotency key yet.
- Legal/policy pages are not yet configured.
- Product photography is still placeholder artwork.
- Pricing/catalog is still the development assumption set provided for testing.

V7 is a materially safer and cleaner **test/preview build**, not a claim of production readiness.
