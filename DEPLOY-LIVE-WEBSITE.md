# Deploy the root Seven Perfume storefront

**Do not run a production deploy just to preview the create branch.** The Worker name in wrangler.jsonc is pitotesting, so npm run deploy can change the existing live Worker.

## Test without deploying to production

1. Install Node.js LTS.
2. Open the repository root (the folder containing wrangler.jsonc and package.json).
3. Run npm install.
4. Run npm run dev to start Wrangler's local development preview.
5. Test the routes, mobile layout, cart, test checkout, and admin authorization with synthetic data.

## Production deployment — only after review

1. Confirm the intended Git branch and review the entire create versus main diff and PR #3.
2. Confirm Wrangler is authenticated to the correct Cloudflare account.
3. Check wrangler.jsonc; the target is the Worker named pitotesting.
4. Ensure required Worker secrets (especially ADMIN_TOKEN) are configured in that account.
5. Run npm run deploy only when you intend to update that live Worker.
6. Verify the deployment output and then manually test the live site in a browser.

## Release warnings

- The create branch has diverged from main and removes the prior account/membership API and Seven Privé menu entry. Do not merge until that regression is deliberately resolved.
- Orders are test-only and not durably stored by the Worker.
- PayMongo is not integrated and no real payment is collected.
- Shipping rates are assumed test estimates.
- Placeholder bottle art is not a true 360-degree render.
- Deployment does not sync changes back to GitHub; GitHub and Cloudflare must be managed separately.
