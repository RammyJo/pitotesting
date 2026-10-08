# Seven Perfume Commerce — Test Storefront

This is a standalone ecommerce prototype for Seven Perfume.

## Current test features

- 13 fragrance products
- 10mL / ₱120
- 30mL / ₱350
- 50mL / ₱600
- Search
- Men / Women filters
- Favorites
- Quick view
- Size selection
- Cart
- Quantity controls
- Nationwide test shipping
- J&T Express test rates
- LBC Express test rates
- Address-based shipping calculation
- Test checkout
- Test order creation
- Test admin page

## Visual placeholders

The product photos have not been supplied yet, so the storefront uses intentional editorial perfume-bottle illustrations instead of blank image boxes. They are designed to look like part of the brand presentation and can later be replaced by the CEO's actual product photography without changing the shopping logic.

## Typography

The storefront currently uses:

- Cormorant Garamond for the display / product typography
- Manrope for interface and body text

The display face is elegant and slightly italic/calligraphic without becoming difficult to read. It can be replaced later once Seven Perfume's exact brand fonts are confirmed.

## Test mode

Shipping and payment are simulated. The rates are development assumptions, not official courier quotations.

Run locally with:

```text
run.bat
```

Then open:

```text
http://localhost:4173
```

Admin:

```text
http://localhost:4173/admin.html
```

V4 POLISH
---------
The storefront has been visually refined without changing the commerce logic:
- Bodoni Moda + Manrope typography
- softer button hover/press behavior
- larger touch targets
- improved input/select focus states
- gentler card motion
- refined spacing and hierarchy
- improved mobile toolbar and one-column behavior
- reduced-motion accessibility support

CLOUDFLARE
----------
This V6.1 package also contains:
- `wrangler.jsonc` for Cloudflare Workers + Static Assets
- `src/index.js` for a TEST `/api/orders` backend
- `CLOUDFLARE-SETUP.md` for deployment values

The Cloudflare order backend is deliberately TEST MODE and stores orders only in Worker memory. Before any real sales, replace this with D1/database persistence, admin authentication, and PayMongo verification.
