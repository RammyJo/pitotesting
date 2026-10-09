import { PACKAGING_WEIGHT, REGION_ZONE, getProduct, getSize, shippingQuote } from './catalog.js';

const MAX_FIELD = 160;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+()\-\s]{7,20}$/;

function clean(value, max = MAX_FIELD) {
  return String(value ?? '').trim().slice(0, max);
}

export function validateCustomer(input) {
  const customer = {
    name: clean(input?.name, 100),
    email: clean(input?.email, 160).toLowerCase(),
    phone: clean(input?.phone, 30),
    region: clean(input?.region, 120),
    province: clean(input?.province, 100),
    city: clean(input?.city, 100),
    barangay: clean(input?.barangay, 100),
    address: clean(input?.address, 180),
    zipCode: clean(input?.zipCode, 10),
  };
  if (!customer.name || !customer.email || !customer.phone || !customer.region || !customer.province || !customer.city || !customer.barangay || !customer.address || !customer.zipCode) {
    return { ok: false, error: 'All delivery fields are required.' };
  }
  if (!EMAIL_RE.test(customer.email)) return { ok: false, error: 'Enter a valid email address.' };
  if (!PHONE_RE.test(customer.phone)) return { ok: false, error: 'Enter a valid phone number.' };
  if (!/^\d{4}$/.test(customer.zipCode)) return { ok: false, error: 'Enter a valid 4-digit ZIP code.' };
  if (!REGION_ZONE[customer.region]) return { ok: false, error: 'Select a valid Philippine region.' };
  return { ok: true, customer };
}

export function buildOrder(input) {
  const customerResult = validateCustomer(input?.customer);
  if (!customerResult.ok) return customerResult;

  const courier = String(input?.shipping?.courier || '').toUpperCase();
  if (!['JNT', 'LBC'].includes(courier)) return { ok: false, error: 'Select a valid courier.' };
  if (!Array.isArray(input?.items) || input.items.length < 1 || input.items.length > 30) return { ok: false, error: 'Your cart is invalid.' };

  const merged = new Map();
  for (const line of input.items) {
    const product = getProduct(line?.productId);
    const size = getSize(line?.sizeId);
    const quantity = Number(line?.quantity);
    if (!product || !size || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return { ok: false, error: 'One or more cart items are invalid.' };
    }
    const key = `${product.id}:${size.id}`;
    const mergedQuantity = (merged.get(key) || 0) + quantity;
    if (mergedQuantity > 20) return { ok: false, error: 'A product size can be ordered up to 20 units at a time.' };
    merged.set(key, mergedQuantity);
  }

  const items = [];
  let subtotal = 0;
  let totalProductWeight = 0;
  for (const [key, quantity] of merged) {
    const [productId, sizeId] = key.split(':');
    const product = getProduct(productId);
    const size = getSize(sizeId);
    subtotal += size.price * quantity;
    totalProductWeight += size.weight * quantity;
    items.push({
      productId: product.id,
      name: `${product.name} ${size.label}`,
      sizeId: size.id,
      size: size.label,
      quantity,
      price: size.price,
      weight: size.weight,
    });
  }

  const totalWeight = Number((PACKAGING_WEIGHT + totalProductWeight).toFixed(2));
  const quote = shippingQuote({ courier, region: customerResult.customer.region, totalWeight });
  if (!quote.zone) return { ok: false, error: 'Unable to calculate shipping for that region.' };

  const shipping = { courier, fee: quote.fee, weight: totalWeight, zone: quote.zone, mode: 'TEST_ASSUMED' };
  const total = subtotal + shipping.fee;
  return {
    ok: true,
    order: {
      customer: customerResult.customer,
      items,
      subtotal,
      shipping,
      total,
      currency: 'PHP',
    },
  };
}
