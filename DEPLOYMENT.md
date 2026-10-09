# Deployment guide — Seven Perfume V9.3

## Before publishing
1. Sign in to Cloudflare with `npx wrangler login`.
2. From this project folder, run `npm install`.
3. For VIP accounts, create a D1 database: `npx wrangler d1 create seven-perfume-db`.
4. Copy the real database ID from the command output and add this binding to `wrangler.jsonc`:

```jsonc
"d1_databases": [
  { "binding": "DB", "database_name": "seven-perfume-db", "database_id": "PASTE_REAL_ID_HERE" }
]
```

5. Apply the schema: `npx wrangler d1 migrations apply seven-perfume-db --remote`.
6. Configure a strong Worker secret named `ADMIN_TOKEN` in Cloudflare.
7. Deploy: `npx wrangler deploy`.
8. Check `/api/health` and `/api/catalog`, then test View Details from both the home and shop grids, social icon links, navigation, gallery modal, cart, checkout, registration, and order creation on desktop and a phone.

## Not ready for real payments
PayMongo checkout and verified webhook handling, actual courier rates, email verification, password recovery, production admin authentication, legal/privacy pages, and approved product photography/copy still require implementation and testing. The current order path remains a demo/test flow.
