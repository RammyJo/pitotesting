# Deploy the updated interface to the existing live website

This project is configured to target the existing Cloudflare Worker named `pitotesting`. Confirm the name in `wrangler.jsonc` before deploying.

## Steps (Windows)

1. Install Node.js LTS if it is not already installed.
2. Extract this ZIP. Open the `seven-perfume-commerce-amazon-ui` folder.
3. Open Command Prompt or PowerShell in that folder.
4. Run `npm install`.
5. Run `npx wrangler login` and sign in to the Cloudflare account that owns `pitotesting` (only needed once per computer/session).
6. Run `npm run deploy`. Check the output and make sure it says the Worker `pitotesting` was deployed successfully.
7. Open https://pitotesting.ram-a15.workers.dev on your phone and refresh it.

## Important

- Deploying changes the live `pitotesting` Worker. It is not a preview deployment.
- Do not deploy if Wrangler shows a different account or a different Worker name. Stop and check `wrangler.jsonc` first.
- This is still a test storefront. Payment and courier rates are not live, and test orders are not durable production records.
- GitHub is not automatically updated when you deploy locally. To keep GitHub in sync, commit and push the same files separately.
