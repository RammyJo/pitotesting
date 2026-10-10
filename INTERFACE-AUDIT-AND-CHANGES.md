# Seven Perfume — Interface Audit & Polish Pass

## Scope

This pass focuses on the customer-facing interface and browsing experience. Navigation remains page-based: ordinary navigation buttons/links open another route rather than jumping to a section on the same page. Checkout still creates test orders only; no production payment or courier connections were added.

## Bugs and UX issues found

### 1. Saving a fragrance could reset the shopper's choices

**Problem:** The favourite action previously re-rendered the entire active route. If the shopper had picked a 10mL or 50mL bottle, or changed quantity, using a heart button could recreate the page and reset those selections.

**Change:** Favourite state now updates the heart/save controls in place. The full page only re-renders when a saved item is removed from the Saved Fragrances page itself. Bottle-size and quantity selections remain undisturbed.

### 2. The search box could show an old query on the wrong page

**Problem:** Leaving search results could leave the previous query visible in the header, even after returning to Home or opening a different page. That makes it unclear whether the old query is still active.

**Change:** The search input is restored from the current route query on Shop pages and cleared when on other pages.

### 3. Product availability wording over-promised what the system knows

**Problem:** Product cards displayed “Available to order” despite having no live inventory system.

**Change:** Cards now say “3 bottle sizes”. This accurately describes the available size choices without implying live stock verification.

### 4. Horizontal product discovery was missing

**Problem:** The homepage featured products and related products depended on regular grids. That forces visitors to scroll further down to explore more products and does not invite lateral browsing.

**Change:** Added horizontal, scroll-snap product shelves for Featured Fragrances, For Him, For Her, and related products. They support touch swipes, trackpad/sideways scrolling, arrow buttons, and left/right arrow keys while focused. A partial next card is intentionally visible on phones as a visual cue.

### 5. The homepage lacked visual pacing between product sections

**Problem:** Beyond the hero and a single product row, there were few changes in visual rhythm to reward continued scrolling.

**Change:** Added a dark featured-campaign banner and two editorial promotional panels. They are brand-style promotions, not fake third-party ads. Their calls to action lead to actual product, shop, or scent-finder routes. No made-up sale price, discount, review, or stock claim was added.

### 6. Small-screen controls needed more forgiving touch targets

**Problem:** Product card controls and favorite icons could be cramped on a phone. The fixed bottom dock could also sit close to content at the bottom of a page.

**Change:** Increased mobile action buttons, size selectors, heart controls, category links, and dock tap areas. Added extra bottom safe-area space to the route outlet. The product grid remains two-column on phones; horizontal product shelves use larger swipe cards.

### 7. Scroll motion needed clearer hierarchy

**Problem:** All sections had a similar visual entrance, and there was little motion to encourage discovery below the first screen.

**Change:** Added soft reveal-on-scroll for selected homepage sections and retained the existing route transitions, bottle float, and card hover motion. `prefers-reduced-motion` disables these decorative effects.

### 8. A dormant sorting comparator was broken

**Problem:** The source had a `low` sort branch using a comparator that always returned zero. It was not shown as a user-facing option, but it would not have sorted anything if surfaced later.

**Change:** Removed that dead branch rather than exposing a misleading “sort by price” feature. The current customer-facing sorting choices remain Featured, A–Z, and Z–A.

## What was deliberately not changed

- The route model and its back/forward behavior.
- Product catalog data and current price assumptions: 10mL ₱120, 30mL ₱350, 50mL ₱600.
- The test checkout contract and server-calculated order totals.
- The fact that LBC/J&T rates are test estimates, not live courier quotations.
- The fact that payments are simulated; PayMongo is not connected.
- The illustrated bottle visuals and editorial fragrance descriptions; they are placeholders until official product assets and verified descriptions are supplied.

## Validation performed

- JavaScript syntax check passed for the storefront script and local server.
- Compiled the homepage, Shop results, product detail, About, scent finder, cart-empty, and checkout-empty view templates in a lightweight Node VM harness.
- Template assertions passed for all three horizontal shelves, campaign/editorial blocks, related-product rails, accurate size wording, and query state.
- Local test server health and catalog endpoints responded successfully; the catalog returned 13 products and `testMode: true`.
- The admin orders endpoint returned HTTP 503 without an admin token, as expected for a server launched without `ADMIN_TOKEN`. Use `run.bat` on Windows to set the local development token before launching the test server.

A full visual browser screenshot could not be captured in this runtime because Chromium navigation was blocked by the environment policy. The responsive rules were checked in the stylesheet, but visual confirmation on a real phone/desktop is still recommended.
