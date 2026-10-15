# Production blockers before real sales

1. Replace the in-memory test order store with durable database storage.
2. Keep `ADMIN_TOKEN` server-side; use Cloudflare Access or equivalent for production admin access.
3. Connect PayMongo using server-side secrets only. Never place live keys in GitHub or browser code.
4. Mark orders PAID only from a verified PayMongo webhook, not from the browser.
5. Replace the assumed LBC/J&T rates with verified merchant/API rates.
6. Add stock/inventory enforcement on the server.
7. Add order idempotency to protect against duplicate submissions.
8. Add real shipping/tracking integration after courier credentials are available.
9. Publish Terms, Privacy, Refund/Return, Shipping, and Contact pages before production.
10. Replace editorial bottle placeholders with approved Seven Perfume photography.
11. Move the production project into a Seven Perfume-owned GitHub/Cloudflare/PayMongo account structure, with developer access granted to the designer.
12. Perform a final security review and payment test before switching from TEST to LIVE.
