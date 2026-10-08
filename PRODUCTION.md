# Production Notes

Before going live:

1. Replace the editorial bottle placeholders with the CEO's real product photography.
2. Keep the current product data, size variants, cart, checkout and order model.
3. Replace assumed J&T/LBC shipping rates with verified merchant/API rates.
4. Replace local test payment with a server-side PayMongo integration.
5. Store orders in a hosted database such as Supabase instead of local `data/orders.json`.
6. Add payment webhooks so paid/unpaid state is server-confirmed.
7. Add shipment/tracking integration after courier credentials are available.
8. Deploy the frontend and backend to production hosting rather than localhost.
9. Keep secrets out of GitHub/browser code.

## Design placeholder strategy

The current product visuals are intentionally generated in CSS/HTML. They are not being presented as real photographs. When real product assets arrive, replace only the visual layer and preserve the commerce logic.
