# Page Flow Update

Navigation has been converted from homepage section-jumps to distinct hash-routed page views.

## Main interactions tested

- Shop link loads the complete 13-item catalog.
- Product title opens that product's detail page.
- Selecting 10mL updates the unit price to ₱120; other sizes update to ₱350 and ₱600.
- Add to Cart increments the persistent cart count.
- Cart opens as a full page with quantity controls and Remove.
- Continue to Checkout opens the checkout form.
- Selecting a region shows the estimated J&T and LBC test rates; courier choice updates the selected option and total.
- Scent Finder answers progress through separate route states; browser Back returns to the previous question.
- About and search results load as separate pages.
- Browser Back/Forward works through hash route changes.
- Checked at a 390px phone viewport; no horizontal page overflow was detected in the main interaction test.

## Deliberate scope

This is still a storefront prototype. Payment remains simulated; courier rates are placeholders; the illustrated perfume bottles and descriptions are not official product photography or verified product claims. The updated project files have not been deployed to the live Worker.
