import { PRODUCTS, SIZES, REGION_ZONE, RATES, PACKAGING_WEIGHT } from './catalog.js';
import { buildOrder } from './order.js';

const orders = globalThis.__SEVEN_TEST_ORDERS__ || [];
globalThis.__SEVEN_TEST_ORDERS__ = orders;
const requestWindow = new Map();
const adminWindow = new Map();
const MAX_BODY_BYTES = 50_000;
const RATE_WINDOW_MS = 60_000;
const MAX_ORDER_REQUESTS = 12;

const securityHeaders = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...securityHeaders,
      'content-type': 'application/json; charset=UTF-8',
      'cache-control': 'no-store',
    },
  });
}

function secure(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(securityHeaders)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown';
}

function sameOrigin(request, url) {
  const origin = request.headers.get('Origin');
  return !origin || origin === url.origin;
}

function adminAuthorized(request, env) {
  const token = String(env.ADMIN_TOKEN || '').trim();
  if (!token) return false;
  const auth = request.headers.get('Authorization') || '';
  return auth === `Bearer ${token}`;
}

async function readJson(request) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY_BYTES) return { ok: false, response: json({ error: 'Request too large.' }, 413) };
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return { ok: false, response: json({ error: 'Request too large.' }, 413) };
  try { return { ok: true, data: JSON.parse(raw) }; }
  catch { return { ok: false, response: json({ error: 'Invalid JSON.' }, 400) }; }
}

function rateLimited(map, ip, limit) {
  const now = Date.now();
  const existing = map.get(ip) || [];
  const recent = existing.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  recent.push(now);
  if (map.size > 10000) {
    for (const [key, values] of map) {
      if (!values.some((timestamp) => now - timestamp < RATE_WINDOW_MS)) map.delete(key);
      if (map.size <= 5000) break;
    }
  }
  map.set(ip, recent);
  return recent.length > limit;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith('/api/')) {
      if (!sameOrigin(request, url)) return json({ error: 'Cross-origin request denied.' }, 403);

      if (path === '/api/health' && request.method === 'GET') {
        return json({ ok: true, mode: 'TEST', service: 'seven-perfume' });
      }

      if (path === '/api/catalog' && request.method === 'GET') {
        return json({ products: PRODUCTS, sizes: SIZES, regionZone: REGION_ZONE, rates: RATES, packagingWeight: PACKAGING_WEIGHT, testMode: true });
      }

      if (path === '/api/orders' && request.method === 'GET') {
        if (rateLimited(adminWindow, clientIp(request), 8)) return json({ error: 'Too many admin attempts. Please wait a moment.' }, 429);
        if (!adminAuthorized(request, env)) return json({ error: env.ADMIN_TOKEN ? 'Unauthorized.' : 'Admin access is not configured.' }, env.ADMIN_TOKEN ? 401 : 503);
        return json({ orders: [...orders].reverse(), testMode: true });
      }

      if (path === '/api/orders' && request.method === 'DELETE') {
        if (rateLimited(adminWindow, clientIp(request), 8)) return json({ error: 'Too many admin attempts. Please wait a moment.' }, 429);
        if (!adminAuthorized(request, env)) return json({ error: env.ADMIN_TOKEN ? 'Unauthorized.' : 'Admin access is not configured.' }, env.ADMIN_TOKEN ? 401 : 503);
        orders.length = 0;
        return json({ ok: true, testMode: true });
      }

      if (path === '/api/orders' && request.method === 'POST') {
        if (rateLimited(requestWindow, clientIp(request), MAX_ORDER_REQUESTS)) return json({ error: 'Too many order attempts. Please wait a moment and try again.' }, 429);
        const parsed = await readJson(request);
        if (!parsed.ok) return parsed.response;
        const result = buildOrder(parsed.data);
        if (!result.ok) return json({ error: result.error }, 400);
        const order = {
          id: `SP-${crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`,
          createdAt: new Date().toISOString(),
          paymentStatus: 'TEST_PAID',
          orderStatus: 'PROCESSING',
          ...result.order,
          mode: 'TEST',
        };
        orders.push(order);
        return json({ order, testMode: true }, 201);
      }

      return json({ error: 'Not found.' }, 404);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json({ error: 'Method not allowed.' }, 405);
    }

    if (path === '/admin') return Response.redirect(new URL('/admin.html', url), 302);
    return secure(await env.ASSETS.fetch(request));
  },
};
