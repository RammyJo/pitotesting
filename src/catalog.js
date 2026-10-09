export const SIZES = Object.freeze([
  { id: '10', label: '10mL', price: 120, weight: 0.12 },
  { id: '30', label: '30mL', price: 350, weight: 0.17 },
  { id: '50', label: '50mL', price: 600, weight: 0.22 },
]);

export const PRODUCTS = Object.freeze([
  { id: 'omega', name: 'OMEGA', gender: 'men', description: 'Bold signature built for confidence and presence.', tags: ['Signature', 'Confident', 'Bold'] },
  { id: 'boaz', name: 'BOAZ', gender: 'men', description: 'Strong, polished and made to leave a mark.', tags: ['Signature', 'Strong', 'Polished'] },
  { id: 'alpha', name: 'ALPHA', gender: 'men', description: 'Warm, confident and refined.', tags: ['Confident', 'Warm', 'Refined'] },
  { id: 'exodus-noir', name: 'EXODUS NOIR', gender: 'men', description: 'Dark and magnetic, with pear, lavender, cinnamon, vanilla and amber.', tags: ['Dark', 'Magnetic', 'Warm'] },
  { id: 'pacific', name: 'PACIFIC', gender: 'men', description: 'Fresh, clean and effortless for everyday wear.', tags: ['Fresh', 'Clean', 'Everyday'] },
  { id: 'invincible', name: 'INVINCIBLE', gender: 'men', description: 'Powerful and self-assured with a lasting character.', tags: ['Powerful', 'Bold', 'Confident'] },
  { id: 'caelum', name: 'CAELUM', gender: 'men', description: 'Crisp, elevated and composed.', tags: ['Crisp', 'Elevated', 'Clean'] },
  { id: 'gourmand', name: 'GOURMAND', gender: 'women', description: 'Sweet, rich and inviting.', tags: ['Sweet', 'Rich', 'Inviting'] },
  { id: 'solace', name: 'SOLACE', gender: 'women', description: 'Soft, graceful and understated.', tags: ['Soft', 'Elegant', 'Refined'] },
  { id: 'hadar', name: 'HADAR', gender: 'women', description: 'Bright, elegant and memorable.', tags: ['Bright', 'Elegant', 'Memorable'] },
  { id: 'darling', name: 'DARLING', gender: 'women', description: 'Playful, warm and charming.', tags: ['Playful', 'Warm', 'Charming'] },
  { id: 'asmira', name: 'ASMIRA', gender: 'women', description: 'Smooth, feminine and refined.', tags: ['Smooth', 'Feminine', 'Refined'] },
  { id: 'elan', name: 'ELAN', gender: 'women', description: 'Clean sophistication with effortless character.', tags: ['Clean', 'Sophisticated', 'Elegant'] },
]);

export const REGION_ZONE = Object.freeze({
  'National Capital Region': 'NCR',
  'Cordillera Administrative Region': 'Luzon',
  'Ilocos Region': 'Luzon',
  'Cagayan Valley': 'Luzon',
  'Central Luzon': 'Luzon',
  'CALABARZON': 'Luzon',
  'MIMAROPA': 'Luzon',
  'Bicol Region': 'Luzon',
  'Western Visayas': 'Visayas',
  'Central Visayas': 'Visayas',
  'Eastern Visayas': 'Visayas',
  'Zamboanga Peninsula': 'Mindanao',
  'Northern Mindanao': 'Mindanao',
  'Davao Region': 'Mindanao',
  'SOCCSKSARGEN': 'Mindanao',
  'Caraga': 'Mindanao',
  'Bangsamoro Autonomous Region in Muslim Mindanao': 'Mindanao',
});

export const RATES = Object.freeze({
  JNT: Object.freeze({ NCR: 85, Luzon: 100, Visayas: 135, Mindanao: 155 }),
  LBC: Object.freeze({ NCR: 95, Luzon: 110, Visayas: 145, Mindanao: 165 }),
});

export const PACKAGING_WEIGHT = 0.10;

export function getProduct(productId) {
  return PRODUCTS.find((product) => product.id === productId) || null;
}

export function getSize(sizeId) {
  return SIZES.find((size) => size.id === String(sizeId)) || null;
}

export function shippingQuote({ courier, region, totalWeight }) {
  const normalizedCourier = String(courier || '').toUpperCase();
  const zone = REGION_ZONE[region];
  if (!RATES[normalizedCourier] || !zone) {
    return { courier: normalizedCourier || null, zone: zone || null, fee: 0 };
  }
  const base = RATES[normalizedCourier][zone];
  const extraHalfKilos = Math.max(0, Math.ceil(Math.max(0, totalWeight - 0.5) / 0.5));
  const extraRate = normalizedCourier === 'LBC' ? 20 : 15;
  return {
    courier: normalizedCourier,
    zone,
    fee: base + extraHalfKilos * extraRate,
  };
}
