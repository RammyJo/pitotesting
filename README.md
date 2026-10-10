# Seven Perfume — Page-flow storefront (test project)

This is the complete local development project for the Seven Perfume storefront. The storefront now uses page-based navigation: clicking Shop, a fragrance, Scent Finder, Our Story, Cart, or Checkout opens a distinct page view instead of jumping down a long homepage.

## Run locally

1. Extract the ZIP.
2. Open the extracted `seven-perfume-commerce-amazon-ui` folder.
3. Double-click `run.bat` (Node.js must be installed).
4. Open `http://localhost:4173` in your browser.

## Page navigation and working interactions

- Home, Shop, For Him, For Her, Saved Fragrances, Scent Finder, Our Story, Cart, Checkout, and Order Confirmation are separate client-side page routes.
- Browser Back and Forward return to the prior page/question.
- Header search opens a search-results page when submitted.
- Product cards open individual fragrance detail pages.
- Bottle size selection updates price; quantity, Add to Cart, and Buy Now work.
- Favorites are saved in the browser and shown on the Saved Fragrances page.
- The cart persists across refreshes and supports quantity changes and removal.
- Checkout validates delivery fields, lets customers choose J&T or LBC, and submits a test order to the backend.
- Test orders use backend-calculated prices and shipping. A successful test order opens a dedicated confirmation page.
- Mobile navigation includes Home, Shop, Scent Finder, and Cart; the product catalog uses two columns on common phone widths.
- Soft page transitions and bottle/card motions respect the user's reduced-motion preference.

## Interface polish pass

The latest interface update adds a more guided, editorial shopping experience without changing the page-based route model:

- Featured fragrances, For Him, For Her, and related products now use side-scrolling product shelves with snap points, swipe/trackpad scrolling, arrow controls, and keyboard arrow-key support.
- The homepage now has a featured campaign banner and two editorial promotional cards that lead to actual product/category/finder pages. They do not claim discounts or pretend to be third-party ads.
- Selected homepage sections reveal gently as the shopper reaches them; reduced-motion settings disable the decorative animations.
- Mobile touch targets have been enlarged, the bottom navigation receives extra safe-area space, and product shelves show a partial next card to make horizontal browsing discoverable.
- Saving a fragrance now updates the heart and saved state without rebuilding the whole page; this keeps the currently selected bottle size and quantity intact.
- Search text now reflects the active page, so an old search does not remain in the header after leaving search results.
- Product cards say “3 bottle sizes” rather than implying live stock availability, because real inventory is not connected.
- Removed an unused price-sort branch whose comparator always returned zero. It was not exposed as a customer-facing option.

See `INTERFACE-AUDIT-AND-CHANGES.md` for the full bug and UX change list.

## Important: test mode only

- Orders and payment status are simulated. No real payment is taken.
- LBC/J&T rates are assumed development estimates, not official quotations or a live courier integration.
- The product descriptions and illustrated bottles are placeholders until the brand provides verified product details and photography.
- The admin API is protected. Do not remove authentication to make the admin page easier to access.
- This ZIP is for local testing and development. It has **not** been deployed to the live Cloudflare URL.

## Project files

- `public/index.html`, `public/style.css`, `public/app.js` — storefront and page-flow interface
- `public/admin.html`, `public/admin.js` — test admin page
- `server.js`, `src/catalog.js`, `src/order.js` — local test server, product catalog, order validation
- `wrangler.jsonc`, `package.json` — Cloudflare Worker configuration and development dependency
- `data/orders.json` — sample test order data

## Routes to try

- `#/home`
- `#/shop?gender=all`
- `#/shop?gender=men`
- `#/shop?gender=women`
- `#/product/alpha` (also `omega`, `boaz`, `exodus-noir`, `pacific`, `invincible`, `caelum`, `gourmand`, `solace`, `hadar`, `darling`, `asmira`, `elan`)
- `#/favorites`
- `#/finder`
- `#/about`
- `#/cart`
- `#/checkout`
