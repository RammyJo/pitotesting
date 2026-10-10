import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile, access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { buildOrder } from './src/order.js';
import { PRODUCTS, SIZES, REGION_ZONE, RATES, PACKAGING_WEIGHT } from './src/catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'orders.json');
const PORT = Number(process.env.PORT || 4173);
const ADMIN_TOKEN = String(process.env.ADMIN_TOKEN || '').trim();
const MAX_BODY_BYTES = 50_000;

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
};

async function ensureDataFile() {
  await access(DATA_DIR, fsConstants.F_OK).catch(async () => {
    const { mkdir } = await import('node:fs/promises');
    await mkdir(DATA_DIR, { recursive: true });
  });
  await access(DATA_FILE, fsConstants.F_OK).catch(() => writeFile(DATA_FILE, '[]', 'utf8'));
}
async function readOrders() {
  try { return JSON.parse(await readFile(DATA_FILE, 'utf8') || '[]'); }
  catch { return []; }
}
async function saveOrders(orders) { await writeFile(DATA_FILE, JSON.stringify(orders, null, 2), 'utf8'); }
function sendJson(res, status, data) {
  res.writeHead(status, { ...securityHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}
function safeStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded === '/' ? '/index.html' : decoded === '/admin' ? '/admin.html' : decoded;
  const full = path.resolve(ROOT, `.${relative}`);
  const rootWithSep = `${ROOT}${path.sep}`;
  if (full !== ROOT && !full.startsWith(rootWithSep)) return null;
  return full;
}
function authorized(req) {
  if (!ADMIN_TOKEN) return false;
  return req.headers.authorization === `Bearer ${ADMIN_TOKEN}`;
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  return origin === `http://localhost:${PORT}` || origin === `http://127.0.0.1:${PORT}`;
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let total = 0; let raw = '';
    req.on('data', chunk => { total += chunk.length; if (total <= MAX_BODY_BYTES) raw += chunk; });
    req.on('end', () => {
      if (total > MAX_BODY_BYTES) return reject(new Error('REQUEST_TOO_LARGE'));
      try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('INVALID_JSON')); }
    });
    req.on('error', reject);
  });
}

await ensureDataFile();
const rateWindow = new Map();
const adminWindow = new Map();
function rateLimited(map, ip, limit) {
  const now = Date.now();
  const recent = (map.get(ip) || []).filter(t => now - t < 60_000);
  recent.push(now);
  if (map.size > 10000) { for (const [key, values] of map) { if (!values.some(t => now - t < 60_000)) map.delete(key); if (map.size <= 5000) break; } }
  map.set(ip, recent);
  return recent.length > limit;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const ip = req.socket.remoteAddress || 'unknown';

    if (url.pathname.startsWith('/api/')) {
      if (!sameOrigin(req)) return sendJson(res, 403, { error: 'Cross-origin request denied.' });
      if (url.pathname === '/api/health' && req.method === 'GET') return sendJson(res, 200, { ok: true, mode: 'TEST', service: 'seven-perfume' });
      if (url.pathname === '/api/catalog' && req.method === 'GET') return sendJson(res, 200, { products: PRODUCTS, sizes: SIZES, regionZone: REGION_ZONE, rates: RATES, packagingWeight: PACKAGING_WEIGHT, testMode: true });

      if (url.pathname === '/api/orders' && req.method === 'GET') {
        if (rateLimited(adminWindow, ip, 8)) return sendJson(res, 429, { error: 'Too many admin attempts. Please wait a moment.' });
        if (!authorized(req)) return sendJson(res, ADMIN_TOKEN ? 401 : 503, { error: ADMIN_TOKEN ? 'Unauthorized.' : 'Admin access is not configured.' });
        const orders = await readOrders();
        return sendJson(res, 200, { orders: orders.reverse(), testMode: true });
      }
      if (url.pathname === '/api/orders' && req.method === 'DELETE') {
        if (rateLimited(adminWindow, ip, 8)) return sendJson(res, 429, { error: 'Too many admin attempts. Please wait a moment.' });
        if (!authorized(req)) return sendJson(res, ADMIN_TOKEN ? 401 : 503, { error: ADMIN_TOKEN ? 'Unauthorized.' : 'Admin access is not configured.' });
        await saveOrders([]); return sendJson(res, 200, { ok: true, testMode: true });
      }
      if (url.pathname === '/api/orders' && req.method === 'POST') {
        if (rateLimited(rateWindow, ip, 12)) return sendJson(res, 429, { error: 'Too many order attempts. Please wait a moment and try again.' });
        let body;
        try { body = await readBody(req); }
        catch (e) { return sendJson(res, e.message === 'REQUEST_TOO_LARGE' ? 413 : 400, { error: e.message === 'REQUEST_TOO_LARGE' ? 'Request too large.' : 'Invalid JSON.' }); }
        const result = buildOrder(body);
        if (!result.ok) return sendJson(res, 400, { error: result.error });
        const order = { id: `SP-${randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`, createdAt: new Date().toISOString(), paymentStatus: 'TEST_PAID', orderStatus: 'PROCESSING', ...result.order, mode: 'TEST' };
        const orders = await readOrders(); orders.push(order); await saveOrders(orders);
        return sendJson(res, 201, { order, testMode: true });
      }
      return sendJson(res, 404, { error: 'Not found.' });
    }

    if (!['GET', 'HEAD'].includes(req.method)) return sendJson(res, 405, { error: 'Method not allowed.' });
    const full = safeStaticPath(url.pathname);
    if (!full) return sendJson(res, 403, { error: 'Forbidden.' });
    try {
      const data = await readFile(full);
      const ext = path.extname(full).toLowerCase();
      const type = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.txt':'text/plain; charset=utf-8' }[ext] || 'application/octet-stream';
      res.writeHead(200, { ...securityHeaders, 'Content-Type': type, 'Cache-Control': ext === '.html' || ext === '.js' || ext === '.css' ? 'no-cache' : 'public, max-age=3600' });
      if (req.method !== 'HEAD') res.end(data); else res.end();
    } catch { sendJson(res, 404, { error: 'Not found.' }); }
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: 'Internal server error.' });
  }
});

server.listen(PORT, () => {
  console.log(`Seven Perfume test server: http://localhost:${PORT}`);
  console.log(ADMIN_TOKEN ? `Test admin token: ${ADMIN_TOKEN}` : 'ADMIN_TOKEN is not set. Admin API is disabled.');
});
